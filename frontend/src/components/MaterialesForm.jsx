import React, { useState } from 'react';

const MaterialesForm = ({ materiales, setMateriales, nextStep, prevStep }) => {
  const [material, setMaterial] = useState({
    descripcion: '',
    cantidad: '',
    precioUnitario: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({
      ...material,
      [name]: value
    });
  };

  const handleAddMaterial = () => {
    if (!material.descripcion || !material.cantidad || !material.precioUnitario) {
      alert('Por favor complete todos los campos');
      return;
    }

    const cantidad = parseInt(material.cantidad);
    const precioUnitario = parseInt(material.precioUnitario);
    const total = cantidad * precioUnitario;

    const nuevoMaterial = {
      ...material,
      cantidad,
      precioUnitario,
      total
    };

    setMateriales([...materiales, nuevoMaterial]);
    setMaterial({
      descripcion: '',
      cantidad: '',
      precioUnitario: ''
    });
  };

  const handleRemoveMaterial = (index) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales.splice(index, 1);
    setMateriales(nuevosMateriales);
  };

  const calcularTotal = () => {
    return materiales.reduce((total, item) => total + item.total, 0);
  };

  return (
    <div className="form-container">
      <div className="form-section">
        <h2>Materiales</h2>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={material.descripcion}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={material.cantidad}
            onChange={handleChange}
            min="0"
            step="1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="precioUnitario">Precio Unitario ($):</label>
          <input
            type="number"
            id="precioUnitario"
            name="precioUnitario"
            value={material.precioUnitario}
            onChange={handleChange}
            min="0"
            step="1"
          />
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleAddMaterial}>
          Agregar Material
        </button>
        
        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            Anterior
          </button>
          <button type="button" className="btn btn-primary" onClick={nextStep}>
            Siguiente
          </button>
        </div>
      </div>

      <div className="table-section">
        <h3>Materiales Agregados</h3>
        {materiales.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiales.map((item, index) => (
                  <tr key={index}>
                    <td>{item.descripcion}</td>
                    <td>{item.cantidad.toLocaleString('es-CO')}</td>
                    <td>${item.precioUnitario.toLocaleString('es-CO')}</td>
                    <td>${item.total.toLocaleString('es-CO')}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveMaterial(index)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="3">Total Materiales</td>
                  <td>${calcularTotal().toLocaleString('es-CO')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No hay materiales agregados</p>
        )}
      </div>
    </div>
  );
};

export default MaterialesForm;