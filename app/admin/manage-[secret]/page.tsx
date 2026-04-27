import { verifyAuth, ADMIN_SECRET_ROUTE } from '@/lib/auth';
import { notFound } from 'next/navigation';
import LoginForm from '@/components/Admin/LoginForm';
import Dashboard from '@/components/Admin/Dashboard';

export default async function AdminPage(props: { params: Promise<{ secret: string }> }) {
  const params = await props.params;

  console.log('Admin Access attempt with secret:', params.secret);
  console.log('Expected secret from ENV:', ADMIN_SECRET_ROUTE);

  if (params.secret !== ADMIN_SECRET_ROUTE) {
    console.error('Mismatch detected!');
    notFound();
  }

  const isAuthenticated = await verifyAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
