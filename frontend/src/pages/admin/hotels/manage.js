import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ManageHotels() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main hotels admin page
    router.push('/admin/hotels');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
