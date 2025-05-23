// src/models/Cliente.ts
export interface Cliente {
    id?: number;
    nome: string;
    cpfCnpj?: string;
    enderecoId?: number; // Corrigido para int e alinhado com o backend
    telefone?: string;
    telefoneCelular: string;
    email?: string;
    situacaoId: number;
    dataCadastro: Date | string;

    sexo?: string; 
    nascimento?: Date | string | null;
    convenioId?: number; 
    planoId?: number; 
    rg?: string; 
    razaoSocial?: string; 
    ie?: string; 
    im?: string; 
    nomeResponsavel?: string; 
    cpfResponsavel?: string; 
    telefoneResponsavel?: string; 

    nomeSocial?: string;
    nomeMae?: string;
    foto?: ArrayBuffer | string |  null; // Usando ArrayBuffer para representar binário em TS
    profissao?: string;
    matricula?: string;
    validadeMatricula?: Date | string | null;
    titularConvenio?: string;

    nomeFantasia?: string;
    senha?: string;
}