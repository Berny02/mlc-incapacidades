import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import PageWrapper from '../components/layout/PageWrapper'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ColaboradoresList from '../pages/Colaboradores/ColaboradoresList'
import ColaboradorForm from '../pages/Colaboradores/ColaboradorForm'
import IncapacidadesList from '../pages/Incapacidades/IncapacidadesList'
import IncapacidadForm from '../pages/Incapacidades/IncapacidadForm'
import IncapacidadDetalle from '../pages/Incapacidades/IncapacidadDetalle'
import Alertas from '../pages/Alertas'
import Reportes from '../pages/Reportes'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PageWrapper />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="colaboradores" element={<ColaboradoresList />} />
        <Route path="colaboradores/nuevo" element={<ColaboradorForm />} />
        <Route path="colaboradores/:id/editar" element={<ColaboradorForm />} />
        <Route path="incapacidades" element={<IncapacidadesList />} />
        <Route path="incapacidades/nueva" element={<IncapacidadForm />} />
        <Route path="incapacidades/:id" element={<IncapacidadDetalle />} />
        <Route path="incapacidades/:id/editar" element={<IncapacidadForm />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
    </Routes>
  )
}
