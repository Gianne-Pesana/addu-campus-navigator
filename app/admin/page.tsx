import { verifyAuth } from '@/lib/auth';
import LoginForm from '@/components/Admin/LoginForm';
import Dashboard from '@/components/Admin/Dashboard';

export default async function AdminPage() {
  const isAuthenticated = await verifyAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
