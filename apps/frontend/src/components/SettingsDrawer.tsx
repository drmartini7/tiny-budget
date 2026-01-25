import { Drawer, Stack, Text, Group, ColorSwatch, useMantineTheme, SegmentedControl, Select, CheckIcon, rem } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface SettingsDrawerProps {
  opened: boolean;
  onClose: () => void;
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
}

const SWATCHES = ['dark', 'gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];

export function SettingsDrawer({ opened, onClose, primaryColor, onPrimaryColorChange }: SettingsDrawerProps) {
  const { t, i18n } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
      localStorage.setItem('i18nextLng', value);
    }
  };

  // Ensure current language is matched correctly (e.g. en-US -> en)
  const currentLang = (i18n.language || 'en').split('-')[0];

  return (
    <Drawer opened={opened} onClose={onClose} title={t('settings.title')} position="right">
      <Stack gap="xl">
        <Stack gap="sm">
            <Text fw={500}>{t('settings.theme')}</Text>
            <Group gap="xs" wrap="wrap">
                {SWATCHES.map((color) => (
                    <ColorSwatch
                        key={color}
                        component="button"
                        color={theme.colors[color][6]}
                        onClick={() => onPrimaryColorChange(color)}
                        style={{ color: '#fff', cursor: 'pointer' }}
                    >
                        {primaryColor === color && <CheckIcon style={{ width: rem(12), height: rem(12) }} />}
                    </ColorSwatch>
                ))}
            </Group>
        </Stack>

        <Stack gap="sm">
            <Text fw={500}>{t('settings.darkMode')}</Text>
            <SegmentedControl
                value={colorScheme}
                onChange={(value) => setColorScheme(value as any)}
                data={[
                    { label: t('settings.mode.light'), value: 'light' },
                    { label: t('settings.mode.dark'), value: 'dark' },
                    { label: t('settings.mode.auto'), value: 'auto' },
                ]}
            />
        </Stack>

        <Stack gap="sm">
            <Text fw={500}>{t('settings.language')}</Text>
            <Select
                value={currentLang}
                onChange={handleLanguageChange}
                data={[
                    { label: 'English', value: 'en' },
                    { label: 'Português', value: 'pt' },
                ]}
                allowDeselect={false}
            />
        </Stack>
      </Stack>
    </Drawer>
  );
}
