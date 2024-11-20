//src/models/pedidoDetalhe.ts
export interface PedidoDetalhe {
    id?: number;
    pedidoId?: number;
    exameId?: number;
    valor?: number;
    dataColeta?: Date |string;
  }
  