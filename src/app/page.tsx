import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from './AuthForm';

export const metadata = {
  title: 'MyGastro.Ai - Patient Intake',
  description: 'Patient Intake Web App for MyGastro.Ai',
};

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId');
  const userRole = cookieStore.get('userRole');

  if (userId) {
    if (userRole?.value === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/form');
    }
  }

  return (
    <main className="container flex flex-col items-center justify-center min-h-[100vh]">
      <div className="glass-panel w-full" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-8">
          <h1>MyGastro.Ai</h1>
          <p>Welcome to the Patient Intake Portal</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
