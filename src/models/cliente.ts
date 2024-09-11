// src/models/Cliente.ts
export interface Cliente {
    id?: number;
    nome: string;
    cpfCnpj?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    situacaoId: number;
    dataCadastro: Date;
}
