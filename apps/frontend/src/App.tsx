import { useState } from 'react';
import { MantineProvider, Container, Title, Tabs, Group, Button, Text, ActionIcon, Switch } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@mantine/hooks';
import { IconSettings } from '@tabler/icons-react';
import { BudgetList } from './components/BudgetList';
import { BudgetForm } from './components/BudgetForm';
import { QuickAddExpense } from './components/QuickAddExpense';
import { PersonList } from './components/PersonList';
import { PersonForm } from './components/PersonForm';
import { TransactionList } from './components/TransactionList';
import { RulesForm } from './components/RulesForm';
import { RulesList } from './components/RulesList';
import { SettingsDrawer } from './components/SettingsDrawer';
import { useBudgets } from './hooks/useBudgets';
import { usePeople } from './hooks/usePeople';
import type { BudgetWithDetails } from '@fun-budget/domain';
import './i18n';

const queryClient = new QueryClient();

interface AppContentProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

function AppContent({ primaryColor, setPrimaryColor }: AppContentProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('budgets');
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithDetails | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showDisabledBudgets, setShowDisabledBudgets] = useState(false);
  const [settingsOpened, setSettingsOpened] = useState(false);
  
  const { data: budgets = [], refetch: refetchBudgets } = useBudgets(undefined, showDisabledBudgets);
  const { data: people = [], refetch: refetchPeople } = usePeople();

  const handleBudgetCreated = () => {
    setShowBudgetForm(false);
    refetchBudgets();
  };

  const handlePersonCreated = () => {
    setShowPersonForm(false);
    refetchPeople();
  };

  const handleExpenseAdded = () => {
    refetchBudgets();
  };

  return (
    <Container size="lg" py="md">
      <Group justify="apart" mb="md">
        <Title order={1}>{t('app.title')}</Title>
        <Group>
          <Switch
            label={t('budget.showDisabled')}
            checked={showDisabledBudgets}
            onChange={(event) => setShowDisabledBudgets(event.currentTarget.checked)}
          />
          <QuickAddExpense budgets={budgets} onExpenseAdded={handleExpenseAdded} />
          <ActionIcon variant="light" size="lg" onClick={() => setSettingsOpened(true)}>
            <IconSettings size="1.2rem" />
          </ActionIcon>
        </Group>
      </Group>

      <SettingsDrawer
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        primaryColor={primaryColor}
        onPrimaryColorChange={setPrimaryColor}
      />

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'budgets')}>
        <Tabs.List>
          <Tabs.Tab value="budgets">{t('tabs.budgets')}</Tabs.Tab>
          <Tabs.Tab value="people">{t('tabs.people')}</Tabs.Tab>
          <Tabs.Tab value="transactions">{t('tabs.transactions')}</Tabs.Tab>
          <Tabs.Tab value="rules">{t('tabs.rules')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="budgets">
          <Container py="md">
            <Group justify="apart" mb="md">
              <Text size="lg" fw={500}>{t('budget.title')}</Text>
              <Button onClick={() => setShowBudgetForm(true)}>
                {t('budget.createNew')}
              </Button>
            </Group>
            <Group mb="md">
              <Switch
                label={t('budget.showDisabled')}
                checked={showDisabledBudgets}
                onChange={(event) => setShowDisabledBudgets(event.currentTarget.checked)}
              />
            </Group>
            
            {showBudgetForm && (
              <BudgetForm
                people={people}
                onSubmit={handleBudgetCreated}
                onCancel={() => setShowBudgetForm(false)}
              />
            )}
            
            <BudgetList
              budgets={budgets}
              people={people}
              onBudgetSelect={setSelectedBudget}
              selectedBudget={selectedBudget}
              onBudgetUpdated={refetchBudgets}
            />
          </Container>
        </Tabs.Panel>

        <Tabs.Panel value="people">
          <Container py="md">
            <Group justify="apart" mb="md">
              <Text size="lg" fw={500}>{t('person.title')}</Text>
              <Button onClick={() => setShowPersonForm(true)}>
                {t('person.createNew')}
              </Button>
            </Group>
            
            {showPersonForm && (
              <PersonForm
                onSubmit={handlePersonCreated}
                onCancel={() => setShowPersonForm(false)}
              />
            )}
            
            <PersonList people={people} />
          </Container>
        </Tabs.Panel>

        <Tabs.Panel value="transactions">
          <Container py="md">
            <Text size="lg" fw={500} mb="md">{t('transaction.title')}</Text>
            <TransactionList budgets={budgets} />
          </Container>
        </Tabs.Panel>
        
        <Tabs.Panel value="rules">
          <Container py="md">
            <Text size="lg" fw={500} mb="md">{t('rules.title')}</Text>
            <RulesForm
              budgets={budgets}
              onSubmit={refetchBudgets}
            />
            <RulesList budgets={budgets} />
          </Container>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

function App() {
  const [primaryColor, setPrimaryColor] = useLocalStorage({
    key: 'mantine-primary-color',
    defaultValue: 'blue',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{ primaryColor }}>
        <AppContent primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
