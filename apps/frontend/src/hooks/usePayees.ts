import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Payee, CreatePayeeDto, UpdatePayeeDto } from '@fun-budget/domain';

const API_BASE = '/api';

async function fetchPayees(search?: string): Promise<Payee[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/payees?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch payees');
  return response.json();
}

async function createPayee(data: CreatePayeeDto): Promise<Payee> {
  const response = await fetch(`${API_BASE}/payees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create payee');
  return response.json();
}

async function updatePayee({ id, data }: { id: string; data: UpdatePayeeDto }): Promise<Payee> {
  const response = await fetch(`${API_BASE}/payees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update payee');
  return response.json();
}

async function deletePayee(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/payees/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete payee');
}

export function usePayees(search?: string) {
  return useQuery({
    queryKey: ['payees', search],
    queryFn: () => fetchPayees(search),
  });
}

export function useCreatePayee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] });
    },
  });
}

export function useUpdatePayee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] });
    },
  });
}

export function useDeletePayee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePayee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payees'] });
    },
  });
}
