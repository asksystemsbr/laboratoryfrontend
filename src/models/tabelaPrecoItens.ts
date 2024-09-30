// src/models/tabelaPreco.ts
export interface TabelaPreco {
    id?: number;    
    tabelaPrecoId: number;
    exameId: number;
    valor: number;
    custoOperacional: number;
    custoHorario: number;
    filme: number;
    codigoArnb: string;
  }