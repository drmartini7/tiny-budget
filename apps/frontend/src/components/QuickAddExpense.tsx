import { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  Button, 
  TextInput, 
  NumberInput, 
  Select, 
  Stack, 
  Group,
  ActionIcon,
  Tooltip,
  Autocomplete
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus, IconCurrencyDollar } from '@tabler/icons-react';
import type { Budget, CreateTransactionDto, TransactionType } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useCreateTransaction } from '../hooks/useBudgets';
import { usePayees } from '../hooks/usePayees';

interface QuickAddExpenseProps {
  budgets: Budget[];
  onExpenseAdded: () => void;
}

export function QuickAddExpense({ budgets, onExpenseAdded }: QuickAddExpenseProps) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const createTransaction = useCreateTransaction();
  const budgetSelectRef = useRef<HTMLInputElement>(null);
  
  // Payee state
  const [payeeSearch, setPayeeSearch] = useState('');
  const { data: payees = [] } = usePayees(payeeSearch);

  useEffect(() => {
    if (opened) {
      setTimeout(() => {
        budgetSelectRef.current?.focus();
      }, 100);
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      budgetId: budgets.length > 0 ? budgets[0].id : '',
      amount: 0,
      description: '',
      payeeName: '',
      date: new Date(),
      installments: 1,
    },
    validate: {
      budgetId: (value) => (value ? null : t('validation.required')),
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
      description: (value) => (value.trim().length > 0 ? null : t('validation.required')),
      installments: (value) => (value >= 1 ? null : t('validation.minOne')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const transactionData: CreateTransactionDto = {
        budgetId: values.budgetId,
        amount: -Math.abs(values.amount), // Make negative for expense
        date: values.date,
        description: values.description,
        payeeName: values.payeeName,
        type: 'EXPENSE' as unknown as TransactionType,
        installments: values.installments > 1 ? values.installments : undefined,
      };
      
      await createTransaction.mutateAsync(transactionData);
      setOpened(false);
      form.reset();
      setPayeeSearch('');
      onExpenseAdded();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const budgetOptions = budgets.map(budget => ({
    value: budget.id,
    label: budget.name,
  }));
  
  const payeeOptions = payees.map(p => p.name);

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
              ref={budgetSelectRef}
              label={t('expense.budget')}
              placeholder={t('expense.selectBudget')}
              data={budgetOptions}
              searchable
              nothingFoundMessage={t('budget.noBudgets')}
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

            <NumberInput
              label={t('expense.installments')}
              placeholder="1"
              min={1}
              {...form.getInputProps('installments')}
            />
            
            <DateInput
              label={t('expense.date')}
              placeholder={t('expense.datePlaceholder')}
              {...form.getInputProps('date')}
            />

            <TextInput
              label={t('expense.description')}
              placeholder={t('expense.descriptionPlaceholder')}
              {...form.getInputProps('description')}
            />
            
            <Autocomplete
              label={t('expense.merchant')} // Reusing merchant label for now
              placeholder={t('expense.merchantPlaceholder')}
              data={payeeOptions}
              value={form.values.payeeName}
              onChange={(value) => {
                form.setFieldValue('payeeName', value);
                setPayeeSearch(value);
              }}
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
