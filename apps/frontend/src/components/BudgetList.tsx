import { useState } from 'react';
import { Card, Group, Text, Badge, Stack, Grid, Modal, ActionIcon, Tooltip, Switch } from '@mantine/core';
import { IconEdit, IconArrowsRightLeft } from '@tabler/icons-react';
import { BudgetWithDetails } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { QuickAddIncome } from './QuickAddIncome';
import { useSetBudgetEnabled } from '../hooks/useBudgets';
import { BudgetForm } from './BudgetForm';
import { TransferModal } from './TransferModal';

interface BudgetListProps {
  budgets: BudgetWithDetails[];
  selectedBudget: BudgetWithDetails | null;
  onBudgetSelect: (budget: BudgetWithDetails | null) => void;
  onBudgetUpdated?: () => void;
  people?: any[]; // Need people for BudgetForm
}

export function BudgetList({ budgets, selectedBudget, onBudgetSelect, onBudgetUpdated, people = [] }: BudgetListProps) {
  const { t } = useTranslation();
  const setEnabled = useSetBudgetEnabled();
  const [editingBudget, setEditingBudget] = useState<BudgetWithDetails | null>(null);
  const [transferSourceBudget, setTransferSourceBudget] = useState<BudgetWithDetails | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getBudgetStatus = (budget: BudgetWithDetails) => {
    if (budget.currentBalance > 0) {
      return { color: 'green', label: t('budget.status.available') };
    } else if (budget.currentBalance === 0) {
      return { color: 'yellow', label: t('budget.status.empty') };
    } else {
      return { color: 'red', label: t('budget.status.overdrawn') };
    }
  };

  return (
    <Stack gap="md">
      <Modal 
        opened={!!editingBudget} 
        onClose={() => setEditingBudget(null)} 
        title={t('budget.edit')}
        size="lg"
      >
        {editingBudget && (
          <BudgetForm
            people={people}
            onSubmit={() => {
              setEditingBudget(null);
              onBudgetUpdated?.();
            }}
            onCancel={() => setEditingBudget(null)}
            initialData={editingBudget}
          />
        )}
      </Modal>

      <TransferModal
        opened={!!transferSourceBudget}
        onClose={() => setTransferSourceBudget(null)}
        budgets={budgets}
        sourceBudgetId={transferSourceBudget?.id}
      />

      {budgets.length === 0 ? (
        <Card withBorder>
          <Text c="dimmed" ta="center">
            {t('budget.noBudgets')}
          </Text>
        </Card>
      ) : (
        <Grid>
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const isSelected = selectedBudget?.id === budget.id;
            
            return (
              <Grid.Col key={budget.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card 
                  withBorder 
                  shadow={isSelected ? 'md' : 'sm'}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
                  }}
                  onClick={() => onBudgetSelect(isSelected ? null : budget)}
                >
                  <Stack gap="xs">
                    <Group justify="apart">
                      <Group gap="xs">
                        <Text fw={500}>{budget.name}</Text>
                        <Tooltip label={t('common.edit')}>
                          <ActionIcon 
                            variant="subtle" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBudget(budget);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                      <Badge color={status.color} variant="light">
                        {status.label}
                      </Badge>
                    </Group>
                    
                    <Text size="sm" c="dimmed">
                      {t('budget.owner')}: {budget.owner.name}
                    </Text>
                    
                    <Text size="sm" c="dimmed">
                      {t('budget.period')}: {t(`period.${budget.periodType.toLowerCase()}`)}
                    </Text>
                    
                    <Group justify="apart" mt="md">
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed">{t('budget.currentBalance')}</Text>
                        <Text size="xl" fw={600} color={budget.currentBalance >= 0 ? 'green' : 'red'}>
                          {formatCurrency(budget.currentBalance, budget.currency)}
                        </Text>
                      </Stack>
                      
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed">{t('budget.overflow')}</Text>
                        <Text size="sm">
                          {t(`overflow.${budget.overflowPolicy.toLowerCase()}`)}
                        </Text>
                      </Stack>
                    </Group>

                    <Group justify="apart" mt="sm">
                      <Group gap="xs">
                        <Switch
                          size="md"
                          onLabel={t('budget.enabled')}
                          offLabel={t('budget.disabled')}
                          checked={budget.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            setEnabled.mutate({ id: budget.id, enabled: e.currentTarget.checked });
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Group>
                      
                      <Group gap="xs">
                        <QuickAddIncome
                          budgetId={budget.id}
                          currency={budget.currency}
                          onAdded={onBudgetUpdated}
                          label={t('income.addFunds')}
                          iconOnly
                        />
                        <Tooltip label={t('budget.transferFunds')}>
                          <ActionIcon 
                            variant="light"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferSourceBudget(budget);
                            }}
                          >
                            <IconArrowsRightLeft size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
