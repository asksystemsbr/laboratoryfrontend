
//src/app/teste/page.tsx
import React from 'react';
import ClientAuthWrapper from '../ClientAuthWrapper';
export default function Dashboard() {
  return (    
      <ClientAuthWrapper>
   <div>
        <h1 className="text-4xl font-bold">Bem-vindo ao teste!</h1>
    </div>
      </ClientAuthWrapper>
  );
}
