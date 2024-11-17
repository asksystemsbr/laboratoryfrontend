//src/models/agendamentoDetalhe.ts
export interface AgendamentoDetalhe {
    id?: number;
    agendamentoId?: number;
    exameId?: number;
    valor?: number;
    dataColeta?: Date |string;
  }
  