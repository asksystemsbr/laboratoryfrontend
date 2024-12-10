//src/models/orcamentoDetalhe.ts
export interface OrcamentoDetalhe {
    id?: number;
    orcamentoId?: number;
    exameId?: number;
    valor?: number;
    dataColeta?: Date |string;
    prazoFinal?: Date |string;
    horarioId?: number;
    status?: string;
  }
  