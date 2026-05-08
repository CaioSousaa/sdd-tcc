import AuthGuard from '@/components/AuthGuard';
import CreateTaskForm from '@/components/CreateTaskForm';

export const metadata = { title: 'Home — SDD' };

export default function HomePage() {
  return (
    <AuthGuard>
      <main className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
        <CreateTaskForm />
      </main>
    </AuthGuard>
  );
}
