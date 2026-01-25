import { useState } from 'react';
import { 
  Modal, 
  Button, 
  TextInput, 
  NumberInput, 
  Select, 
  Stack, 
  Group,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconCurrencyDollar } from '@tabler/icons-react';
import type { Budget, CreateTransactionDto, TransactionType } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useCreateTransaction } from '../hooks/useBudgets';

interface QuickAddExpenseProps {
  budgets: Budget[];
  onExpenseAdded: () => void;
}

export function QuickAddExpense({ budgets, onExpenseAdded }: QuickAddExpenseProps) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const createTransaction = useCreateTransaction();

  const form = useForm({
    initialValues: {
      budgetId: budgets.length > 0 ? budgets[0].id : '',
      amount: 0,
      description: '',
      merchant: '',
      date: new Date(),
    },
    validate: {
      budgetId: (value) => (value ? null : t('validation.required')),
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
      description: (value) => (value.trim().length > 0 ? null : t('validation.required')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const transactionData: CreateTransactionDto = {
        ...values,
        type: 'EXPENSE' as unknown as TransactionType,
        amount: -Math.abs(values.amount), // Make negative for expense
      };
      
      await createTransaction.mutateAsync(transactionData);
      setOpened(false);
      form.reset();
      onExpenseAdded();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const budgetOptions = budgets.map(budget => ({
    value: budget.id,
    label: budget.name,
  }));

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('expense.quickAdd')}
        size="sm"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label={t('expense.budget')}
              placeholder={t('expense.selectBudget')}
              data={budgetOptions}
              {...form.getInputProps('budgetId')}
            />
            
            <NumberInput
              label={t('expense.amount')}
              placeholder={t('expense.amountPlaceholder')}
              min={0}
              step={0.01}
              leftSection={<IconCurrencyDollar size={16} />}
              {...form.getInputProps('amount')}
            />
            
            <TextInput
              label={t('expense.description')}
              placeholder={t('expense.descriptionPlaceholder')}
              {...form.getInputProps('description')}
            />
            
            <TextInput
              label={t('expense.merchant')}
              placeholder={t('expense.merchantPlaceholder')}
              {...form.getInputProps('merchant')}
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setOpened(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={createTransaction.isPending}>
                {t('common.add')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Tooltip label={t('expense.quickAddTooltip')}>
        <ActionIcon
          size="lg"
          radius="md"
          variant="filled"
          onClick={() => setOpened(true)}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
