import React, { useState, useEffect } from 'react';

const Home = ({ startCotizacion }) => {
  const [cotizacionesAnteriores, setCotizacionesAnteriores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('nueva');

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchCotizaciones();
    }
  }, [activeTab]);

  const fetchCotizaciones = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quotes');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cotizaciones');
      }
      
      setCotizacionesAnteriores(data.cotizaciones || []);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar las cotizaciones anteriores');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  return (
    <div className="home-container">
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'nueva' ? 'active' : ''}`}
          onClick={() => setActiveTab('nueva')}
        >
          Nueva Cotización
        </button>
        <button 
          className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Cotizaciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'nueva' ? (
          <div className="nueva-cotizacion">
            <div className="welcome-section">
              <h2>Bienvenido al Sistema de Cotizaciones</h2>
              <p>Crea cotizaciones de manera rápida y sencilla para tus proyectos.</p>
              <button className="btn btn-primary btn-large" onClick={startCotizacion}>
                Crear Nueva Cotización
              </button>
            </div>
            <div className="features-section">
              <div className="feature">
                <h3>Procedimiento</h3>
                <p>Define el nombre y descripción del procedimiento a cotizar.</p>
              </div>
              <div className="feature">
                <h3>Mano de Obra</h3>
                <p>Agrega los costos de mano de obra necesarios para el proyecto.</p>
              </div>
              <div className="feature">
                <h3>Materiales</h3>
                <p>Incluye todos los materiales requeridos con sus cantidades y precios.</p>
              </div>
              <div className="feature">
                <h3>Vista Previa y PDF</h3>
                <p>Revisa la cotización y genera un PDF profesional para compartir.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="historial-cotizaciones">
            <h2>Historial de Cotizaciones</h2>
            {isLoading ? (
              <p className="loading-message">Cargando cotizaciones...</p>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : cotizacionesAnteriores.length === 0 ? (
              <p className="empty-message">No hay cotizaciones guardadas.</p>
            ) : (
              <div className="cotizaciones-list">
                <table className="cotizaciones-table">
                  <thead>
                    <tr>
                      <th>Procedimiento</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizacionesAnteriores.map((cotizacion) => (
                      <tr key={cotizacion.id}>
                        <td>
                          <strong>{cotizacion.nombre}</strong>
                          {cotizacion.descripcion && (
                            <p className="descripcion-cotizacion">{cotizacion.descripcion}</p>
                          )}
                        </td>
                        <td>{formatDate(cotizacion.fecha_creacion)}</td>
                        <td>${parseFloat(cotizacion.total_general).toLocaleString('es-CO')}</td>
                        <td>
                          <a 
                            href={`${cotizacion.pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-download"
                          >
                            Descargar PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;