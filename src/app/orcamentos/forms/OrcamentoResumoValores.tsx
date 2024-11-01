//src/app/orcamentos/forms/OrcamentoResumoValoresForm.tsx
import React from 'react';

interface OrcamentoResumoValoresFormProps {
    subtotal: number;
    desconto: number;
    total: number;
}

const OrcamentoResumoValoresForm: React.FC<OrcamentoResumoValoresFormProps> = ({ subtotal, desconto, total }) => {
  
  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Resumo</h3>

    <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <label>Subtotal: </label>
          <span className="text-lg font-semibold">{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <label>Desconto: </label>
          <span className="text-lg font-semibold">{desconto.toFixed(2)}</span>
         </div>
         <div className="flex justify-between">
          <label>Total: </label>
          <span className="text-lg font-semibold">{total.toFixed(2)}</span>
        </div>
      </div>
  </div>
  );
};

export default OrcamentoResumoValoresForm;
