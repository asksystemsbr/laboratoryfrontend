declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: { finalY: number };
  }

  interface AutoTableOptions {
    head?: (string | number)[][];
    body: (string | number)[][];
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: {
      font?: string;
      fontSize?: number;
      cellPadding?: number;
      textColor?: string | number;
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      fillColor?: string | [number, number, number];
    };
    headStyles?: AutoTableOptions['styles'];
    bodyStyles?: AutoTableOptions['styles'];
    alternateRowStyles?: AutoTableOptions['styles'];
    tableWidth?: 'auto' | 'wrap' | number;
    didDrawPage?: (data: { pageNumber: number }) => void; // Adiciona `didDrawPage` com tipagem explícita
  }
}
