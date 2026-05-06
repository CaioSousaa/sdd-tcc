import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Entrar — SDD',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-zinc-50">Entrar</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-amber-400 hover:underline">
            Criar conta
          </Link>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
