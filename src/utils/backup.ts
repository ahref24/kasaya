import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Transaction, Budget, Goal, Category, Settings } from '../models';

const BACKUP_FILENAME = 'kasaya-backup.json';

async function getLegacyFileSystem() {
    const legacy = await import('expo-file-system/legacy');
    return legacy.FileSystem || legacy.default || legacy;
}

export async function exportBackup(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    categories: Category[],
    settings: Settings
): Promise<string> {
    const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        transactions,
        budgets,
        goals,
        categories,
        settings,
    };

    const json = JSON.stringify(data, null, 2);

    if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = BACKUP_FILENAME;
        a.click();
        URL.revokeObjectURL(url);
        return 'web-download';
    }

    const FileSystem = await getLegacyFileSystem();
    const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (!dir) {
        throw new Error('No writable directory available for backup export.');
    }
    const fileUri = `${dir}${BACKUP_FILENAME}`;

    await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Sharing is not available on this device.');
    }

    await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Kasaya Backup',
        UTI: 'public.json',
    });

    return fileUri;
}

export async function importBackup(): Promise<{
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    categories: Category[];
    settings: Settings;
} | null> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) return null;

        const fileUri = result.assets[0].uri;
        const FileSystem = await getLegacyFileSystem();
        const json = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
        const data = JSON.parse(json);

        if (!data.transactions || !data.budgets || !data.goals || !data.categories || !data.settings) {
            throw new Error('Invalid backup file format');
        }

        return {
            transactions: data.transactions,
            budgets: data.budgets,
            goals: data.goals,
            categories: data.categories,
            settings: data.settings,
        };
    } catch (error) {
        console.error('Import backup error:', error);
        throw error;
    }
}
