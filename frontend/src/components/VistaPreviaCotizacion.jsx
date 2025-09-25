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

      // Adaptar datos a estructura legacy del backend para PDF y DB
      const materialesLegacy = (materiales || []).map(m => ({
        descripcion: m.nombre
          ? `${m.nombre}${m.descripcion ? ' - ' + m.descripcion : ''}${m.unidadMedida ? ' (' + m.unidadMedida + ')' : ''}${m.proveedor ? ' [' + m.proveedor + ']' : ''}`
          : (m.descripcion || ''),
        cantidad: Number(m.cantidad || 0),
        precioUnitario: Number(m.precioUnitario || 0),
        total: Number(m.total || (Number(m.cantidad || 0) * Number(m.precioUnitario || 0))),
        // extra fields for richer PDF
        nombre: m.nombre || '',
        descripcionOriginal: m.descripcion || '',
        categoria: m.categoria || '',
        unidadMedida: m.unidadMedida || '',
        desperdicio: Number(m.desperdicio || 0),
        proveedor: m.proveedor || '',
        notas: m.notas || ''
      }));

      const manoDeObraLegacy = (manoDeObra || []).map(i => {
        const total = Number(i.total || 0);
        const unidades = Number(i.cantidadUnidades || 0);
        if (i.tipoUnidad === 'precioFijo') {
          return {
            descripcion: `${i.descripcion || ''} (Precio fijo)${i.notas ? ' - ' + i.notas : ''}`,
            cantidad: 1,
            precioUnitario: total,
            total,
            // extra fields
            tipoUnidad: i.tipoUnidad || 'precioFijo',
            cantidadTrabajadores: Number(i.cantidadTrabajadores || 1),
            cantidadUnidades: Number(i.cantidadUnidades || 1),
            tarifaPorUnidad: Number(i.tarifaPorUnidad || 0),
            costoAdicional: Number(i.costoAdicional || 0),
            notas: i.notas || '',
            descripcionOriginal: i.descripcion || ''
          };
        }
        const qty = unidades > 0 ? unidades : 1;
        const unit = qty > 0 ? (total / qty) : total;
        return {
          descripcion: `${i.descripcion || ''} (${i.tipoUnidad || ''} x ${i.cantidadTrabajadores || 1} trab.)${i.notas ? ' - ' + i.notas : ''}`,
          cantidad: qty,
          precioUnitario: unit,
          total,
          // extra fields
          tipoUnidad: i.tipoUnidad || '',
          cantidadTrabajadores: Number(i.cantidadTrabajadores || 1),
          cantidadUnidades: Number(i.cantidadUnidades || 0),
          tarifaPorUnidad: Number(i.tarifaPorUnidad || 0),
          costoAdicional: Number(i.costoAdicional || 0),
          notas: i.notas || '',
          descripcionOriginal: i.descripcion || ''
        };
      });

      // Paso 1: Generar el PDF
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedimiento,
          materiales: materialesLegacy,
          manoDeObra: manoDeObraLegacy,
          totales
        }),
      });

      const pdfData = await pdfResponse.json();

      if (!pdfResponse.ok) {
        throw new Error(pdfData.message || 'Error al generar el PDF');
      }

      const pdfPath = pdfData.pdfPath;
      setPdfUrl(pdfPath);

      // Paso 2: Guardar la cotización en la base de datos
      const saveResponse = await fetch('/api/save-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          procedimiento,
          materiales: materialesLegacy,
          manoDeObra: manoDeObraLegacy,
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
        <p><strong>Título:</strong> {procedimiento.nombre}</p>
        <p><strong>Descripción:</strong> {procedimiento.descripcion}</p>
        {procedimiento.ubicacion && <p><strong>Ubicación:</strong> {procedimiento.ubicacion}</p>}
        {(procedimiento.tiempoEstimado || procedimiento.tiempoUnidad) && (
          <p><strong>Tiempo estimado:</strong> {procedimiento.tiempoEstimado} {procedimiento.tiempoUnidad}</p>
        )}
        {procedimiento.dependencias && <p><strong>Dependencias:</strong> {procedimiento.dependencias}</p>}
        {procedimiento.prioridad && <p><strong>Prioridad/Fase:</strong> {procedimiento.prioridad}</p>}
        {procedimiento.notas && <p><strong>Notas:</strong> {procedimiento.notas}</p>}
      </div>

      <div className="preview-section">
        <h3>Detalles de la Cotización</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Detalle</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Adicional/Desperdicio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {manoDeObra.length > 0 && (
                <>
                  <tr className="category-header">
                    <td colSpan="7">Mano de Obra</td>
                  </tr>
                  {manoDeObra.map((item, index) => (
                    <tr key={`mano-${index}`}>
                      <td>Mano de Obra</td>
                      <td>{item.descripcion}</td>
                      <td>{item.tipoUnidad} x {item.cantidadTrabajadores} trab.</td>
                      <td>{Number(item.cantidadUnidades).toLocaleString('es-CO')}</td>
                      <td>${Number(item.tarifaPorUnidad).toLocaleString('es-CO')}</td>
                      <td>${Number(item.costoAdicional).toLocaleString('es-CO')}</td>
                      <td>${Number(item.total).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="6">Subtotal Mano de Obra</td>
                    <td>${calcularTotalManoDeObra().toLocaleString('es-CO')}</td>
                  </tr>
                </>
              )}
              
              {materiales.length > 0 && (
                <>
                  <tr className="category-header">
                    <td colSpan="7">Materiales</td>
                  </tr>
                  {materiales.map((item, index) => (
                    <tr key={`material-${index}`}>
                      <td>Material</td>
                      <td>{item.nombre}</td>
                      <td>{item.unidadMedida}</td>
                      <td>{Number(item.cantidad).toLocaleString('es-CO')}</td>
                      <td>${Number(item.precioUnitario).toLocaleString('es-CO')}</td>
                      <td>{Number(item.desperdicio)}%</td>
                      <td>${Number(item.total).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="6">Subtotal Materiales</td>
                    <td>${calcularTotalMateriales().toLocaleString('es-CO')}</td>
                  </tr>
                </>
              )}
              
              <tr className="total-row">
                <td colSpan="6">TOTAL GENERAL</td>
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