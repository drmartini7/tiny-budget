import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateRuleDto, Rule } from '@fun-budget/domain';

const API_BASE = 'http://localhost:3000';

async function createRule(data: CreateRuleDto): Promise<Rule> {
  const response = await fetch(`${API_BASE}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create rule');
  return response.json();
}

async function fetchRulesByBudget(budgetId: string): Promise<Rule[]> {
  const response = await fetch(`${API_BASE}/rules/budget/${budgetId}`);
  if (!response.ok) throw new Error('Failed to fetch rules');
  return response.json();
}

async function fetchAllRules(): Promise<Rule[]> {
  const response = await fetch(`${API_BASE}/rules`);
  if (!response.ok) throw new Error('Failed to fetch rules');
  return response.json();
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules', (variables as any).budgetId] });
      queryClient.invalidateQueries({ queryKey: ['rules', 'all'] });
    },
  });
}

export function useRules(budgetId: string, includeDisabled = false) {
  return useQuery({
    queryKey: ['rules', budgetId || 'all', includeDisabled],
    queryFn: () => {
      if (budgetId) {
        return fetchRulesByBudget(budgetId);
      }
      return includeDisabled ? fetch(`${API_BASE}/rules?includeDisabled=true`).then(r => r.json()) : fetchAllRules();
    },
    enabled: true,
  });
}
