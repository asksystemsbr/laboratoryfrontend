"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // Redireciona para /login ao carregar
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null; // Não renderiza nada, já que estamos redirecionando
}
