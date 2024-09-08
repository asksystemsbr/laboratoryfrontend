//src/app/ClientAuthWrapper.tsx
"use client"; // This is required for using hooks in Next.js 13
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './auth'; // Adjust the path as needed

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const authContext = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authContext?.loading && !authContext?.user) {
      router.push('/login'); // Redirect to login if the user is not authenticated
    }
  }, [authContext?.loading, authContext?.user, router]);

  //if (authContext?.loading) {
  if (authContext?.loading === undefined || authContext?.loading === true) {  
    return <p>Carregando...</p>; // Show loading until auth is determined
  }

  if (!authContext?.user) {
    return null; // Prevent rendering if no user
  }

  return <>{children}</>; // Render children if authenticated
}
