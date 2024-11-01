// src/models/exame.ts
export interface Exame {
    [key: string]: unknown;
    id?: number;  // Equivalente ao campo "ID" no C# 
    codigoExame?: string;  // Corresponde a "CODIGO_EXAME"                             - view
    nomeExame: string;  // Mapeia o campo "EXAME"                                           - view
    prazo: number;  // Mapeia o campo "PRAZO"                                           - view
    metodo?: string;  // Corresponde a "METODO"                                         - view
    preparo?: string;  // Corresponde a "PREPARO"                                       - view
    preparoF?: string;  // Corresponde a "PREPAROF"                                     - view
    preparoC?: string;  // Corresponde a "PREPAROC"                                     - view
    agenda?: boolean;  // Corresponde a "AGENDA"
    agendasEelacionadas?: string;  // Corresponde a "AGENDASRELACIONADAS"
    destinoId?: number;  // Corresponde a "DESTINO"                                       - view
    sinonimos?: string;  // Corresponde a "SINONIMOS"                                   - view
    dissociar?: boolean;  // Corresponde a "DISSOCIAR"
    formulario?: string;  // Corresponde a "FORMULARIO"
    instrucoesPreparo?: string;  // Corresponde a "INSTRUCOESDEPREPARO"               - view
    coleta?: string;  // Corresponde a "COLETA"                                         - view
    distribuicao?: string;  // Corresponde a "DISTRIBUICAO"                             - view
    lembretes?: string;  // Corresponde a "LEMBRETES"                                   - view
    tecnicaDeColeta?: string;  // Corresponde a "TECNICADECOLETA"                       - view
    alertasRecep?: string;  // Corresponde a "ALERTASRECEP"                             - view
    alertasRecepOs?: string;  // Corresponde a "ALERTASRECEPOS"
    alertas?: string;  // Corresponde a "ALERTAS"
    alertasPos?: string;  // Corresponde a "ALERTASPOS"
    slExamesRefTabelaCod?: string;  // Corresponde a "SLEXAMESREF_TABELA_COD"
    sLExamesRefTabelaExame?: string;  // Corresponde a "SLEXAMESREF_TABELA_EXAME"
    sLExamesRefTabelaConv?: string;  // Corresponde a "SLEXAMESREF_TABELA_CONV"
    sLExamesRefTabelaPlano?: string;  // Corresponde a "SLEXAMESREF_TABELA_PLANO"
    sLExamesRefTabelaAut?: string;  // Corresponde a "SLEXAMESREF_TABELA_AUT"
    sLExamesRefTabelaValor: number;  // Mapeia o campo "SLEXAMESREF_TABELA_VALOR"
    estabilidade?: string;  // Corresponde a "ESTABILIDADE"                             - view
    tuss?: string;  // Corresponde a "TUSS"                                             - view
    meiosDeColeta?: string;  // Corresponde a "MEIOS_DE_COLETA"                       - view
    coletaPac?: string;  // Corresponde a "COLETAPAC"                                   - view
    coletaPacF?: string;  // Corresponde a "COLETAPACF"                                 - view
    coletaPacC?: string;  // Corresponde a "COLETAPACC"                                 - view
    materialApoioId: number;  // Corresponde a "MATERIAL_APOIO_ID"                    - view
    especialidadeId: number;  // Corresponde a "EPECIALIDADE_ID"                        - view
    setorId: number;  // Corresponde a "SETOR_ID"                                      - view
    volumeMinimo?: string;
    codigoExameApoio?: string;
    prazoApoio?: string;
    valorApoio?: string;
    versaoApoio?: string;
    diasRealizacaoApoio?: string;
    meioColetaSimilar?: string;
    materialColetaSimilar?: string;

    //orçamento/pedido
    preco: number;
    dataColeta: Date | string;
  }