import { useState, useEffect } from 'react';
import { Card, Grid, TextInput, Checkbox, Button, Group, Select, Collapse, ActionIcon, Box } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';

export interface TransactionFiltersState {
  budgetId: string;
  startDate: Date | null;
  endDate: Date | null;
  search: string;
  pastOnly: boolean;
}

interface TransactionFiltersProps {
  budgets: { value: string; label: string }[];
  filters: TransactionFiltersState;
  onChange: (filters: TransactionFiltersState) => void;
  onClear: () => void;
}

export function TransactionFilters({ budgets, filters, onChange, onClear }: TransactionFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true); // Default open for visibility
  
  // Local state for search to handle debounce
  const [searchValue, setSearchValue] = useState(filters.search);
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Update local search if filters change externally (e.g. clear)
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleChange = (key: keyof TransactionFiltersState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.search || filters.pastOnly;

  return (
    <Card withBorder mb="md">
      <Group justify="space-between" mb={isOpen ? "md" : 0}>
        <Select
          label={t('transaction.budget')}
          placeholder={t('transaction.selectBudgetPlaceholder')}
          data={budgets}
          value={filters.budgetId}
          onChange={(val) => handleChange('budgetId', val || '')}
          searchable
          clearable
          style={{ flex: 1, minWidth: 200 }}
        />
        
        <Group align="flex-end">
            <Button 
                variant={hasActiveFilters ? "light" : "subtle"} 
                leftSection={<IconFilter size={16} />}
                onClick={() => setIsOpen(!isOpen)}
                mb={2}
            >
                {t('transaction.filters')}
            </Button>
            {hasActiveFilters && (
                <Button variant="subtle" color="red" size="xs" onClick={onClear} mb={2}>
                    {t('common.clear')}
                </Button>
            )}
        </Group>
      </Group>

      <Collapse in={isOpen}>
        <Grid align="flex-end">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                    label={t('transaction.search')}
                    leftSection={<IconSearch size={16} />}
                    placeholder={t('transaction.searchPlaceholder')}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.currentTarget.value)}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                <DateInput
                    label={t('common.startDate')}
                    placeholder={t('common.datePlaceholder')}
                    value={filters.startDate}
                    onChange={(date) => handleChange('startDate', date)}
                    maxDate={filters.endDate || undefined}
                    clearable
                />
            </Grid.Col>
             <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                <DateInput
                    label={t('common.endDate')}
                    placeholder={t('common.datePlaceholder')}
                    value={filters.endDate}
                    onChange={(date) => handleChange('endDate', date)}
                    minDate={filters.startDate || undefined}
                    clearable
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 12, md: 4 }}>
                 <Checkbox
                    label={t('transaction.pastOnly')}
                    checked={filters.pastOnly}
                    onChange={(e) => handleChange('pastOnly', e.currentTarget.checked)}
                    mb="xs"
                />
            </Grid.Col>
        </Grid>
      </Collapse>
    </Card>
  );
}
