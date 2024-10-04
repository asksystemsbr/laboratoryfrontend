// src/models/Cliente.ts
export interface Cliente {
    id?: number;
    nome: string;
    cpfCnpj?: string;
    enderecoId: number; // Corrigido para int e alinhado com o backend
    telefone?: string;
    email: string;
    situacaoId: number;
    dataCadastro: Date | string;

    sexo?: string; 
    nascimento?: Date | string;
    convenioId?: number; 
    planoId?: number; 
    rg?: string; 
    razaoSocial?: string; 
    ie?: string; 
    im?: string; 
    nomeResponsavel?: string; 
    cpfResponsavel?: string; 
    telefoneResponsavel?: string; 

    nomeFantasia?: string;
}