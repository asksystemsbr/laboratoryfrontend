//src/app/plano/planoedit.tsx
"use client";
import React, {useEffect,useRef,useState} from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Plano } from '../../models/plano';
import { SnackbarState } from '@/models/snackbarState';
import { formatDecimal } from '@/utils/numbers';
import { TabelaPreco } from '@/models/tabelaPreco';

interface PlanoEditFormProps {
  plano: Plano;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const PlanoEditForm = ({ plano, onSave, onClose,setSnackbar  }: PlanoEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors },setValue  } = useForm<Plano>({
    defaultValues: plano,
  });

  const [tabelaPreco, setTabelaPreco] = useState<TabelaPreco[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSetDefaultValue = useRef(false);

  useEffect(() => {
    const loadTabelas = async () => {
      try {
        const response = await axios.get('/api/TabelaPreco');
        setTabelaPreco(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar tabela de Preço!', 'error', true));
      }
    };
    Promise.all([loadTabelas()]).then(() => setIsLoaded(true));
  },[setSnackbar]);

  useEffect(() => {
    if (isLoaded && !hasSetDefaultValue.current) {
      setValue('tabelaPrecoId', plano.tabelaPrecoId); 
      hasSetDefaultValue.current = true; // Mark as set
    }
  }, [isLoaded, plano.tabelaPrecoId, setValue]);

  const onSubmit = async (data: Plano) => {
    try {
        if(plano.id==0)  {
          await axios.post('/api/Plano', data);
        }
        else{
          await axios.put(`/api/Plano/${plano.id}`, data);
        }        
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  const handleDecimalChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Plano) => {
    const value = parseFloat(event.target.value);
    const formattedValue = isNaN(value) ? 0 : formatDecimal(value, 4); // Formata o valor com 4 casas decimais
    setValue(fieldName, formattedValue); // Atualiza o valor no formulário
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Planos / Convênios</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Descrição</label>
        <textarea
          {...register('descricao', { required: 'A descrição é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao?.message}</p>}
      </div>
                  
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-gray-700">Custo Horário</label>
          <input
                  type="number"
                  step="0.0001"
                  min="0.0000" // Valor mínimo
                  {...register('custoHorario')}
                  onChange={(e) => handleDecimalChange(e, 'custoHorario')}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
        </div>
        <div>
          <label className="block text-gray-700">Custo Filme</label>
          <input
              type="number"
              step="0.0001" // Permite 4 casas decimais
              min="0.0000" // Valor mínimo
              {...register('filme')}
              onChange={(e) => handleDecimalChange(e, 'filme')}
              className="border rounded w-full py-2 px-3 mt-1"
            />
        </div>
        <div>
          <label className="block text-gray-700">Código ARNB</label>
          <input
                type='text'
                {...register('codigoArnb')}
                className="border rounded w-full py-2 px-3 mt-1"
                placeholder="Código ARNB"
              />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Tabela de Preço</label>
        <select
          {...register('tabelaPrecoId',{
            validate: (value) => value !== -1 || 'Selecione uma tabela válida',
            onChange: (e) => setValue('tabelaPrecoId', parseInt(e.target.value)) // Converte string para number
          })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value={-1}>Selecione a tabela</option>
          {tabelaPreco.map((tabela) => (
            <option key={tabela.id} value={tabela.id}>
              {tabela.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
          Cancelar
        </button>
        <button type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
          Salvar
        </button>
      </div>
    </form>
  );
};
