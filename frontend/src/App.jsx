import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import LayoutFondo from './componentes/LayoutFondo';

import InicioPublico from './paginas/InicioPublico';
import Login from './paginas/Login';
import ListaPublicaRubrosActividad from './paginas/ListaPublicaRubrosActividad';
import SolicitudComerciante from './paginas/SolicitudComerciante'; 

import DashboardAdmin from './paginas/DashboardAdmin';
import GestionRubros from './paginas/GestionRubros';
import GestionActividades from './paginas/GestionActividades';
import AdminLayout from './componentes/comunes/AdminLayout';
import GestionExpedientes from './paginas/gestion/GestionExpedientes';
import GestionFormalizados from './paginas/gestion/GestionFormalizados';
import SubirPago from './paginas/SubirPago';
import MisCarnets from './paginas/MisCarnets';
import PortalComerciante from './paginas/PortalComerciante';
import Ordenanzas from './paginas/Ordenanzas';
import Definiciones from './paginas/Definiciones';
import Categorias from './paginas/Categorias';
import Requisitos from './paginas/Requisitos';
import Vigencia from './paginas/Vigencia';
import "./estilos/Globales.css"

function App() {
  return (
    <ModalProvider>
      <Router>
        <Routes>
       
          <Route path="/" element={<LayoutFondo><InicioPublico /></LayoutFondo>} />
          <Route path="/rubros-y-actividades" element={<LayoutFondo><ListaPublicaRubrosActividad /></LayoutFondo>} />
          <Route path="/ordenanzas" element={<LayoutFondo><Ordenanzas /></LayoutFondo>} />
          <Route path="/categorias" element={<LayoutFondo><Categorias /></LayoutFondo>} />
          <Route path="/requisitos" element={<LayoutFondo><Requisitos /></LayoutFondo>} />
          <Route path="/vigencia" element={<LayoutFondo><Vigencia /></LayoutFondo>} />
          <Route path="/definiciones" element={<LayoutFondo><Definiciones /></LayoutFondo>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro-solicitud" element={<LayoutFondo><SolicitudComerciante /></LayoutFondo>} />
          <Route path="/ordenanzas" element={<Ordenanzas />} />
          

          <Route path="/admin-dashboard" element={<AdminLayout><DashboardAdmin /></AdminLayout>} />
          <Route path="/admin/rubros" element={<AdminLayout><GestionRubros /></AdminLayout>} />
          <Route path="/admin/actividades" element={<AdminLayout><GestionActividades /></AdminLayout>} />
          <Route path="/admin/formalizados" element={<AdminLayout><GestionFormalizados /></AdminLayout>} /> 
          <Route path="/admin/solicitudes" element={<AdminLayout><GestionExpedientes /></AdminLayout>} />

          
          <Route path="/panel-comerciante" element={<PortalComerciante />} />
          <Route path="/mis-carnets" element={<MisCarnets />} />
          <Route path="/subir-pago" element={<SubirPago />} />  
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;