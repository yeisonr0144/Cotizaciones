import { useState } from 'react';
import './App.css';
import Home from './components/Home';
import ProcedimientoForm from './components/ProcedimientoForm';
import MaterialesForm from './components/MaterialesForm';
import ManoDeObraForm from './components/ManoDeObraForm';
import VistaPreviaCotizacion from './components/VistaPreviaCotizacion';

function App() {
  const [step, setStep] = useState(0); // 0 = Home, 1-4 = Cotización steps
  const [procedimiento, setProcedimiento] = useState({
    nombre: '',
    descripcion: ''
  });
  const [materiales, setMateriales] = useState([]);
  const [manoDeObra, setManoDeObra] = useState([]);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  
  const startCotizacion = () => {
    setStep(1);
  };
  
  const goHome = () => {
    // Reiniciar el estado
    setProcedimiento({
      nombre: '',
      descripcion: ''
    });
    setMateriales([]);
    setManoDeObra([]);
    setStep(0);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Home startCotizacion={startCotizacion} />;
      case 1:
        return (
          <ProcedimientoForm
            procedimiento={procedimiento}
            setProcedimiento={setProcedimiento}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <ManoDeObraForm
            manoDeObra={manoDeObra}
            setManoDeObra={setManoDeObra}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <MaterialesForm
            materiales={materiales}
            setMateriales={setMateriales}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <VistaPreviaCotizacion
            procedimiento={procedimiento}
            materiales={materiales}
            manoDeObra={manoDeObra}
            prevStep={prevStep}
            goHome={goHome}
          />
        );
      default:
        return <Home startCotizacion={startCotizacion} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sistema de Cotizaciones</h1>
        {step > 0 && (
          <button className="btn btn-home" onClick={goHome}>
            Volver al Inicio
          </button>
        )}
      </header>
      
      {step > 0 && (
        <div className="progress-bar-compact">
          <div className="progress-step-compact">
            <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
            <span>Procedimiento</span>
          </div>
          <div className="progress-step-compact">
            <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
            <span>Mano de Obra</span>
          </div>
          <div className="progress-step-compact">
            <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
            <span>Materiales</span>
          </div>
          <div className="progress-step-compact">
            <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>4</div>
            <span>Vista Previa</span>
          </div>
        </div>
      )}
      
      <main className="app-main">
        {renderStep()}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Sistema de Cotizaciones</p>
      </footer>
    </div>
  )
}

export default App
