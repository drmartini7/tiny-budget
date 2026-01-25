import { useState } from 'react';
import { Modal, Button, TextInput, NumberInput, Stack, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import type { CreateTransactionDto, TransactionType } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useCreateTransaction } from '../hooks/useBudgets';

interface QuickAddIncomeProps {
  budgetId: string;
  currency?: string;
  onAdded?: () => void;
  label?: string;
}

export function QuickAddIncome({ budgetId, onAdded, label }: QuickAddIncomeProps) {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const createTransaction = useCreateTransaction();

  const form = useForm({
    initialValues: {
      amount: 0,
      description: '',
      date: new Date(),
    },
    validate: {
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
      description: (value) => (value.trim().length > 0 ? null : t('validation.required')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const transactionData: CreateTransactionDto = {
        budgetId,
        amount: Math.abs(values.amount),
        description: values.description,
        date: values.date,
        type: 'INCOME' as unknown as TransactionType,
      };
      await createTransaction.mutateAsync(transactionData);
      setOpened(false);
      form.reset();
      onAdded?.();
    } catch (error) {
      console.error('Failed to add funds:', error);
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('income.quickAdd')}
        size="sm"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <NumberInput
              label={t('income.amount')}
              placeholder={t('income.amountPlaceholder')}
              min={0}
              step={0.01}
              {...form.getInputProps('amount')}
            />
            <DateInput
              label={t('income.date')}
              placeholder={t('income.datePlaceholder')}
              {...form.getInputProps('date')}
            />
            <TextInput
              label={t('income.description')}
              placeholder={t('income.descriptionPlaceholder')}
              {...form.getInputProps('description')}
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

      <Button size="xs" variant="light" onClick={() => setOpened(true)}>
        {label || t('income.addFunds')}
      </Button>
    </>
  );
}
