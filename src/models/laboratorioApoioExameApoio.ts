//src/models/laboratorioApoioExameApoio.ts
export interface LaboratorioApoioExameApoio {
    id?: number;                           // Opcional porque é gerado pelo banco
    laboratorioApoioId: number;            // Requerido (chave estrangeira)
    exameApoioId: number;                  // Requerido (chave estrangeira)
}
