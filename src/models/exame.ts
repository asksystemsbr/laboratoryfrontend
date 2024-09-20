// src/models/exame.ts
export interface Exame {
    id?: number;  // Equivalente ao campo "ID" no C# 
    codigo_exame?: string;  // Corresponde a "CODIGO_EXAME"                             - view
    exame: string;  // Mapeia o campo "EXAME"                                           - view
    prazo: number;  // Mapeia o campo "PRAZO"                                           - view
    metodo?: string;  // Corresponde a "METODO"                                         - view
    preparo?: string;  // Corresponde a "PREPARO"                                       - view
    preparof?: string;  // Corresponde a "PREPAROF"                                     - view
    preparoc?: string;  // Corresponde a "PREPAROC"                                     - view
    agenda?: boolean;  // Corresponde a "AGENDA"
    agendasrelacionadas?: string;  // Corresponde a "AGENDASRELACIONADAS"
    destino?: string;  // Corresponde a "DESTINO"                                       - view
    sinonimos?: string;  // Corresponde a "SINONIMOS"                                   - view
    dissociar?: boolean;  // Corresponde a "DISSOCIAR"
    formulario?: string;  // Corresponde a "FORMULARIO"
    instrucoesdepreparo?: string;  // Corresponde a "INSTRUCOESDEPREPARO"               - view
    coleta?: string;  // Corresponde a "COLETA"                                         - view
    distribuicao?: string;  // Corresponde a "DISTRIBUICAO"                             - view
    lembretes?: string;  // Corresponde a "LEMBRETES"                                   - view
    tecnicadecoleta?: string;  // Corresponde a "TECNICADECOLETA"                       - view
    alertasrecep?: string;  // Corresponde a "ALERTASRECEP"                             - view
    alertasrecepos?: string;  // Corresponde a "ALERTASRECEPOS"
    alertas?: string;  // Corresponde a "ALERTAS"
    alertaspos?: string;  // Corresponde a "ALERTASPOS"
    slexamesref_tabela_cod?: string;  // Corresponde a "SLEXAMESREF_TABELA_COD"
    slexamesref_tabela_exame?: string;  // Corresponde a "SLEXAMESREF_TABELA_EXAME"
    slexamesref_tabela_conv?: string;  // Corresponde a "SLEXAMESREF_TABELA_CONV"
    slexamesref_tabela_plano?: string;  // Corresponde a "SLEXAMESREF_TABELA_PLANO"
    slexamesref_tabela_aut?: string;  // Corresponde a "SLEXAMESREF_TABELA_AUT"
    slexamesref_tabela_valor: number;  // Mapeia o campo "SLEXAMESREF_TABELA_VALOR"
    estabilidade?: string;  // Corresponde a "ESTABILIDADE"                             - view
    TUSS?: string;  // Corresponde a "TUSS"                                             - view
    MEIOS_DE_COLETA?: string;  // Corresponde a "MEIOS_DE_COLETA"                       - view
    COLETAPAC?: string;  // Corresponde a "COLETAPAC"                                   - view
    COLETAPACF?: string;  // Corresponde a "COLETAPACF"                                 - view
    COLETAPACC?: string;  // Corresponde a "COLETAPACC"                                 - view
    material_apoio_id: number;  // Corresponde a "MATERIAL_APOIO_ID"                    - view
    epecialidade_id: number;  // Corresponde a "EPECIALIDADE_ID"                        - view
    setor_id: number;  // Corresponde a "SETOR_ID"                                      - view
  }