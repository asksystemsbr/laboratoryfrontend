// src/models/snackbarState.ts
export class SnackbarState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
    progress: number;
  
    constructor(message: string = '', type: 'success' | 'error' = 'success', show: boolean = false) {
      this.show = show;
      this.message = message;
      this.type = type;
      this.progress = 100; // Inicia o progresso em 100%
    }
  
    // Método para mostrar o Snackbar com mensagem e tipo
    showSnackbar(message: string, type: 'success' | 'error', duration: number = 5000) {
      this.message = message;
      this.type = type;
      this.show = true;
      this.progress = 100;
  
      // Fechar automaticamente após o tempo configurado (por padrão, 5 segundos)
      setTimeout(() => {
        this.hideSnackbar();
      }, duration);
    }
  
    // Método para ocultar o Snackbar
    hideSnackbar() {
      this.show = false;
      this.progress = 0;
    }
  
    // Método para resetar a barra de progresso
    resetProgress() {
      this.progress = 100;
    }
  }
  