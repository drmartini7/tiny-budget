import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account, CreateAccountDto } from '@fun-budget/domain';

const API_BASE = '/api';

async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE}/accounts`);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
}

async function createAccount(data: CreateAccountDto): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create account');
  return response.json();
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
