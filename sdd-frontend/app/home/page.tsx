import AuthGuard from '@/components/AuthGuard';

export const metadata = { title: 'Home — SDD' };

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">Em construção.</p>
      </main>
    </AuthGuard>
  );
}
