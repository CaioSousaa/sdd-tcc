import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Cadastro — SDD',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-zinc-50">Criar conta</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link href="/" className="text-amber-400 hover:underline">
            Entrar
          </Link>
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
