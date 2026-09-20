import { Header } from '../organisms/Header';

interface DashboardLayoutProps {
  userName?: string;
  children: React.ReactNode;
}

export function DashboardLayout({ userName, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
