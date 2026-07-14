import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';

/**
 * Entry route: redirects based on hydrated auth state.
 * The root layout guarantees hydration has completed before this renders.
 */
export default function SplashRedirect() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (user.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(user)/dashboard" />;
}
