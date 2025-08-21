import React, { useState } from 'react';

const ManoDeObraForm = ({ manoDeObra, setManoDeObra, nextStep, prevStep }) => {
  const [item, setItem] = useState({
    descripcion: '',
    cantidad: '',
    precioUnitario: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value
    });
  };

  const handleAddItem = () => {
    if (!item.descripcion || !item.cantidad || !item.precioUnitario) {
      alert('Por favor complete todos los campos');
      return;
    }

    const cantidad = parseInt(item.cantidad);
    const precioUnitario = parseInt(item.precioUnitario);
    const total = cantidad * precioUnitario;

    const nuevoItem = {
      ...item,
      cantidad,
      precioUnitario,
      total
    };

    setManoDeObra([...manoDeObra, nuevoItem]);
    setItem({
      descripcion: '',
      cantidad: '',
      precioUnitario: ''
    });
  };

  const handleRemoveItem = (index) => {
    const nuevasManoDeObra = [...manoDeObra];
    nuevasManoDeObra.splice(index, 1);
    setManoDeObra(nuevasManoDeObra);
  };

  const calcularTotal = () => {
    return manoDeObra.reduce((total, item) => total + item.total, 0);
  };

  return (
    <div className="form-container">
      <div className="form-section">
        <h2>Mano de Obra</h2>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={item.descripcion}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cantidad">Cantidad (horas/unidades):</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={item.cantidad}
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
            value={item.precioUnitario}
            onChange={handleChange}
            min="0"
            step="1"
          />
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleAddItem}>
          Agregar Mano de Obra
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
        <h3>Mano de Obra Agregada</h3>
        {manoDeObra.length > 0 ? (
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
                {manoDeObra.map((item, index) => (
                  <tr key={index}>
                    <td>{item.descripcion}</td>
                    <td>{item.cantidad.toLocaleString('es-CO')}</td>
                    <td>${item.precioUnitario.toLocaleString('es-CO')}</td>
                    <td>${item.total.toLocaleString('es-CO')}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="3">Total Mano de Obra</td>
                  <td>${calcularTotal().toLocaleString('es-CO')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No hay elementos agregados</p>
        )}
      </div>
    </div>
  );
};

export default ManoDeObraForm;