export interface Convenio {
  id: number;
  nomeConvenio: string;
}

export interface Plano {
  id: number;
  nomePlano: string;
  convenioId: number;
}

export interface RecepcaoConvenioPlano {
  id: number;
  recepcaoId: number;
  convenioId: number | null;
  planoId: number | null;
  convenio?: Convenio;
  plano?: Plano;
}

export interface Recepcao {
  id: number;
  nomeRecepcao: string;
  enderecoId: number;
  conveniosPlanos: RecepcaoConvenioPlano[];
}