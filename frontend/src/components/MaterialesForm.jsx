import React, { useState } from 'react';

const MaterialesForm = ({ materiales, setMateriales, nextStep, prevStep }) => {
  const [material, setMaterial] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadMedida: 'unidad', // unidad, ml, m2, m3, litros, kg
    cantidad: '',
    precioUnitario: '',
    desperdicio: '', // porcentaje
    proveedor: '',
    notas: ''
  });

  const calcularSubtotal = (m) => {
    const cantidad = parseFloat(m.cantidad || 0);
    const precio = parseFloat(m.precioUnitario || 0);
    const factor = 1 + (parseFloat(m.desperdicio || 0) / 100);
    const subtotal = cantidad * precio * factor;
    return isNaN(subtotal) ? 0 : subtotal;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({
      ...material,
      [name]: value
    });
  };

  const handleAddMaterial = () => {
    if (!material.nombre || !material.cantidad || !material.precioUnitario) {
      alert('Por favor completa al menos Nombre, Cantidad y Precio Unitario');
      return;
    }

    const nuevoMaterial = {
      ...material,
      cantidad: parseFloat(material.cantidad || 0),
      precioUnitario: parseFloat(material.precioUnitario || 0),
      desperdicio: parseFloat(material.desperdicio || 0),
      total: calcularSubtotal(material)
    };

    setMateriales([...materiales, nuevoMaterial]);
    setMaterial({
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: 'unidad',
      cantidad: '',
      precioUnitario: '',
      desperdicio: '',
      proveedor: '',
      notas: ''
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
          <label htmlFor="nombre">Nombre del material:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={material.nombre}
            onChange={handleChange}
            placeholder="Ej: Cemento gris"
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="descripcion">Descripción / marca / referencia (opcional):</label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={material.descripcion}
              onChange={handleChange}
              placeholder="Marca, referencia, características"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="categoria">Categoría:</label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              value={material.categoria}
              onChange={handleChange}
              placeholder="Ej: cemento, pintura, tubería"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unidadMedida">Unidad de medida:</label>
            <select
              id="unidadMedida"
              name="unidadMedida"
              value={material.unidadMedida}
              onChange={handleChange}
            >
              <option value="unidad">Unidad (pieza, caja, bulto)</option>
              <option value="ml">Metro lineal</option>
              <option value="m2">Metro cuadrado</option>
              <option value="m3">Metro cúbico</option>
              <option value="litros">Litros</option>
              <option value="kg">Kilogramos / toneladas</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad necesaria:</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={material.cantidad}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="precioUnitario">Precio unitario ($):</label>
            <input
              type="number"
              id="precioUnitario"
              name="precioUnitario"
              value={material.precioUnitario}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="desperdicio">Desperdicio o factor extra (%):</label>
            <input
              type="number"
              id="desperdicio"
              name="desperdicio"
              value={material.desperdicio}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ej: 5"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="proveedor">Proveedor / referencia:</label>
            <input
              type="text"
              id="proveedor"
              name="proveedor"
              value={material.proveedor}
              onChange={handleChange}
              placeholder="Para cotizar en distintos lugares"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="notas">Notas:</label>
            <input
              type="text"
              id="notas"
              name="notas"
              value={material.notas}
              onChange={handleChange}
              placeholder="Recomendaciones o consideraciones"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Subtotal automático:</label>
          <div className="readonly-box">${calcularSubtotal(material).toLocaleString('es-CO')}</div>
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
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Desperdicio</th>
                  <th>Total</th>
                  <th>Proveedor</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiales.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nombre}</td>
                    <td>{item.unidadMedida}</td>
                    <td>{Number(item.cantidad).toLocaleString('es-CO')}</td>
                    <td>${Number(item.precioUnitario).toLocaleString('es-CO')}</td>
                    <td>{Number(item.desperdicio)}%</td>
                    <td>${Number(item.total).toLocaleString('es-CO')}</td>
                    <td>{item.proveedor}</td>
                    <td>{item.notas}</td>
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
                  <td colSpan="5">Total Materiales</td>
                  <td>${calcularTotal().toLocaleString('es-CO')}</td>
                  <td colSpan="3"></td>
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