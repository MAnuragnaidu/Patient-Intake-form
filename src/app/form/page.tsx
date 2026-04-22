import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MultiStepForm from './MultiStepForm';
import LogoutButton from '../admin/LogoutButton';

export default async function FormPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId');

  if (!userId) {
    redirect('/');
  }

  return (
    <main className="container flex flex-col items-center min-h-[100vh] py-8">
      <header className="w-full flex justify-between items-center mb-10">
        <div className="font-bold text-xl tracking-tight text-white">
          MyGastro<span className="text-primary-color">.Ai</span>
        </div>
        <LogoutButton />
      </header>
      <div className="text-center mb-10">
        <h1>Patient Intake Form</h1>
        <p>Please fill out the following details carefully.</p>
      </div>
      <div className="glass-panel w-full">
        <MultiStepForm />
      </div>
    </main>
  );
}
