import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './router/routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1B2A3B',
              color: '#F0F4F8',
              border: '1px solid rgba(122,143,166,0.2)',
            },
            success: { iconTheme: { primary: '#00C896', secondary: '#1B2A3B' } },
            error: { iconTheme: { primary: '#E63946', secondary: '#1B2A3B' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
