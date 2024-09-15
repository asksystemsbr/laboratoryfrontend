//src/models/exameApoio.ts
export interface ExameApoio {
    id?: number;    
    codigoExame? : string;
    nomeExame  : string;
    apoio   : string;
    dias    : number;
    especialidadeExameId    : number;
    setorExameId    : number;
    valorAtual    : number;
  }