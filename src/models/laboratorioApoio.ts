//src/models/laboratorioApoio.ts
export interface LaboratorioApoio {
    id?: number;                           // Opcional porque é gerado pelo banco
    nomeLaboratorio?: string;              // Opcional
    logradouro?: string;                   // Opcional
    numero?: string;                       // Opcional
    complemento?: string;                  // Opcional
    bairro?: string;                       // Opcional
    cep?: string;                          // Opcional
    cidade?: string;                       // Opcional
    uf?: string;                           // Opcional
    urlApi?: string;                       // Opcional
}
