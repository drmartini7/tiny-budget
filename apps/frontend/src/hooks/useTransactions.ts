import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@fun-budget/domain';

const API_BASE = '/api';

async function fetchTransactions(budgetId: string): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE}/budgets/${budgetId}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export function useTransactions(budgetId: string) {
  return useQuery({
    queryKey: ['transactions', budgetId],
    queryFn: () => fetchTransactions(budgetId),
    enabled: !!budgetId,
  });
}