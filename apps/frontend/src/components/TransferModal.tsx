import { Modal, Button, Select, NumberInput, TextInput, Stack, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import type { BudgetWithDetails, TransferFundsDto } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useTransferFunds } from '../hooks/useBudgets';
import { IconCurrencyDollar } from '@tabler/icons-react';

interface TransferModalProps {
  opened: boolean;
  onClose: () => void;
  budgets: BudgetWithDetails[];
  sourceBudgetId?: string;
}

export function TransferModal({ opened, onClose, budgets, sourceBudgetId }: TransferModalProps) {
  const { t } = useTranslation();
  const transferFunds = useTransferFunds();

  const form = useForm({
    initialValues: {
      fromBudgetId: sourceBudgetId || (budgets.length > 0 ? budgets[0].id : ''),
      toBudgetId: '',
      amount: 0,
      description: '',
      date: new Date(),
    },
    validate: {
      fromBudgetId: (value) => (value ? null : t('validation.required')),
      toBudgetId: (value, values) => {
        if (!value) return t('validation.required');
        if (value === values.fromBudgetId) return t('validation.sameBudget');
        return null;
      },
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const transferData: TransferFundsDto = {
        fromBudgetId: values.fromBudgetId,
        toBudgetId: values.toBudgetId,
        amount: values.amount,
        description: values.description,
        date: values.date,
      };
      
      await transferFunds.mutateAsync(transferData);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to transfer funds:', error);
    }
  };

  const budgetOptions = budgets.map(budget => ({
    value: budget.id,
    label: budget.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('budget.transferFunds')}
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label={t('transfer.from')}
            placeholder={t('budget.selectBudget')}
            data={budgetOptions}
            {...form.getInputProps('fromBudgetId')}
          />
          
          <Select
            label={t('transfer.to')}
            placeholder={t('budget.selectBudget')}
            data={budgetOptions}
            {...form.getInputProps('toBudgetId')}
          />
          
          <NumberInput
            label={t('transfer.amount')}
            placeholder="0.00"
            min={0}
            step={0.01}
            leftSection={<IconCurrencyDollar size={16} />}
            {...form.getInputProps('amount')}
          />
          
          <DateInput
            label={t('transfer.date')}
            placeholder={t('common.datePlaceholder')}
            {...form.getInputProps('date')}
          />

          <TextInput
            label={t('transfer.description')}
            placeholder={t('transfer.descriptionPlaceholder')}
            {...form.getInputProps('description')}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={transferFunds.isPending}>
              {t('common.transfer')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
