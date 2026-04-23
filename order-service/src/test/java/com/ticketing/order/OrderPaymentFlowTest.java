package com.ticketing.order;

import com.ticketing.events.payment.PaymentFailedEvent;
import com.ticketing.events.payment.PaymentSucceededEvent;
import com.ticketing.order.dto.CreateOrderRequest;
import com.ticketing.order.dto.OrderResponse;
import com.ticketing.order.entity.OrderStatus;
import com.ticketing.order.event.NotificationEventPublisher;
import com.ticketing.order.event.OrderEventPublisher;
import com.ticketing.order.event.PaymentEventPublisher;
import com.ticketing.order.handler.PaymentEventHandler;
import com.ticketing.order.integration.OrderSeatHoldVerifier;
import com.ticketing.order.integration.ReservationHoldClient;
import com.ticketing.order.repository.OrderRepository;
import com.ticketing.order.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testcontainers-based integration tests for order–payment flow.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class OrderPaymentFlowTest {

    @SuppressWarnings("all")
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("ticketing_orders")
            .withUsername("ticketing")
            .withPassword("ticketing_secret");

    @SuppressWarnings("all")
    @Container
    static final KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    OrderService orderService;

    @Autowired
    PaymentEventHandler paymentEventHandler;

    @Autowired
    OrderRepository orderRepository;

    @MockBean
    PaymentEventPublisher paymentEventPublisher;

    @MockBean
    OrderEventPublisher orderEventPublisher;

    @MockBean
    NotificationEventPublisher notificationEventPublisher;

    @MockBean
    OrderSeatHoldVerifier seatHoldVerifier;

    @MockBean
    ReservationHoldClient reservationHoldClient;

    @Test
    void whenPaymentSucceeded_orderStatusBecomesConfirmed() {
        OrderResponse created = createOrder("hold-1", "seat-A1", "user-1", BigDecimal.valueOf(50.00));

        var succeeded = new PaymentSucceededEvent();
        succeeded.setOrderId(created.getId());
        succeeded.setPaymentId("pay-1");
        paymentEventHandler.handlePaymentSucceeded(succeeded);

        assertThat(orderRepository.findById(created.getId()))
                .isPresent()
                .get()
                .extracting(o -> o.getStatus())
                .isEqualTo(OrderStatus.CONFIRMED);
    }

    @Test
    void whenPaymentFailed_orderStatusBecomesCancelled() {
        OrderResponse created = createOrder("hold-2", "seat-B1", "user-2", BigDecimal.valueOf(30.00));

        var failed = new PaymentFailedEvent();
        failed.setOrderId(created.getId());
        failed.setPaymentId("pay-2");
        failed.setReason("Card declined");
        paymentEventHandler.handlePaymentFailed(failed);

        assertThat(orderRepository.findById(created.getId()))
                .isPresent()
                .get()
                .extracting(o -> o.getStatus())
                .isEqualTo(OrderStatus.CANCELLED);
    }

    private OrderResponse createOrder(String holdId, String seatId, String userId, BigDecimal amount) {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setHoldId(holdId);
        request.setShowId("show-1");
        request.setSeatIds(Set.of(seatId));
        request.setAmount(amount);
        request.setCurrency("USD");

        OrderResponse created = orderService.createOrder(request, userId);
        assertThat(created.getId()).isNotBlank();
        assertThat(orderRepository.findById(created.getId()))
                .isPresent()
                .get()
                .extracting(o -> o.getStatus())
                .isEqualTo(OrderStatus.PAYMENT_PENDING);
        return created;
    }
}

