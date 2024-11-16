//src/app/orcamentos/forms/OrcamentoResumoValoresForm.tsx
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import React, { useEffect, useState } from 'react';

interface PedidosResumoValoresFormProps {
    subtotal: number;
    desconto: number;
    total: number;
    isEditable: boolean;
    onDescontoChange: (novoDesconto: number, isPercentage: boolean) => void;
    isPercentageRef: boolean;
}

const PedidoResumoValoresForm: React.FC<PedidosResumoValoresFormProps> = ({ 
      subtotal, 
      desconto, 
      total,
      isEditable,
      onDescontoChange,
      isPercentageRef
    }) => {
  
      const [descontoInput] = useState(desconto);
      const [isPercentage, setIsPercentage] = useState(false);
    
      useEffect(() => {
        setIsPercentage(isPercentageRef);
      }, []);

      useEffect(() => {
        onDescontoChange(descontoInput, isPercentage);
      }, [descontoInput, isPercentage, onDescontoChange]);

      
  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Resumo</h3>

    <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <label>Subtotal: </label>
          <span className="text-lg font-semibold">{formatCurrencyBRL(formatDecimal(subtotal || 0,2 ))}</span>
        </div>
        <div className="flex justify-between items-center">
          <label>Desconto: </label>
          <button
            type="button"
            disabled={!isEditable}
            className="ml-2 px-2 py-1 text-sm rounded bg-gray-200"
          >
            {isPercentage ? "%" : "R$"}
          </button>
          <input
            type="number"
            value={descontoInput}
            className="border rounded w-20 py-1 px-2 text-sm"
            disabled
          />
        </div>
         <div className="flex justify-between">
          <label>Total: </label>
          <span className="text-lg font-semibold">{formatCurrencyBRL(formatDecimal(total || 0, 2))}</span>
        </div>
      </div>
  </div>
  );
};

export default PedidoResumoValoresForm;
