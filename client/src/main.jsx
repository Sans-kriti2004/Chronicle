import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './pages/App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EmployeeChronicle from './pages/EmployeeChronicle.jsx';
import EditorialDesk from './pages/EditorialDesk.jsx';
import PublishingHouse from './pages/PublishingHouse.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/chronicle" replace />} />
          <Route path="chronicle" element={<EmployeeChronicle />} />
          <Route path="editorial-desk" element={<EditorialDesk />} />
          <Route path="publishing-house" element={<PublishingHouse />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
