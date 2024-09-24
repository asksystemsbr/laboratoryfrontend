// src/models/Cliente.ts
export interface Cliente {
    status: string;
    id?: number;
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    numero?: string;
    telefone?: string;
    email?: string;
    situacaoId: number;
    dataCadastro: Date | string;
}
