import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-navy-950">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="text-7xl font-black text-brand-500">404</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          <Home className="h-4 w-4" /> Back home
        </Link>
      </div>
    </div>
  );
}
