// src/models/convenio.ts
export interface Convenio {
    id?: number;    
    descricao: string;
    enderecoId: number;

    digitosValidarMatricula?: number;  // Quantidade de dígitos para validar matrícula
    liquidacao?: string;  // Via Fatura ou Via Caixa
    codigoPrestador?: string;  // Código do prestador
    versaoTiss?: string;  // Versão da TISS
    cnesConvenio?: string;  // CNES do convênio
    codOperadoraTiss?: string;  // Código da operadora TISS
    codOperadora?: string;  // Código da operadora para autorização
    urlIntegracao?: string;  // URL da API de integração
    inicioNumeracao?: string;  // Início da numeração
    usuarioAcessoWeb?: string;  // Usuário de acesso web
    senhaAcessoWeb?: string;  // Senha de acesso web
    envioCronograma?: number;  // Envio do cronograma (número)
    ateCronograma?: Date | string;  // Até o cronograma
    vencimentoCronograma?: Date | string;  // Data de vencimento do cronograma
    observacoes?: string;  // Campo de observações
    instrucoes?: string;  // Campo de instruções
    empresaId?: number;  // Relacionamento com empresa
    planos?: Plano[];
  }

  import { Plano } from './plano';