//src/models/tabelaPrecoItens.ts
export interface TabelaPrecoItens {
    id?: number;    
    tabelaPrecoId: number;
    exameId: number ;
    valor: number;
    custoOperacional: number;
    custoHorario: number;
    filme: number;
    codigoArnb: string;
    nomeExame?: string; // Novo campo para o nome do exame
  }