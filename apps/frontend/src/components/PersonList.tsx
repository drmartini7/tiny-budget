import { Card, Group, Text, Stack, Avatar } from '@mantine/core';
import { Person } from '@fun-budget/domain';
import { useTranslation } from 'react-i18next';
import { IconUser } from '@tabler/icons-react';

interface PersonListProps {
  people: Person[];
}

export function PersonList({ people }: PersonListProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      {people.length === 0 ? (
        <Card withBorder>
          <Text c="dimmed" ta="center">
            {t('person.noPeople')}
          </Text>
        </Card>
      ) : (
        <Stack gap="sm">
          {people.map((person) => (
            <Card key={person.id} withBorder>
              <Group>
                <Avatar radius="xl">
                  <IconUser size={18} />
                </Avatar>
                <Stack gap={0}>
                  <Text fw={500}>{person.name}</Text>
                  {person.email && (
                    <Text size="sm" c="dimmed">
                      {person.email}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}