// src/models/plano.ts
export interface Plano {
    id?: number;    
    descricao: string;
    tabelaPrecoId: number;
    convenioId: number;
    custoHorario: number;
    filme: number;
    codigoArnb: string;
  }