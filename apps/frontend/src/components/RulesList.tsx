import { useState } from 'react';
import { Card, Stack, Text, Select, Group, Button, Badge } from '@mantine/core';
import type { BudgetWithDetails, Rule } from '@fun-budget/domain';
import { useRules } from '../hooks/useRules';
import { useExecuteRules } from '../hooks/useBudgets';
import { useTranslation } from 'react-i18next';

interface RulesListProps {
  budgets: BudgetWithDetails[];
}

export function RulesList({ budgets }: RulesListProps) {
  const { t } = useTranslation();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [showDisabled, setShowDisabled] = useState<boolean>(false);
  const { data: rules = [], refetch } = useRules(selectedBudgetId, showDisabled);
  const executeRules = useExecuteRules();

  const budgetOptions = budgets.map((b) => ({ value: b.id, label: b.name }));

  const runNow = async () => {
    if (!selectedBudgetId) return;
    await executeRules.mutateAsync(selectedBudgetId);
    refetch();
  };

  return (
    <Stack gap="md">
      <Select
        label={t('rules.selectBudgetToView')}
        placeholder={t('rules.selectBudgets')}
        data={budgetOptions}
        value={selectedBudgetId}
        onChange={(value) => setSelectedBudgetId(value || '')}
        clearable
      />

      <Card withBorder>
        <Stack gap="sm">
          <Group justify="apart">
            <Text size="lg" fw={500}>{t('rules.listTitle')}</Text>
            <Group>
              <Select
                label={t('rules.showDisabled')}
                data={[
                  { value: 'false', label: t('common.no') },
                  { value: 'true', label: t('common.yes') },
                ]}
                value={showDisabled ? 'true' : 'false'}
                onChange={(v) => setShowDisabled(v === 'true')}
              />
              <Button onClick={runNow} loading={executeRules.isPending} disabled={!selectedBudgetId}>
                {t('rules.executeNow')}
              </Button>
            </Group>
          </Group>

          {rules.length === 0 ? (
            <Text c="dimmed" ta="center">{t('rules.noRules')}</Text>
          ) : (
            <Stack gap="sm">
              {(rules as Rule[]).map((rule) => (
                <Card key={rule.id} withBorder p="sm">
                  <Group justify="apart">
                    <Stack gap={0}>
                      <Text fw={500}>{rule.description || t('rules.defaultDescription')}</Text>
                      <Text size="sm" c="dimmed">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rule.amount)}
                      </Text>
                    </Stack>
                    <Stack gap={0} align="end">
                      <Badge variant="light">
                        {t(`period.${String(rule.frequency).toLowerCase()}`)}
                      </Badge>
                      {String(rule.frequency) === 'MONTHLY' && (
                        <Text size="xs" c="dimmed">
                          {t('rules.executionDay')}: {rule.executionDay}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
