import AuthGuard from '@/components/AuthGuard';
import HomeContent from '@/components/HomeContent';

export const metadata = { title: 'Home — SDD' };

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

