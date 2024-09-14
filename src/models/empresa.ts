// src/models/empresa.ts
export interface Empresa {
    id?: number;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    dataAbertura?: Date;
    naturezaJuridica?: string;
    situacaoCadastral?: string;
    capitalSocial?: number;
  }  