import { Card, Stack, Text, Group, NumberInput, Select, Button } from '@mantine/core';
import { MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { BudgetWithDetails, CreateRuleDto, PeriodType } from '@fun-budget/domain';
import { useCreateRule } from '../hooks/useRules';
import { useTranslation } from 'react-i18next';

interface RulesFormProps {
  budgets: BudgetWithDetails[];
  onSubmit: () => void;
}

export function RulesForm({ budgets, onSubmit }: RulesFormProps) {
  const { t } = useTranslation();
  const createRule = useCreateRule();

  const form = useForm({
    initialValues: {
      budgetIds: [] as string[],
      amount: 0,
      frequency: 'MONTHLY',
      executionDay: 1,
      description: '',
      startDate: new Date(),
    },
    validate: {
      budgetIds: (value) => (value.length > 0 ? null : t('validation.required')),
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
      frequency: (value) => (value ? null : t('validation.required')),
      executionDay: (value, values) =>
        values.frequency === 'MONTHLY' && (value < 1 || value > 31) ? t('validation.required') : null,
    },
  });

  const budgetOptions = budgets.map((b) => ({ value: b.id, label: b.name }));

  const frequencyOptions = [
    { value: 'DAILY', label: t('period.daily') },
    { value: 'MONTHLY', label: t('period.monthly') },
    { value: 'YEARLY', label: t('period.yearly') },
  ];

  const handleSubmit = async (values: typeof form.values) => {
    const payloads: CreateRuleDto[] = values.budgetIds.map((id) => ({
      budgetId: id,
      amount: values.amount,
      frequency: values.frequency as unknown as PeriodType,
      executionDay: values.frequency === 'MONTHLY' ? values.executionDay : 1,
      startDate: values.startDate,
      description: values.description || t('rules.defaultDescription'),
    }));

    await Promise.all(payloads.map((p) => createRule.mutateAsync(p)));
    form.reset();
    onSubmit();
  };

  return (
    <Card withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="lg" fw={500}>{t('rules.title')}</Text>
          <MultiSelect
            label={t('rules.budgets')}
            placeholder={t('rules.selectBudgets')}
            data={budgetOptions}
            {...form.getInputProps('budgetIds')}
          />
          <NumberInput
            label={t('rules.amount')}
            placeholder={t('rules.amountPlaceholder')}
            min={0}
            step={0.01}
            {...form.getInputProps('amount')}
          />
          <Select
            label={t('rules.frequency')}
            placeholder={t('rules.frequencyPlaceholder')}
            data={frequencyOptions}
            {...form.getInputProps('frequency')}
          />
          {form.values.frequency === 'MONTHLY' && (
            <NumberInput
              label={t('rules.executionDay')}
              placeholder={t('rules.executionDayPlaceholder')}
              min={1}
              max={31}
              {...form.getInputProps('executionDay')}
            />
          )}
          <Group justify="flex-end">
            <Button type="submit" loading={createRule.isPending}>
              {t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
