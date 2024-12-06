//src/models/orcamentoPagamento.ts
export interface OrcamentoPagamento {
    id?: number;
    pagamentoId?: number;
    valor?: number;
    orcamentoId?: number;
    dataPagamento?: Date | string;
  }
   