package com.ticketing.order.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PagedResponse<T> {
    List<T> items;
    int page;
    int size;
    long totalItems;
    int totalPages;
}
