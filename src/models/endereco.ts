// src/models/endereco.ts
export interface Endereco {
    id?: number;    
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  }