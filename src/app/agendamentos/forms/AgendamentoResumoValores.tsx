//src/app/agendamentos/forms/AgendamentoResumoValores.tsx
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import React, { useEffect, useState } from 'react';

interface AgendamentoResumoValoresFormProps {
    subtotal: number;
    desconto: number;
    total: number;
    isEditable: boolean;
    onDescontoChange: (novoDesconto: number, isPercentage: boolean) => void;
    isPercentageRef: boolean;
}

const AgendamentoResumoValoresForm: React.FC<AgendamentoResumoValoresFormProps> = ({ 
      subtotal, 
      desconto, 
      total,
      isEditable,
      onDescontoChange,
      isPercentageRef
    }) => {
  
      const [descontoInput, setDescontoInput] = useState(desconto);
      const [isPercentage, setIsPercentage] = useState(false);
    
      useEffect(() => {
        setIsPercentage(isPercentageRef);
      }, []);

      useEffect(() => {
        onDescontoChange(descontoInput, isPercentage);
      }, [descontoInput, isPercentage, onDescontoChange]);
    
      const handleDescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setDescontoInput(value);
      };
    
      const toggleDescontoType = () => {
        setIsPercentage((prev) => {
          const newIsPercentage = !prev;
          onDescontoChange(descontoInput, newIsPercentage); // Call onDescontoChange with updated type
          return newIsPercentage;
        });
      };
      
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
            onClick={toggleDescontoType}
            disabled={!isEditable}
            className="ml-2 px-2 py-1 text-sm rounded bg-gray-200"
          >
            {isPercentage ? "%" : "R$"}
          </button>
          <input
            type="number"
            value={descontoInput}
            onChange={handleDescontoChange}
            disabled={!isEditable}
            className="border rounded w-20 py-1 px-2 text-sm"
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

export default AgendamentoResumoValoresForm;
