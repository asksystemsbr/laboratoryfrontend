//src/app/orcamentos/orcamentoCreate.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm,FormProvider } from 'react-hook-form'; 
import { Exame } from '../../models/exame';
import { Convenio } from '../../models/convenio';
import { Plano } from '../../models/plano';
import { FormaPagamento } from '../../models/formaPagamento';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import { useFieldArray, useFormContext } from 'react-hook-form';

interface OrcamentoCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const OrcamentoCreateForm = ({ onSave, onClose,setSnackbar  }: OrcamentoCreateFormProps) => {
  const methods = useForm(); 
  const [exames, setExames] = useState<Exame[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const { register,handleSubmit,reset } = useForm(); // Mantendo apenas o `register`
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadExames = async () => {
    try {
      const response = await axios.get('/api/Exame');
      setExames(response.data);
    } catch (error) {
      console.error('Erro ao carregar exames', error);
    }
  };

  const loadConvenios = async () => {
    try {
      const response = await axios.get('/api/Convenio');
      setConvenios(response.data);
    } catch (error) {
      console.error('Erro ao carregar convênios', error);
    }
  };

  const loadPlanos = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Convenio/${convenioId}/Planos`);
      setPlanos(response.data);
    } catch (error) {
      console.error('Erro ao carregar planos', error);
    }
  };

  const loadFormasPagamento = async () => {
    try {
      const response = await axios.get('/api/FormaPagamento');
      setFormasPagamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento', error);
    }
  };

  useEffect(() => {
    loadExames();
    loadFormasPagamento();
    loadConvenios();
  }, []);


  const ClienteForm = () => (
    <div className="form-section">
      <h3 className="text-xl font-semibold text-center mb-4">Dados do Paciente</h3>
      <div className="grid grid-cols-5 gap-4">
      <input type="text"  
        {...register('cliente.nome')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Nome" />
      <input
        type="text"
        {...register('cliente.sexo')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Sexo"
      />
      <input
        type="date"
        {...register('cliente.dataNascimento')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Data de Nascimento"
      />
      <input
        type="text"
        {...register('cliente.rg')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="RG"
      />
      <input
        type="text"
        {...register('cliente.cpf')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="CPF"
      />
    </div>

    <div className="grid grid-cols-6 gap-4 mt-4">      
      <input
        type="text"
        {...register('cliente.cep')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="CEP"
      />
      <input
        type="text"
        {...register('cliente.endereco')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Endereço"
      />
      <input
        type="text"
        {...register('cliente.cidade')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Cidade"
      />
      <input
        type="text"
        {...register('cliente.telefone')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Telefone"
      />
      <input
        type="text"
        {...register('cliente.celular')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Celular"
      />
      <input
        type="email"
        {...register('cliente.email')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Email"
      />
      </div>
    </div>
  );

  const ConvenioForm = () => (
    <div className="form-section mt-8 border-t border-b py-4">
      <h3 className="text-xl font-semibold text-center mb-4">Solicitante e Plano</h3>
      <div className="grid grid-cols-5 gap-4">
      <input
        type="text"
        {...register('convenio.solicitante')}
         className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Nome do Solicitante"
      />
      <input
        type="text"
        {...register('convenio.crm')}
         className="border rounded w-full py-2 px-3 mt-1"
        placeholder="CRM"
      />
      <input
        type="text"
        {...register('convenio.codigo')}
         className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Código do Convênio"
      />
      <select 
          {...register('codigoConvenio')} 
          onChange={(e) => loadPlanos(parseInt(e.target.value))}
          className="border rounded w-full py-2 px-3 mt-1"
      >
        <option value="">Selecione um Convênio</option>
        {convenios.map((convenio) => (
          <option key={convenio.id} value={convenio.id}>
            {convenio.descricao}
          </option>
        ))}
      </select>
      <select 
        {...register('plano.id')}
        className="border rounded w-full py-2 px-3 mt-1"
        >
        <option value="">Selecione um Plano</option>
        {planos.map((plano) => (
          <option key={plano.id} value={plano.id}>
            {plano.descricao}
          </option>
        ))}
      </select>
      </div>

<div className="grid grid-cols-4 gap-4 mt-4">      
      <input type="date" 
       {...register('validadeCartao')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Validade do Cartão" />
      <input 
        type="text" 
        {...register('guia')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Guia" />
      <input 
        type="text" 
        {...register('titular')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Titular" />
      <input 
       type="text"
       {...register('senhaAutorizacao')}
        className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Senha de Autorização" />
    </div>
    </div>
  );

  const ExamesForm = () => {
    const { register, control } = useFormContext(); // Obtém o contexto do formulário principal
    // const [codigoExame, setCodigoExame] = useState('');
    // const [nomeExame, setNomeExame] = useState('');
    // const [valorExame, setValorExame] = useState('');
    // const [dataColeta, setDataColeta] = useState('');
    const { fields, append,remove  } = useFieldArray({
      control,
      name: 'exames', // Lista de exames
    });

    const adicionarExame = () => {
      append({
        codigo: '',
        nomeExame: '',
        dataColeta: '',
        valor: 0,
      });
    };

    return (
      <div className="form-section mt-8 border-t border-b py-4">
        <h3 className="text-xl font-semibold text-center mb-4">Lista de Exames</h3>
        
        
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-11">
            <select {...register('codigoExame')}
                className="border rounded w-full py-2 px-3">
                <option value="">Selecione um Exame</option>
                {exames.map((exame) => (
                  <option key={exame.id} value={exame.nomeExame}>
                    {exame.nomeExame}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-span-1 text-left">
            <button onClick={adicionarExame}
              className="py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200"
              >+
            </button>          
          </div>
        </div>
        {fields.length > 0 && (
          <div className="mt-4 grid grid-cols-12 gap-4 font-semibold">
            <div className="col-span-3">Código</div>
            <div className="col-span-3">Nome do Exame</div>
            <div className="col-span-3">Data Coleta</div>
            <div className="col-span-2">Valor</div>
            <div className="col-span-1"></div> {/* Para o botão de remoção */}
          </div>
        )}
        {fields.map((exame, index) => (
            <div key={exame.id}  className="grid grid-cols-12 gap-4 mt-2 items-center">
              <input
                type="text"
                {...register(`exames.${index}.codigo`)}
                className="col-span-2 border rounded w-full py-2 px-3"
                placeholder="Código do Exame"
              />
              <input
                type="text"
                {...register(`exames.${index}.nomeExame`)}
                className="col-span-5 border rounded w-full py-2 px-3"
                placeholder="Nome do Exame"
              />
              <input
                type="date"
                {...register(`exames.${index}.dataColeta`)}
                className="col-span-3 border rounded w-full py-2 px-3"
                placeholder="Data Coleta"
              />
            <span className="col-span-1 text-right">{(`exames.${index}.valor`)}</span>
              {/* Botão de remover */}
              <div className="col-span-1 text-right">
                <button
                  onClick={() => remove(index)}
                  className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transition-all duration-200"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 mt-4">
        <textarea 
          {...register('medicamento')}
         className="border rounded w-full py-2 px-3 mt-1"
        placeholder="Medicamentos"></textarea>
        <textarea
          {...register('observacoes')}
          className="border rounded w-full py-2 px-3 mt-1"
          placeholder="Observações"></textarea>
      </div>
      </div>
    );
  };

  const PagamentoForm = () => {
    // const [pagamentos, setPagamentos] = useState<{ formaPagamento: string; valorPagamento: string }[]>([]);
    // const [formaPagamento, setFormaPagamento] = useState('');
    // const [valorPagamento, setValorPagamento] = useState('');

    // const adicionarPagamento = () => {
    //   setPagamentos([...pagamentos, { formaPagamento, valorPagamento }]);
    //   setFormaPagamento('');
    //   setValorPagamento('');
    // };
    const { register, control } = useFormContext();
    const { fields, append,remove  } = useFieldArray({
      control,
      name: 'pagamentos', // Lista de formas de pagamento
    });
  
    const adicionarPagamento = () => {
      append({
        formaPagamento: '',
        valorPagamento: '',
      });
    };

    return (
      <div className="form-section mt-8 border-t border-b py-4">
        <h3 className="text-xl font-semibold text-center mb-4">Forma de Pagamento</h3>

        {/* Select e botão "Adicionar Pagamento" lado a lado em colunas */}
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-11">
            <select {...register('pagamentoId')}
                className="border rounded w-full py-2 px-3">
              <option value="">Selecione um Pagamento</option>
              {formasPagamento.map((pagamento) => (
                <option key={pagamento.id} value={pagamento.descricao}>
                  {pagamento.descricao}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 text-right">            
            <button onClick={adicionarPagamento}
              className="py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200"
              >+
            </button>
          </div>
        </div>
        {fields.map((pagamento, index) => (
          <div key={pagamento.id} className="grid grid-cols-12 gap-4 mt-2 items-center">
          <span className="col-span-6">Forma Pagamento: {index}</span>            
          <input
            type="number"
            {...register(`pagamentos.${index}.valorPagamento`)}
            className="col-span-4 border rounded w-full py-2 px-3"
            placeholder="Valor a ser pago"
          />
          {/* Botão de remover */}
          <div className="col-span-2 text-right">
              <button
                onClick={() => remove(index)}
                className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-lg hover:bg-red-600 transition-all duration-200"
              >
                -
              </button>
            </div>          
        </div>
      ))}

      
      </div>
    );
  };

  const ResumoValores = () => {
    const [subtotal ] = useState(0);
    const [desconto] = useState(0);

    const total = subtotal - desconto;

    return (
      <div className="form-section mt-1">
        <h3 className="text-xl font-semibold text-center mb-4">Resumo</h3>
        <div className="flex flex-col space-y-4">
        <div>
          <label>Subtotal: </label>
          <span className="text-lg">{subtotal.toFixed(2)}</span>
        </div>
        <div>
          <label>Desconto: </label>
          <span className="text-lg">{desconto.toFixed(2)}</span>
         </div>
        <div>
          <label>Total: </label>
          <span className="text-lg">{total.toFixed(2)}</span>
        </div>
      </div>
      </div>
    );
  };

  
  const onSubmit = async (data: OrcamentoCabecalho) => {
    if (isSubmitting) return;

    try {
        setIsSubmitting(true); 
        await axios.post('/api/Orcamento', data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }finally {
        setIsSubmitting(false); 
      }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      {/* Envolva todo o formulário com FormProvider e passe os métodos */}
      <FormProvider {...methods}>
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="p-4 max-w-7xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        <ClienteForm />
        <ConvenioForm />
        <ExamesForm />
        <div className="grid grid-cols-2 gap-20 mt-1">
            <PagamentoForm />
            <ResumoValores />            
          </div>
        <div className="buttons text-center mt-8">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="mr-2 py-2 px-4 rounded bg-blue-500 text-white">
            Salvar
          </button>
          <button type="button" className="py-2 px-4 rounded bg-blue-500 text-white">
            Transformar em Pedido
            </button>
        </div>
      </form>
    </FormProvider>
    </div>
  );
};
