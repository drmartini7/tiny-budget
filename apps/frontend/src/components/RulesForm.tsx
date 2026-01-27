import { useEffect } from 'react';
import { Card, Stack, Text, Group, NumberInput, Select, Button, TextInput } from '@mantine/core';
import { MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { BudgetWithDetails, CreateRuleDto, PeriodType, Rule, UpdateRuleDto } from '@fun-budget/domain';
import { useCreateRule, useUpdateRule } from '../hooks/useRules';
import { useTranslation } from 'react-i18next';

interface RulesFormProps {
  budgets: BudgetWithDetails[];
  onSubmit: () => void;
  onCancel?: () => void;
  initialData?: Rule;
}

export function RulesForm({ budgets, onSubmit, onCancel, initialData }: RulesFormProps) {
  const { t } = useTranslation();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const isEditing = !!initialData;

  const form = useForm({
    initialValues: {
      budgetIds: initialData ? [initialData.budgetId] : [] as string[],
      amount: initialData?.amount || 0,
      frequency: (initialData?.frequency as string) || 'MONTHLY',
      executionDay: initialData?.executionDay || 1,
      description: initialData?.description || '',
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
    },
    validate: {
      budgetIds: (value) => (value.length > 0 ? null : t('validation.required')),
      amount: (value) => (value > 0 ? null : t('validation.amountPositive')),
      frequency: (value) => (value ? null : t('validation.required')),
      executionDay: (value, values) =>
        values.frequency === 'MONTHLY' && (value < 1 || value > 31) ? t('validation.required') : null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.setValues({
        budgetIds: [initialData.budgetId],
        amount: initialData.amount,
        frequency: initialData.frequency as string,
        executionDay: initialData.executionDay,
        description: initialData.description,
        startDate: new Date(initialData.startDate),
      });
    }
  }, [initialData]);

  const budgetOptions = budgets.map((b) => ({ value: b.id, label: b.name }));

  const frequencyOptions = [
    { value: 'DAILY', label: t('period.daily') },
    { value: 'MONTHLY', label: t('period.monthly') },
    { value: 'YEARLY', label: t('period.yearly') },
  ];

  const handleSubmit = async (values: typeof form.values) => {
    if (isEditing && initialData) {
      const updateData: UpdateRuleDto = {
        amount: values.amount,
        frequency: values.frequency as unknown as PeriodType,
        executionDay: values.frequency === 'MONTHLY' ? values.executionDay : 1,
        startDate: values.startDate,
        description: values.description || t('rules.defaultDescription'),
        // We generally don't move rules between budgets on edit, but if needed, we'd update budgetId
        budgetId: values.budgetIds[0],
      };
      await updateRule.mutateAsync({ id: initialData.id, data: updateData });
    } else {
      const payloads: CreateRuleDto[] = values.budgetIds.map((id) => ({
        budgetId: id,
        amount: values.amount,
        frequency: values.frequency as unknown as PeriodType,
        executionDay: values.frequency === 'MONTHLY' ? values.executionDay : 1,
        startDate: values.startDate,
        description: values.description || t('rules.defaultDescription'),
      }));

      await Promise.all(payloads.map((p) => createRule.mutateAsync(p)));
    }
    
    form.reset();
    onSubmit();
  };

  return (
    <Card withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="lg" fw={500}>{isEditing ? t('rules.editTitle') : t('rules.title')}</Text>
          
          {isEditing ? (
             <Select
              label={t('rules.budgets')}
              data={budgetOptions}
              value={form.values.budgetIds[0]}
              onChange={(val) => form.setFieldValue('budgetIds', val ? [val] : [])}
              disabled // Prevent moving rules between budgets for simplicity unless desired
            />
          ) : (
            <MultiSelect
              label={t('rules.budgets')}
              placeholder={t('rules.selectBudgets')}
              data={budgetOptions}
              {...form.getInputProps('budgetIds')}
            />
          )}

          <TextInput
            label={t('rules.description')}
            placeholder={t('rules.descriptionPlaceholder')}
            {...form.getInputProps('description')}
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
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" loading={createRule.isPending || updateRule.isPending}>
              {isEditing ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
