//src/models/agendamentoHorario.ts
export interface AgendamentoHorario {
    id?: number;
    recepcaoId?: number;
    convenioId?: number;
    planoId?: number;
    solicitanteId?: number;
    especialidadeId?: number;
    unidadeId?: number;
    exameId?: number;
    dataInicio?: Date | string | null;
    horaInicio?: string | null;
    horaFim?:  string | null;
    duracaoMinutos?: number ;
    intervaloMinutos?: number | string;


    dataFim?: Date | string | null;
    unidade?: string;
    convenio?: string;
    plano?: string;
    solicitante?: string;
    especialidade?: string;
    exame?: string;
    
  }
  