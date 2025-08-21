import React, { useState } from 'react';

const VistaPreviaCotizacion = ({ procedimiento, materiales, manoDeObra, prevStep, goHome }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  const calcularTotalMateriales = () => {
    return materiales.reduce((total, item) => total + item.total, 0);
  };

  const calcularTotalManoDeObra = () => {
    return manoDeObra.reduce((total, item) => total + item.total, 0);
  };

  const calcularTotalGeneral = () => {
    return calcularTotalMateriales() + calcularTotalManoDeObra();
  };

  const handleGenerarPDF = async () => {
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      const totales = {
        materiales: calcularTotalMateriales(),
        manoDeObra: calcularTotalManoDeObra(),
        general: calcularTotalGeneral()
      };

      // Paso 1: Generar el PDF
      const pdfResponse = await fetch('http://localhost:5000/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedimiento,
          materiales,
          manoDeObra,
          totales
        }),
      });

      const pdfData = await pdfResponse.json();

      if (!pdfResponse.ok) {
        throw new Error(pdfData.message || 'Error al generar el PDF');
      }

      const pdfPath = pdfData.pdfPath;
      setPdfUrl(`http://localhost:5000${pdfPath}`);

      // Paso 2: Guardar la cotización en la base de datos
      const saveResponse = await fetch('http://localhost:5000/api/save-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedimiento,
          materiales,
          manoDeObra,
          totales,
          pdfPath
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        console.warn('La cotización se generó pero no se pudo guardar en la base de datos:', saveData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al generar el PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Vista Previa de la Cotización</h2>

      <div className="preview-section">
        <h3>Información del Procedimiento</h3>
        <p><strong>Nombre:</strong> {procedimiento.nombre}</p>
        <p><strong>Descripción:</strong> {procedimiento.descripcion}</p>
      </div>

      <div className="preview-section">
        <h3>Detalles de la Cotización</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {manoDeObra.length > 0 && (
                <>
                  <tr className="category-header">
                    <td colSpan="5">Mano de Obra</td>
                  </tr>
                  {manoDeObra.map((item, index) => (
                    <tr key={`mano-${index}`}>
                      <td>Mano de Obra</td>
                      <td>{item.descripcion}</td>
                      <td>{item.cantidad.toLocaleString('es-CO')}</td>
                      <td>${item.precioUnitario.toLocaleString('es-CO')}</td>
                      <td>${item.total.toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="4">Subtotal Mano de Obra</td>
                    <td>${calcularTotalManoDeObra().toLocaleString('es-CO')}</td>
                  </tr>
                </>
              )}
              
              {materiales.length > 0 && (
                <>
                  <tr className="category-header">
                    <td colSpan="5">Materiales</td>
                  </tr>
                  {materiales.map((item, index) => (
                    <tr key={`material-${index}`}>
                      <td>Material</td>
                      <td>{item.descripcion}</td>
                      <td>{item.cantidad.toLocaleString('es-CO')}</td>
                      <td>${item.precioUnitario.toLocaleString('es-CO')}</td>
                      <td>${item.total.toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="4">Subtotal Materiales</td>
                    <td>${calcularTotalMateriales().toLocaleString('es-CO')}</td>
                  </tr>
                </>
              )}
              
              <tr className="total-row">
                <td colSpan="4">TOTAL GENERAL</td>
                <td>${calcularTotalGeneral().toLocaleString('es-CO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      {error && <div className="alert alert-danger">{error}</div>}

      {pdfUrl && (
        <div className="preview-section">
          <p>PDF generado correctamente. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Descargar PDF</a></p>
        </div>
      )}

      <div className="form-buttons">
        <div>
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            Anterior
          </button>
        </div>
        <div>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleGenerarPDF}
            disabled={isLoading}
            style={{ marginRight: '10px' }}
          >
            {isLoading ? 'Generando...' : 'Generar PDF'}
          </button>
          {pdfUrl && (
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={goHome}
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VistaPreviaCotizacion;