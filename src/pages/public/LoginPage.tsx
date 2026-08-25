// src/pages/public/LoginPage.tsx
import './LoginPage.css'
import { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { ArrowLeft }            from 'lucide-react'
import { LoginForm }            from '@/features/auth/components/LoginForm'
import { RegisterForm }         from '@/features/auth/components/RegisterForm'
import { useAuth, redirectByRole } from '@/features/auth/AuthContext'
import { ROUTES }               from '@/app/config/routes.config'

export function LoginPage() {
  const [vista, setVista]   = useState<'login' | 'registro'>('login')
  const { user, isLoading } = useAuth()
  const navigate            = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectByRole(user.role), { replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading) return null

  return (
    <div className="auth-page">

<button
        className="auth-back-btn"
        onClick={() => navigate(ROUTES.HOME)}
        aria-label="Volver al inicio"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </button>
      
      <div className="card">
        <div className="panel-left">
          <div className="geo geo-1" />
          <div className="geo geo-2" />
          <div className="geo geo-3" />
          <div className="geo geo-4" />
          <div className="tabs-wrapper">
            <button
              className={`tab-btn ${vista === 'login' ? 'active' : 'inactive'}`}
              onClick={() => setVista('login')}
            >
              Ingresar
            </button>
            <button
              className={`tab-btn ${vista === 'registro' ? 'active' : 'inactive'}`}
              onClick={() => setVista('registro')}
            >
              Registro
            </button>
          </div>
        </div>

        <div className="panel-right">
          {vista === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}