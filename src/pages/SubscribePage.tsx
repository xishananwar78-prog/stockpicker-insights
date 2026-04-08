import { AdminLayout } from '@/components/AdminLayout';
import { Lock } from 'lucide-react';

export default function SubscribePage() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Unlock Premium Picks</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          Get exclusive access to our live swing trade recommendations. Subscribe to see what our analysts are watching right now.
        </p>
        <p className="text-sm text-muted-foreground">
          Content for this page will be updated soon. Stay tuned! 🚀
        </p>
      </div>
    </AdminLayout>
  );
}
