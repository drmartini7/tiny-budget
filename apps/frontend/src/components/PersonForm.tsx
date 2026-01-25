import { Card, TextInput, Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { CreatePersonDto } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { useCreatePerson } from '../hooks/usePeople';

interface PersonFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function PersonForm({ onSubmit, onCancel }: PersonFormProps) {
  const { t } = useTranslation();
  const createPerson = useCreatePerson();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : t('validation.required')),
      email: (value) => {
        if (!value) return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : t('validation.invalidEmail');
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const personData: CreatePersonDto = {
        name: values.name.trim(),
        email: values.email.trim() || undefined,
      };
      
      await createPerson.mutateAsync(personData);
      onSubmit();
    } catch (error) {
      console.error('Failed to create person:', error);
    }
  };

  return (
    <Card withBorder mb="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('person.name')}
            placeholder={t('person.namePlaceholder')}
            {...form.getInputProps('name')}
          />
          
          <TextInput
            label={t('person.email')}
            placeholder={t('person.emailPlaceholder')}
            {...form.getInputProps('email')}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createPerson.isPending}>
              {t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}