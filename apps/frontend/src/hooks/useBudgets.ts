import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BudgetWithDetails, CreateBudgetDto, Transaction, CreateTransactionDto } from '@fun-budget/domain';

const API_BASE = '/api';

async function fetchBudgets(includeDisabled = false): Promise<BudgetWithDetails[]> {
  // For now, we'll fetch all budgets. Later we can filter by owner
  const response = await fetch(includeDisabled ? `${API_BASE}/budgets?includeDisabled=true` : `${API_BASE}/budgets`);
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
}

async function fetchBudgetsByOwner(ownerId: string): Promise<BudgetWithDetails[]> {
  const response = await fetch(`${API_BASE}/budgets/owner/${ownerId}`);
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
}

async function createBudget(data: CreateBudgetDto): Promise<BudgetWithDetails> {
  const response = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create budget');
  return response.json();
}

async function createTransaction(data: CreateTransactionDto): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/budgets/${data.budgetId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}

async function deleteTransaction({ budgetId, transactionId }: { budgetId: string; transactionId: string }): Promise<void> {
  const response = await fetch(`${API_BASE}/budgets/${budgetId}/transactions/${transactionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
}

async function executeRules(budgetId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/budgets/${budgetId}/execute-rules`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to execute rules');
  return response.json();
}

async function setBudgetEnabled(id: string, enabled: boolean): Promise<BudgetWithDetails> {
  const response = await fetch(`${API_BASE}/budgets/${id}/enabled`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) throw new Error('Failed to update budget');
  return response.json();
}

export function useBudgets(ownerId?: string, includeDisabled = false) {
  return useQuery({
    queryKey: ['budgets', ownerId, includeDisabled],
    queryFn: () => (ownerId ? fetchBudgetsByOwner(ownerId) : fetchBudgets(includeDisabled)),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.budgetId] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.budgetId] });
    },
  });
}

export function useExecuteRules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: executeRules,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables] });
    },
  });
}

export function useSetBudgetEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => setBudgetEnabled(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
