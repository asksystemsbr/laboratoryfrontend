//src/models/OrcamentoCabecalho .ts
export interface OrcamentoCabecalho {
    id?: number;
    pacienteId?: number;
    convenioId?: number;
    dataHora?: Date;
    nomePaciente?: string;
    status?: string;
    solicitanteId?: number;
    codConvenio?: string;
    planoId?: number;
    validadeCartao?: Date;
    guia?: string;
    titular?: string;
    senhaAutorizacao?: string;
    medicamento?: string;
    observacoes?: string;
    total?: number;
    recepcaoId?: number;
    usuarioId?: number;
  }
  