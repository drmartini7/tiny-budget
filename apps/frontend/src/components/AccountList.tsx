import { useState } from 'react';
import { Card, Stack, Text, Group, Button, TextInput, Select, Checkbox, Badge, Table, ScrollArea, Collapse } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAccounts, useCreateAccount } from '../hooks/useAccounts';
import { IconBuildingBank, IconCreditCard, IconPlus, IconX } from '@tabler/icons-react';

export function AccountList() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: accounts = [] } = useAccounts();
  const createAccount = useCreateAccount();

  const form = useForm({
    initialValues: {
      name: '',
      type: 'BANK',
      financialInstitution: '',
      active: true,
    },
    validate: {
      name: (value) => (value.trim().length > 0 && value.length <= 100 ? null : t('validation.required')),
      type: (value) => (value ? null : t('validation.required')),
      financialInstitution: (value) => (value.trim().length > 0 && value.length <= 150 ? null : t('validation.required')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await createAccount.mutateAsync({
      ...values,
      type: values.type as 'BANK' | 'CREDIT_CARD',
    });
    form.reset();
    setIsFormOpen(false);
  };

  const getAccountTypeIcon = (type: string) => {
    return type === 'BANK' ? <IconBuildingBank size={16} /> : <IconCreditCard size={16} />;
  };

  return (
    <Stack gap="md">
      {!isFormOpen && (
        <Group justify="flex-end">
          <Button leftSection={<IconPlus size={16} />} onClick={() => setIsFormOpen(true)}>
            {t('account.createNew')}
          </Button>
        </Group>
      )}

      <Collapse in={isFormOpen}>
        <Card withBorder mb="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>{t('account.createNew')}</Text>
                <Button variant="subtle" color="gray" size="xs" onClick={() => setIsFormOpen(false)}>
                  <IconX size={16} />
                </Button>
              </Group>
              
              <TextInput
                label={t('account.name')}
                placeholder={t('account.namePlaceholder')}
                required
                maxLength={100}
                {...form.getInputProps('name')}
              />
              
              <Select
                label={t('account.type')}
                placeholder={t('account.typePlaceholder')}
                data={[
                  { value: 'BANK', label: t('account.types.bank') },
                  { value: 'CREDIT_CARD', label: t('account.types.creditCard') },
                ]}
                required
                {...form.getInputProps('type')}
              />
              
              <TextInput
                label={t('account.institution')}
                placeholder={t('account.institutionPlaceholder')}
                required
                maxLength={150}
                {...form.getInputProps('financialInstitution')}
              />
              
              <Checkbox
                label={t('account.active')}
                {...form.getInputProps('active', { type: 'checkbox' })}
              />
              
              <Group justify="flex-end">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={createAccount.isPending}>
                  {t('common.create')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Collapse>

      <Card withBorder>
        <Stack gap="sm">
          <Text size="lg" fw={500}>{t('account.listTitle')}</Text>
          
          {accounts.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              {t('account.noAccounts')}
            </Text>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('account.name')}</Table.Th>
                    <Table.Th>{t('account.type')}</Table.Th>
                    <Table.Th>{t('account.institution')}</Table.Th>
                    <Table.Th>{t('account.status')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {accounts.map((account) => (
                    <Table.Tr key={account.id}>
                      <Table.Td fw={500}>{account.name}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {getAccountTypeIcon(account.type)}
                          <Text size="sm">{t(`account.types.${account.type === 'BANK' ? 'bank' : 'creditCard'}`)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{account.financialInstitution}</Table.Td>
                      <Table.Td>
                        <Badge color={account.active ? 'green' : 'gray'}>
                          {account.active ? t('account.active') : t('account.inactive')}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
