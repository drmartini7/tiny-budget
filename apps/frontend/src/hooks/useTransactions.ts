import { useQuery } from '@tanstack/react-query';
import { TransactionWithDetails } from '@fun-budget/domain';

const API_BASE = '/api';

export interface TransactionFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  pastOnly?: boolean;
}

async function fetchTransactions(budgetId: string, filters?: TransactionFilters): Promise<TransactionWithDetails[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.pastOnly) params.append('pastOnly', 'true');

  const response = await fetch(`${API_BASE}/budgets/${budgetId}/transactions?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export function useTransactions(budgetId: string, filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', budgetId, filters],
    queryFn: () => fetchTransactions(budgetId, filters),
    enabled: !!budgetId,
  });
}