//src/models/laboratorioApoio.ts
export interface LaboratorioApoio {
    id?: number;                           // Opcional porque é gerado pelo banco
    nomeLaboratorio?: string;              // Opcional
    urlApi?: string;                       // Opcional
    cpfCnpj?: string;
    enderecoId: number; 
}
