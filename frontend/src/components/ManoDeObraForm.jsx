import React, { useState } from 'react';

const ManoDeObraForm = ({ manoDeObra, setManoDeObra, nextStep, prevStep }) => {
  const [item, setItem] = useState({
    descripcion: '',
    cantidadTrabajadores: 1,
    tipoUnidad: 'hora', // hora, jornada, m2, ml, precioFijo
    cantidadUnidades: '',
    tarifaPorUnidad: '',
    costoAdicional: '',
    notas: ''
  });

  const calcularSubtotal = (i) => {
    const trabajadores = parseFloat(i.cantidadTrabajadores || 0);
    const unidades = parseFloat(i.cantidadUnidades || 0);
    const tarifa = parseFloat(i.tarifaPorUnidad || 0);
    const adicional = parseFloat(i.costoAdicional || 0);

    let base = unidades * tarifa;
    // Si es precio fijo por tarea, usamos tarifa como total base
    if (i.tipoUnidad === 'precioFijo') {
      base = tarifa;
    }

    const subtotal = (base * (trabajadores || 1)) + (adicional || 0);
    return isNaN(subtotal) ? 0 : subtotal;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevo = { ...item, [name]: value };
    setItem(nuevo);
  };

  const handleAddItem = () => {
    if (!item.descripcion) {
      alert('Por favor ingresa la descripción de la tarea');
      return;
    }
    if (item.tipoUnidad !== 'precioFijo' && (!item.cantidadUnidades || !item.tarifaPorUnidad)) {
      alert('Para este tipo de cobro, debes indicar cantidad de unidades y tarifa');
      return;
    }
    if (item.tipoUnidad === 'precioFijo' && !item.tarifaPorUnidad) {
      alert('Para precio fijo, debes indicar el valor total');
      return;
    }

    const nuevoItem = {
      ...item,
      cantidadTrabajadores: parseFloat(item.cantidadTrabajadores || 1),
      cantidadUnidades: parseFloat(item.cantidadUnidades || 0),
      tarifaPorUnidad: parseFloat(item.tarifaPorUnidad || 0),
      costoAdicional: parseFloat(item.costoAdicional || 0),
      total: calcularSubtotal(item)
    };

    setManoDeObra([...manoDeObra, nuevoItem]);
    setItem({
      descripcion: '',
      cantidadTrabajadores: 1,
      tipoUnidad: 'hora',
      cantidadUnidades: '',
      tarifaPorUnidad: '',
      costoAdicional: '',
      notas: ''
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
          <label htmlFor="descripcion">Descripción de la tarea:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={item.descripcion}
            onChange={handleChange}
            placeholder="Ej: Colocar enchape en pared"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidadTrabajadores">Cantidad de trabajadores:</label>
            <input
              type="number"
              id="cantidadTrabajadores"
              name="cantidadTrabajadores"
              value={item.cantidadTrabajadores}
              onChange={handleChange}
              min="1"
              step="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipoUnidad">Tipo de unidad de cobro:</label>
            <select
              id="tipoUnidad"
              name="tipoUnidad"
              value={item.tipoUnidad}
              onChange={handleChange}
            >
              <option value="hora">Por hora</option>
              <option value="jornada">Por jornada/día</option>
              <option value="m2">Por metro cuadrado</option>
              <option value="ml">Por metro lineal</option>
              <option value="precioFijo">Precio fijo por tarea</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidadUnidades">Cantidad de unidades:</label>
            <input
              type="number"
              id="cantidadUnidades"
              name="cantidadUnidades"
              value={item.cantidadUnidades}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ej: 8 horas, 2 jornadas, 12 m²"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tarifaPorUnidad">Tarifa por unidad ($):</label>
            <input
              type="number"
              id="tarifaPorUnidad"
              name="tarifaPorUnidad"
              value={item.tarifaPorUnidad}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ej: 50000 por hora"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="costoAdicional">Costo adicional opcional ($):</label>
            <input
              type="number"
              id="costoAdicional"
              name="costoAdicional"
              value={item.costoAdicional}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ej: viáticos, transporte, herramienta"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="notas">Notas / condiciones:</label>
            <input
              type="text"
              id="notas"
              name="notas"
              value={item.notas}
              onChange={handleChange}
              placeholder="Ej: trabajo en altura, requiere EPP"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Subtotal automático:</label>
          <div className="readonly-box">${calcularSubtotal(item).toLocaleString('es-CO')}</div>
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
                  <th>Trab.</th>
                  <th>Tipo</th>
                  <th>Unidades</th>
                  <th>Tarifa</th>
                  <th>Adicional</th>
                  <th>Total</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {manoDeObra.map((item, index) => (
                  <tr key={index}>
                    <td>{item.descripcion}</td>
                    <td>{item.cantidadTrabajadores}</td>
                    <td>{item.tipoUnidad}</td>
                    <td>{Number(item.cantidadUnidades).toLocaleString('es-CO')}</td>
                    <td>${Number(item.tarifaPorUnidad).toLocaleString('es-CO')}</td>
                    <td>${Number(item.costoAdicional).toLocaleString('es-CO')}</td>
                    <td>${Number(item.total).toLocaleString('es-CO')}</td>
                    <td>{item.notas}</td>
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
                  <td colSpan="6">Total Mano de Obra</td>
                  <td>${calcularTotal().toLocaleString('es-CO')}</td>
                  <td colSpan="2"></td>
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