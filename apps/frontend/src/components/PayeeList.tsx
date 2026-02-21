import { useState } from 'react';
import { Card, Stack, Text, Group, Button, TextInput, ActionIcon, Tooltip, Modal } from '@mantine/core';
import { IconEdit, IconTrash, IconSearch, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { usePayees, useCreatePayee, useUpdatePayee, useDeletePayee } from '../hooks/usePayees';
import { Payee } from '@fun-budget/domain';

export function PayeeList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: payees = [] } = usePayees(search);
  const createPayee = useCreatePayee();
  const updatePayee = useUpdatePayee();
  const deletePayee = useDeletePayee();

  const handleCreate = async (name: string) => {
    await createPayee.mutateAsync({ name });
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (id: string, name: string) => {
    await updatePayee.mutateAsync({ id, data: { name } });
    setEditingPayee(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deletePayee.mutateAsync(id);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput
          placeholder={t('payee.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
          {t('payee.createNew')}
        </Button>
      </Group>

      <PayeeFormModal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title={t('payee.createNew')}
        loading={createPayee.isPending}
      />

      {editingPayee && (
        <PayeeFormModal
          opened={!!editingPayee}
          onClose={() => setEditingPayee(null)}
          onSubmit={(name) => handleUpdate(editingPayee.id, name)}
          initialValue={editingPayee.name}
          title={t('payee.edit')}
          loading={updatePayee.isPending}
        />
      )}

      <Stack gap="sm">
        {payees.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            {t('payee.noPayees')}
          </Text>
        ) : (
          payees.map((payee) => (
            <Card key={payee.id} withBorder p="sm">
              <Group justify="apart">
                <Text fw={500}>{payee.name}</Text>
                <Group gap="xs">
                  <Tooltip label={t('common.edit')}>
                    <ActionIcon variant="subtle" onClick={() => setEditingPayee(payee)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('common.delete')}>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(payee.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}

interface PayeeFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
  title: string;
  loading?: boolean;
}

function PayeeFormModal({ opened, onClose, onSubmit, initialValue = '', title, loading }: PayeeFormModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
      setName('');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label={t('payee.name')}
            placeholder={t('payee.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" loading={loading}>{t('common.save')}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
