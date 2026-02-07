import { useState } from 'react';
import { Card, Group, Text, Stack, Badge, ScrollArea, ActionIcon, Loader, Center } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { BudgetWithDetails } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';
import { useDeleteTransaction } from '../hooks/useBudgets';
import { TransactionFilters, TransactionFiltersState } from './TransactionFilters';

interface TransactionListProps {
  budgets: BudgetWithDetails[];
}

export function TransactionList({ budgets }: TransactionListProps) {
  const { t } = useTranslation();
  
  const [filters, setFilters] = useState<TransactionFiltersState>({
    budgetId: '',
    startDate: null,
    endDate: null,
    search: '',
    pastOnly: false,
  });
  
  const { data: transactions = [], isPending } = useTransactions(filters.budgetId, {
    startDate: filters.startDate,
    endDate: filters.endDate,
    search: filters.search,
    pastOnly: filters.pastOnly,
  });
  
  const deleteTransaction = useDeleteTransaction();

  const budgetOptions = budgets.map(budget => ({
    value: budget.id,
    label: budget.name,
  }));

  const handleClearFilters = () => {
    setFilters({
      budgetId: filters.budgetId, // Keep budget selected
      startDate: null,
      endDate: null,
      search: '',
      pastOnly: false,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getTransactionTypeColor = (amount: number) => {
    return amount >= 0 ? 'green' : 'red';
  };

  const getTransactionTypeLabel = (amount: number) => {
    return amount >= 0 ? t('transaction.income') : t('transaction.expense');
  };

  return (
    <Stack gap="md">
      <TransactionFilters
        budgets={budgetOptions}
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {filters.budgetId && (
        <Card withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
                <Text size="lg" fw={500}>{t('transaction.recentTransactions')}</Text>
                <Badge variant="light" color="gray">{transactions.length}</Badge>
            </Group>
            
            {isPending ? (
                 <Center p="xl">
                    <Loader />
                 </Center>
            ) : transactions.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                {t('transaction.noTransactions')}
              </Text>
            ) : (
              <ScrollArea h={500}>
                <Stack gap="sm">
                  {transactions.map((transaction) => {
                    const selectedBudget = budgets.find(b => b.id === filters.budgetId);
                    
                    return (
                      <Card key={transaction.id} withBorder p="sm">
                        <Group justify="apart">
                          <Stack gap={0}>
                            <Text fw={500}>{transaction.description}</Text>
                            {transaction.merchant && (
                              <Text size="sm" c="dimmed">
                                {transaction.merchant}
                              </Text>
                            )}
                            <Text size="xs" c="dimmed">
                              {new Date(transaction.date).toLocaleDateString()}
                            </Text>
                          </Stack>
                          
                          <Stack gap={0} align="end">
                            <Group gap="xs">
                              <Badge 
                                color={getTransactionTypeColor(transaction.amount)}
                                variant="light"
                              >
                                {getTransactionTypeLabel(transaction.amount)}
                              </Badge>
                              <ActionIcon 
                                color="red" 
                                variant="subtle" 
                                onClick={() => deleteTransaction.mutate({ budgetId: filters.budgetId, transactionId: transaction.id })}
                                loading={deleteTransaction.isPending}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                            <Text 
                              size="lg" 
                              fw={600}
                              color={getTransactionTypeColor(transaction.amount)}
                            >
                              {formatCurrency(transaction.amount, selectedBudget?.currency || 'USD')}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
