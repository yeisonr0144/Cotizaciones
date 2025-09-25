import React from 'react';

const ProcedimientoForm = ({ procedimiento, setProcedimiento, nextStep }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcedimiento({
      ...procedimiento,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="form-container">
      <div className="form-section">
        <h2>Información del Procedimiento</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Título del procedimiento:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={procedimiento.nombre}
              onChange={handleChange}
              placeholder="Ej: Instalación de piso cerámico"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción detallada:</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={procedimiento.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Explica el proceso a realizar"
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ubicacion">Ubicación o área de trabajo:</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={procedimiento.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Baño, cocina, sala"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tiempoEstimado">Tiempo estimado total:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  id="tiempoEstimado"
                  name="tiempoEstimado"
                  value={procedimiento.tiempoEstimado}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Cantidad"
                />
                <select
                  id="tiempoUnidad"
                  name="tiempoUnidad"
                  value={procedimiento.tiempoUnidad}
                  onChange={handleChange}
                >
                  <option value="días">Días</option>
                  <option value="semanas">Semanas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dependencias">Dependencias o requisitos previos:</label>
            <input
              type="text"
              id="dependencias"
              name="dependencias"
              value={procedimiento.dependencias}
              onChange={handleChange}
              placeholder="Ej: Requiere demolición antes de instalar"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prioridad">Prioridad o fase:</label>
              <select
                id="prioridad"
                name="prioridad"
                value={procedimiento.prioridad}
                onChange={handleChange}
              >
                <option value="">Selecciona...</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
                <option value="fase-1">Fase 1</option>
                <option value="fase-2">Fase 2</option>
                <option value="fase-3">Fase 3</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notas">Notas adicionales:</label>
            <textarea
              id="notas"
              name="notas"
              value={procedimiento.notas}
              onChange={handleChange}
              rows="3"
              placeholder="Observaciones del cliente o del técnico"
            ></textarea>
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary">Siguiente</button>
          </div>
        </form>
      </div>
      
      <div className="table-section">
        <h3>Resumen</h3>
        {procedimiento.nombre && (
          <div className="preview-section">
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
        )}
      </div>
    </div>
  );
};

export default ProcedimientoForm;