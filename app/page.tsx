import HomePageClient from '@/components/home/HomePageClient';
import { getSessionUser } from '@/lib/auth';

export default async function Home() {
  const user = await getSessionUser();

  return <HomePageClient isAuthenticated={Boolean(user)} />;
}
