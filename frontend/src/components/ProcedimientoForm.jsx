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
            <label htmlFor="nombre">Nombre del Procedimiento:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={procedimiento.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={procedimiento.descripcion}
              onChange={handleChange}
              rows="4"
              required
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
            <p><strong>Nombre:</strong> {procedimiento.nombre}</p>
            <p><strong>Descripción:</strong> {procedimiento.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcedimientoForm;