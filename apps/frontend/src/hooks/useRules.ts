import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateRuleDto, Rule, UpdateRuleDto } from '@fun-budget/domain';

const API_BASE = '/api';

async function createRule(data: CreateRuleDto): Promise<Rule> {
  const response = await fetch(`${API_BASE}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create rule');
  return response.json();
}

async function updateRule({ id, data }: { id: string; data: UpdateRuleDto }): Promise<Rule> {
  const response = await fetch(`${API_BASE}/rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update rule');
  return response.json();
}

async function deleteRule(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/rules/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete rule');
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useRules(budgetId?: string, includeDisabled = false) {
  return useQuery({
    queryKey: ['rules', budgetId, includeDisabled],
    queryFn: async () => {
      if (!budgetId) return [];
      const response = await fetch(`${API_BASE}/rules/budget/${budgetId}?includeDisabled=${includeDisabled}`);
      if (!response.ok) throw new Error('Failed to fetch rules');
      return response.json();
    },
    enabled: !!budgetId,
  });
}
