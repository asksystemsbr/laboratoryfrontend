
// src/app/dashboard/page.tsx
// "use client";
import ClientAuthWrapper from '../ClientAuthWrapper'; // Adjust path as necessary
 import Layout from '../layout';

export default function Dashboard() {
  return (
    <Layout>
      <ClientAuthWrapper>
        <h1 className="text-4xl font-bold">Bem-vindo ao Dashboard!</h1>
        <p className="mt-4">Selecione uma opção no menu para navegar.</p>
      </ClientAuthWrapper>
    </Layout>
  );
}
