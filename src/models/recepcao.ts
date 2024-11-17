// src/models/recepcao.ts
export interface Recepcao {
    id?: number;    
    nomeRecepcao: string;
    cabecalhoOrcamento?:string;
    rodapeOrcamento?:string;
    enderecoId: number;
  }