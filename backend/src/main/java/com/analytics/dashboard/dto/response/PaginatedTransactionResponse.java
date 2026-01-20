package com.analytics.dashboard.dto.response;

import java.util.List;

/**
 * Response DTO for paginated transaction table.
 * Contains page metadata and transaction list.
 */
public class PaginatedTransactionResponse {
    private List<TransactionTableResponse> transactions;
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

    public PaginatedTransactionResponse(List<TransactionTableResponse> transactions,
                                      int currentPage, int pageSize,
                                      long totalElements, int totalPages,
                                      boolean hasNext, boolean hasPrevious) {
        this.transactions = transactions;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
    }

    // Getters
    public List<TransactionTableResponse> getTransactions() { return transactions; }
    public int getCurrentPage() { return currentPage; }
    public int getPageSize() { return pageSize; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public boolean isHasNext() { return hasNext; }
    public boolean isHasPrevious() { return hasPrevious; }
}
