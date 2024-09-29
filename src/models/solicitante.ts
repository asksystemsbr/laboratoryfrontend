// src/models/solicitante.ts
export interface Solicitante {
    id?: number;    
    descricao: string;
    crm: string;
    ufCrm: string;
    cpf: string;
    email: string;
    telefone: string;
    tipoSolicitanteId: string;
  }