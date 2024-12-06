//src/models/orcamentoDetalhe.ts
export interface OrcamentoDetalhe {
    id?: number;
    orcamentoId?: number;
    exameId?: number;
    valor?: number;
    dataColeta?: Date |string;
    horarioId?: number;
  }
  