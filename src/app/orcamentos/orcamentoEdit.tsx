import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; 
import { Exame } from '../../models/exame';
import { Convenio } from '../../models/convenio';
import { Plano } from '../../models/plano';
import { FormaPagamento } from '../../models/formaPagamento';
import { SnackbarState } from '@/models/snackbarState';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';

interface OrcamentoEditFormProps {
  orcamentoCabecalho: OrcamentoCabecalho;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const OrcamentoEditForm= ({ orcamentoCabecalho, onSave, onClose,setSnackbar  }: OrcamentoEditFormProps) => {
  const [exames, setExames] = useState<Exame[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const { register,reset,handleSubmit } = useForm(); // Mantendo apenas o `register`

  const loadExames = async () => {
    try {
      const response = await axios.get('/api/Exames');
      setExames(response.data);
    } catch (error) {
      console.error('Erro ao carregar exames', error);
    }
  };

  const loadConvenios = async () => {
    try {
      const response = await axios.get('/api/Convenios');
      setConvenios(response.data);
    } catch (error) {
      console.error('Erro ao carregar convênios', error);
    }
  };

  const loadPlanos = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Convenios/${convenioId}/Planos`);
      setPlanos(response.data);
    } catch (error) {
      console.error('Erro ao carregar planos', error);
    }
  };

  const loadFormasPagamento = async () => {
    try {
      const response = await axios.get('/api/FormasPagamento');
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
      <h3>Dados do Cliente</h3>
      <input type="text" placeholder="Nome" />
      <input type="text" placeholder="Sexo" />
      <input type="date" placeholder="Data de Nascimento" />
      <input type="text" placeholder="RG" />
      <input type="text" placeholder="CPF" />
      <input type="text" placeholder="CEP" />
      <input type="text" placeholder="Endereço" />
      <input type="text" placeholder="Cidade" />
      <input type="text" placeholder="Telefone" />
      <input type="text" placeholder="Celular" />
      <input type="email" placeholder="Email" />
    </div>
  );

  const ConvenioForm = () => (
    <div className="form-section">
      <h3>Dados do Convênio e Plano</h3>
      <input type="text" placeholder="Nome do Solicitante" />
      <input type="text" placeholder="CRM" />
      <input type="text" placeholder="Código do Convênio" />
      <select {...register('codigoConvenio')} onChange={(e) => loadPlanos(parseInt(e.target.value))}>
        <option value="">Selecione um Convênio</option>
        {convenios.map((convenio) => (
          <option key={convenio.id} value={convenio.id}>
            {convenio.descricao}
          </option>
        ))}
      </select>
      <select {...register('plano')}>
        <option value="">Selecione um Plano</option>
        {planos.map((plano) => (
          <option key={plano.id} value={plano.id}>
            {plano.descricao}
          </option>
        ))}
      </select>
      <input type="date" placeholder="Validade do Cartão" />
      <input type="text" placeholder="Guia" />
      <input type="text" placeholder="Titular" />
      <input type="text" placeholder="Senha de Autorização" />
    </div>
  );

  const ExamesForm = () => {
    const [codigoExame, setCodigoExame] = useState('');
    const [nomeExame, setNomeExame] = useState('');
    const [valorExame, setValorExame] = useState('');
    const [dataColeta, setDataColeta] = useState('');

    const adicionarExame = () => {
      setExames([...exames, {
        id: exames.length + 1,
        codigo: codigoExame,
        nomeExame: nomeExame,
        prazo: 0,  // Defina valores padrão ou inputs
        sLExamesRefTabelaValor: 0,
        materialApoioId: 0,
        especialidadeId: 0,
        setorId: 0
      }]);
      setCodigoExame('');
      setNomeExame('');
      setValorExame('');
      setDataColeta('');
    };

    return (
      <div className="form-section">
        <h3>Lista de Exames</h3>
        <input
          type="text"
          value={codigoExame}
          placeholder="Código do Exame"
          onChange={(e) => setCodigoExame(e.target.value)}
        />
        <input
          type="text"
          value={nomeExame}
          placeholder="Nome do Exame"
          onChange={(e) => setNomeExame(e.target.value)}
        />
        <input
          type="date"
          value={dataColeta}
          placeholder="Data Coleta"
          onChange={(e) => setDataColeta(e.target.value)}
        />
        <input
          type="number"
          value={valorExame}
          placeholder="Valor do Exame"
          onChange={(e) => setValorExame(e.target.value)}
        />
        <button onClick={adicionarExame}>Adicionar Exame</button>

        <select {...register('codigoExame')}>
          <option value="">Selecione um Exame</option>
          {exames.map((exame) => (
            <option key={exame.id} value={exame.nomeExame}>
              {exame.nomeExame}
            </option>
          ))}
        </select>

        <textarea placeholder="Medicamentos"></textarea>
        <textarea placeholder="Observações"></textarea>
      </div>
    );
  };

  const PagamentoForm = () => {
    const [pagamentos, setPagamentos] = useState<{ formaPagamento: string; valorPagamento: string }[]>([]);
    const [formaPagamento, setFormaPagamento] = useState('');
    const [valorPagamento, setValorPagamento] = useState('');

    const adicionarPagamento = () => {
      setPagamentos([...pagamentos, { formaPagamento, valorPagamento }]);
      setFormaPagamento('');
      setValorPagamento('');
    };

    return (
      <div className="form-section">
        <h3>Forma de Pagamento</h3>
        <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as string)}>
          <option value="">Selecione a forma de pagamento</option>
          {formasPagamento.map((pagamento) => (
            <option key={pagamento.id} value={pagamento.descricao}>
              {pagamento.descricao}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={valorPagamento}
          placeholder="Valor a ser pago"
          onChange={(e) => setValorPagamento(e.target.value)}
        />
        <button onClick={adicionarPagamento}>Adicionar Pagamento</button>

        <ul>
          {pagamentos.map((pagamento, index) => (
            <li key={index}>
              {pagamento.formaPagamento} - R$ {pagamento.valorPagamento}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const ResumoValores = () => {
    const [subtotal, setSubtotal] = useState(0);
    const [desconto, setDesconto] = useState(0);

    const total = subtotal - desconto;

    return (
      <div className="form-section">
        <h3>Resumo</h3>
        <input
          type="number"
          value={subtotal}
          placeholder="Subtotal"
          onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
        />
        <input
          type="number"
          value={desconto}
          placeholder="Desconto"
          onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
        />
        <input type="number" value={total} placeholder="Total" readOnly />
      </div>
    );
  };

  const onSubmit = async (data: OrcamentoCabecalho) => {
    try {
        await axios.put(`/api/Orcamento/${orcamentoCabecalho.id}`, data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container">
      <ClienteForm />
      <ConvenioForm />
      <ExamesForm />
      <ResumoValores />
      <PagamentoForm />
      <div className="buttons">
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
  );
};
