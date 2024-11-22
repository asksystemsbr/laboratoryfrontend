//src/models/agendamentoCabecalho.ts
export interface AgendamentoCabecalho {
    id?: number;
    pacienteId?: number;
    convenioId?: number;
    dataHora?: Date | string;
    nomePaciente?: string;
    status?: string;
    solicitanteId?: number;
    codConvenio?: string;
    planoId?: number;
    validadeCartao?: Date | string | null;
    guia?: string;
    titular?: string;
    senhaAutorizacao?: string;
    medicamento?: string;
    observacoes?: string;
    total?: number;
    recepcaoId?: number;
    usuarioId?: number;
    desconto?: number;
    tipoDesconto?: string;
  }
  