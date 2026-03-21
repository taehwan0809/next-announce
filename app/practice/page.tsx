import { redirect } from 'next/navigation';
import PracticeClient from '@/components/PracticeClient';
import { getSessionUser } from '@/lib/auth';

export default async function PracticePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?next=/practice');
  }

  return <PracticeClient />;
}
