//src/models/formaPagamento.ts
export interface FormaPagamento {
    id?: number;    
    descricao: string;
    valor: number;
    dataPagamento?: Date | string;
  }