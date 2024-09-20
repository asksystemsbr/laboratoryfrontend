//src/models/laboratorioApoioMateriais.ts
export interface LaboratorioApoioMateriais {
    id?: number;                           // Opcional porque é gerado pelo banco
    laboratorioApoioId: number;            // Requerido (chave estrangeira)
    materialApoioId: number;               // Requerido (chave estrangeira)
}
