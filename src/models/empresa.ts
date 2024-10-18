// src/models/empresa.ts
export interface Empresa {
    id?: number;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    telefone?: string;
    email?: string;
    dataAbertura?: Date | string;
    naturezaJuridica?: string;
    situacaoCadastral?: string;
    capitalSocial?: number;
    email1?: string; // Novo campo e_mail_1
    email2?: string; // Novo campo e_mail_2
    email3?: string; // Novo campo e_mail_3
    urlIntegracao?: string; // Novo campo URL_INTEGRACAO
    nomeBanco?: string; // Novo campo NOME_BANCO
    agenciaBanco?: string; // Novo campo AGENCIA_BANCO
    contaBanco?: string; // Novo campo CONTA_BANCO
    irpf?: number; // Novo campo IRPF
    pis?: number; // Novo campo PIS
    cofins?: number; // Novo campo COFINS
    csll?: number; // Novo campo CSLL
    iss?: number; // Novo campo ISS
    reterIss?: boolean; // Novo campo reter_ISS
    reterIr?: boolean; // Novo campo reter_IR
    reterPcc?: boolean; // Novo campo reter_PCC (PIS, COFINS, CSLL)
    optanteSimples?: boolean; // Novo campo optante_simples
    numeroSerialCertificadoDigital?: string; // Novo campo NS_CERTIFICADO_DIGITAL
    cnes?: string; // Novo campo CNES
    categoriaEmpresaId?: number; // Novo campo categoria_empresa_id
    enderecoId: number;
  }  