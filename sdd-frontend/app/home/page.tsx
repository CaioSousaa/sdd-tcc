import AuthGuard from '@/components/AuthGuard';
import TaskBoard from '@/components/TaskBoard';

export const metadata = { title: 'Home — SDD' };

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-zinc-950">
        <TaskBoard />
      </main>
    </AuthGuard>
  );
}

