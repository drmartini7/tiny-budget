import { useState } from 'react';
import { Card, Group, Text, Stack, Select, Badge, ScrollArea } from '@mantine/core';
import type { BudgetWithDetails } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionListProps {
  budgets: BudgetWithDetails[];
}

export function TransactionList({ budgets }: TransactionListProps) {
  const { t } = useTranslation();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  
  const { data: transactions = [] } = useTransactions(selectedBudgetId);

  const budgetOptions = budgets.map(budget => ({
    value: budget.id,
    label: budget.name,
  }));

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
      <Select
        label={t('transaction.selectBudget')}
        placeholder={t('transaction.selectBudgetPlaceholder')}
        data={budgetOptions}
        value={selectedBudgetId}
        onChange={(value) => setSelectedBudgetId(value || '')}
        clearable
      />

      {selectedBudgetId && (
        <Card withBorder>
          <Stack gap="sm">
            <Text size="lg" fw={500}>{t('transaction.recentTransactions')}</Text>
            
            {transactions.length === 0 ? (
              <Text c="dimmed" ta="center">
                {t('transaction.noTransactions')}
              </Text>
            ) : (
              <ScrollArea h={400}>
                <Stack gap="sm">
                  {transactions.map((transaction) => {
                    const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
                    
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
                            <Badge 
                              color={getTransactionTypeColor(transaction.amount)}
                              variant="light"
                            >
                              {getTransactionTypeLabel(transaction.amount)}
                            </Badge>
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
