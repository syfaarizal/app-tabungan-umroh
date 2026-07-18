import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardTab } from '../../src/components/admin/DashboardTab';
import { LedgerTab } from '../../src/components/admin/LedgerTab';
import { AuditLogsTab } from '../../src/components/admin/AuditLogsTab';
import { ManualAdjustmentTab } from '../../src/components/admin/ManualAdjustmentTab';

const TABS = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'audit', label: 'Audit Log' },
  { key: 'adjust', label: 'Sesuaikan Saldo' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <DashboardTab />;
      case 'ledger': return <LedgerTab />;
      case 'audit': return <AuditLogsTab />;
      case 'adjust': return <ManualAdjustmentTab />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Segmented Tab Bar */}
      <View className="px-4 pt-2 pb-3 bg-surface border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.key ? 'bg-primary-600' : 'bg-primary-100'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key ? 'text-white' : 'text-primary-700'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
