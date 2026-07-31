import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renderiza "children" directamente como hijo de <body> (fuera del árbol de
 * la app) y, al imprimir, oculta completamente #root. Así el navegador solo
 * tiene una cosa para paginar: la etiqueta. Antes se usaba un truco con
 * "visibility: hidden" que ocultaba el resto de la página pero igual le
 * reservaba el espacio, y eso generaba hojas de más.
 */
export default function PrintFrame({ mmWidth, mmHeight, children }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page { size: ${mmWidth}mm ${mmHeight}mm; margin: 0; }
        html, body { margin: 0 !important; padding: 0 !important; }
        #root { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [mmWidth, mmHeight]);

  return createPortal(<div className="hidden print:block">{children}</div>, document.body);
}
