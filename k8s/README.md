# Kubernetes Deployment

Kubernetes manifests for the ticketing platform.

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- `kubectl` configured
- Container images built and available (see Build Images below)

## Apply Order

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Infrastructure (Postgres, Mongo, Redis, Kafka)
kubectl apply -f infrastructure/

# 3. Wait for infrastructure to be ready, then deploy applications
kubectl apply -f api-gateway-deployment.yaml
kubectl apply -f catalog-service-deployment.yaml
kubectl apply -f availability-service-deployment.yaml
kubectl apply -f reservation-service-deployment.yaml
kubectl apply -f order-service-deployment.yaml
kubectl apply -f payment-service-deployment.yaml
kubectl apply -f notification-service-deployment.yaml

# 4. Ingress (requires ingress controller, e.g. nginx-ingress)
kubectl apply -f ingress.yaml

# 5. Horizontal Pod Autoscalers
kubectl apply -f hpa.yaml
```

## Build Images

Build and push container images before deploying:

```bash
# Using Spring Boot build-image (requires Docker)
mvn spring-boot:build-image -pl api-gateway -Dspring-boot.build-image.imageName=ticketing/api-gateway:1.0.0
mvn spring-boot:build-image -pl catalog-service -Dspring-boot.build-image.imageName=ticketing/catalog-service:1.0.0
# ... repeat for each service

# Or use Jib
mvn compile jib:dockerBuild -pl api-gateway -Djib.image.name=ticketing/api-gateway:1.0.0
```

For minikube, load images directly: `minikube image load ticketing/api-gateway:1.0.0`

## Ingress

The Ingress routes `/api` to the API Gateway. Configure your `/etc/hosts` or DNS:

```
127.0.0.1 ticketing.local
```

Then access: `http://ticketing.local/api/shows`

For minikube: `minikube addons enable ingress` then `minikube tunnel`
