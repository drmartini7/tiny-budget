import { 
  Card, 
  TextInput, 
  Select, 
  NumberInput, 
  Button, 
  Group, 
  Stack, 
  Text
} from '@mantine/core';
import { Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput as MantineDateInput } from '@mantine/dates';
import type { CreateBudgetDto, UpdateBudgetDto, Person, PeriodType, OverflowPolicy, BudgetWithDetails } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useCreateBudget, useUpdateBudget } from '../hooks/useBudgets';

interface BudgetFormProps {
  people: Person[];
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: BudgetWithDetails;
}

export function BudgetForm({ people, onSubmit, onCancel, initialData }: BudgetFormProps) {
  const { t } = useTranslation();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const isEditing = !!initialData;

  const form = useForm({
    initialValues: {
      name: initialData?.name || '',
      ownerId: initialData?.ownerId || '',
      currency: initialData?.currency || 'BRL',
      periodType: initialData?.periodType || 'MONTHLY',
      overflowPolicy: initialData?.overflowPolicy || 'NONE',
      overflowLimit: initialData?.overflowLimit || 0,
      startDate: initialData ? new Date(initialData.startDate) : new Date(),
      initialValue: 0,
      autoAddInPeriod: false,
      autoAddAmount: 0,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : t('validation.required')),
      ownerId: (value) => (value ? null : t('validation.required')),
      autoAddAmount: (value, values) => (values.autoAddInPeriod && value <= 0 ? t('validation.amountPositive') : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEditing && initialData) {
        const updateData: UpdateBudgetDto = {
          name: values.name,
          ownerId: values.ownerId,
          currency: values.currency,
          periodType: values.periodType as unknown as PeriodType,
          overflowPolicy: values.overflowPolicy as unknown as OverflowPolicy,
          overflowLimit: values.overflowPolicy === 'LIMITED' ? values.overflowLimit : undefined,
          startDate: values.startDate,
          enabled: initialData.enabled, // Preserve existing enabled state or add field to form
        };
        await updateBudget.mutateAsync({ id: initialData.id, data: updateData });
      } else {
        const budgetData: CreateBudgetDto = {
          name: values.name,
          ownerId: values.ownerId,
          currency: values.currency,
          periodType: values.periodType as unknown as PeriodType,
          overflowPolicy: values.overflowPolicy as unknown as OverflowPolicy,
          startDate: values.startDate,
          enabled: true,
          overflowLimit: values.overflowPolicy === 'LIMITED' ? values.overflowLimit : undefined,
          initialValue: values.initialValue > 0 ? values.initialValue : undefined,
          autoAddInPeriod: values.autoAddInPeriod,
          autoAddAmount: values.autoAddInPeriod && values.autoAddAmount > 0 ? values.autoAddAmount : undefined,
        };
        await createBudget.mutateAsync(budgetData);
      }
      onSubmit();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const peopleOptions = people.map(person => ({
    value: person.id,
    label: person.name,
  }));

  const periodTypeOptions = [
    { value: 'DAILY', label: t('period.daily') },
    { value: 'MONTHLY', label: t('period.monthly') },
    { value: 'YEARLY', label: t('period.yearly') },
  ];

  const overflowPolicyOptions = [
    { value: 'NONE', label: t('overflow.none') },
    { value: 'LIMITED', label: t('overflow.limited') },
    { value: 'UNLIMITED', label: t('overflow.unlimited') },
  ];

  return (
    <Card withBorder mb="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="lg" fw={500}>{isEditing ? t('budget.edit') : t('budget.createNew')}</Text>
          
          <TextInput
            label={t('budget.name')}
            placeholder={t('budget.namePlaceholder')}
            {...form.getInputProps('name')}
          />
          
          <Select
            label={t('budget.owner')}
            placeholder={t('budget.selectOwner')}
            data={peopleOptions}
            {...form.getInputProps('ownerId')}
          />
          
          <Select
            label={t('budget.currency')}
            data={['USD', 'EUR', 'GBP', 'BRL']}
            {...form.getInputProps('currency')}
          />
          
          <Select
            label={t('budget.periodType')}
            data={periodTypeOptions}
            {...form.getInputProps('periodType')}
          />
          
          <Select
            label={t('budget.overflowPolicy')}
            data={overflowPolicyOptions}
            {...form.getInputProps('overflowPolicy')}
          />
          
          {form.values.overflowPolicy === 'LIMITED' && (
            <NumberInput
              label={t('budget.overflowLimit')}
              placeholder={t('budget.overflowLimitPlaceholder')}
              min={0}
              step={10}
              {...form.getInputProps('overflowLimit')}
            />
          )}
          
          <MantineDateInput
            label={t('budget.startDate')}
            placeholder={t('budget.startDatePlaceholder')}
            {...form.getInputProps('startDate')}
          />
          
          <NumberInput
            label={t('budget.initialValue')}
            placeholder={t('budget.initialValuePlaceholder')}
            min={0}
            step={0.01}
            {...form.getInputProps('initialValue')}
          />
          
          <Switch
            label={t('budget.autoAddInPeriod')}
            checked={form.values.autoAddInPeriod}
            onChange={(e) => form.setFieldValue('autoAddInPeriod', e.currentTarget.checked)}
          />
          
          {form.values.autoAddInPeriod && (
            <NumberInput
              label={t('budget.autoAddAmount')}
              placeholder={t('budget.autoAddAmountPlaceholder')}
              min={0}
              step={0.01}
              {...form.getInputProps('autoAddAmount')}
            />
          )}
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createBudget.isPending || updateBudget.isPending}>
              {isEditing ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
