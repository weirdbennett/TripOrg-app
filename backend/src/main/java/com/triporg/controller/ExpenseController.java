package com.triporg.controller;

import com.triporg.dto.BudgetSummaryDto;
import com.triporg.dto.ExpenseDto;
import com.triporg.dto.request.CreateExpenseRequest;
import com.triporg.dto.request.UpdateExpenseRequest;
import com.triporg.security.CurrentUser;
import com.triporg.security.UserPrincipal;
import com.triporg.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    
    private final ExpenseService expenseService;
    
    @GetMapping
    public ResponseEntity<Map<String, List<ExpenseDto>>> getExpenses(
            @PathVariable String tripId,
            @CurrentUser UserPrincipal principal) {
        List<ExpenseDto> expenses = expenseService.getExpenses(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("expenses", expenses));
    }
    
    @PostMapping
    public ResponseEntity<Map<String, ExpenseDto>> createExpense(
            @PathVariable String tripId,
            @Valid @RequestBody CreateExpenseRequest request,
            @CurrentUser UserPrincipal principal) {
        ExpenseDto expense = expenseService.createExpense(tripId, request, principal.getId());
        return ResponseEntity.ok(Map.of("expense", expense));
    }
    
    @PutMapping("/{expenseId}")
    public ResponseEntity<Map<String, ExpenseDto>> updateExpense(
            @PathVariable String tripId,
            @PathVariable String expenseId,
            @RequestBody UpdateExpenseRequest request,
            @CurrentUser UserPrincipal principal) {
        ExpenseDto expense = expenseService.updateExpense(tripId, expenseId, request, principal.getId());
        return ResponseEntity.ok(Map.of("expense", expense));
    }
    
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Map<String, Boolean>> deleteExpense(
            @PathVariable String tripId,
            @PathVariable String expenseId,
            @CurrentUser UserPrincipal principal) {
        expenseService.deleteExpense(tripId, expenseId, principal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}

@RestController
@RequestMapping("/api/v1/trips/{tripId}/budget")
@RequiredArgsConstructor
class BudgetController {
    
    private final ExpenseService expenseService;
    
    @GetMapping
    public ResponseEntity<Map<String, BudgetSummaryDto>> getBudget(
            @PathVariable String tripId,
            @CurrentUser UserPrincipal principal) {
        BudgetSummaryDto summary = expenseService.getBudgetSummary(tripId, principal.getId());
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}


