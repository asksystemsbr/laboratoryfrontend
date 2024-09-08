 // src/app/page.tsx
 "use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Certifique-se de usar o Router correto para App Router
import { useAuth } from './auth';

export default function Home() {
  const router = useRouter();
  const authContext = useAuth(); // Verifica o contexto de autenticação

  useEffect(() => {
    if (!authContext?.loading) {
      if (authContext?.user) {
        //router.push('/dashboard'); // Redireciona para o dashboard se estiver autenticado
        router.push('/dashboard'); // Redireciona para o dashboard se estiver autenticado
      } else {
        router.push('/login'); // Redireciona para o login se não estiver autenticado
      }
    }
  }, [authContext, router]);

  if (authContext?.loading) {
    return <p>Carregando...</p>;
  }

  return null; // Retorna null porque a página será redirecionada
}
