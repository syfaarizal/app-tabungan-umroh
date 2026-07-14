import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-40 h-40 rounded-full bg-primary-100 items-center justify-center mb-8">
          <Text className="text-7xl">🕋</Text>
        </View>
        <Text className="text-3xl font-extrabold text-primary-700 text-center mb-2">
          Tabungan Umroh
        </Text>
        <Text className="text-lg text-muted text-center">
          Menabung hari ini,{'\n'}Berangkat umroh nanti
        </Text>
      </View>
      <View className="px-8 pb-10 gap-3">
        <Button label="Masuk" onPress={() => router.push('/(auth)/login')} />
      </View>
    </SafeAreaView>
  );
}
