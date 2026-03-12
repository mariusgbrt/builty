import React from 'react'
import { BrowserRouter as BrowserRouterComponent, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Router } from './components/Router'
import { SubscriptionGuard } from './components/SubscriptionGuard'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { SuccessPage } from './pages/SuccessPage'
import { InvitationPage } from './pages/InvitationPage'
import { MentionsLegales, Confidentialite, CGV, Cookies } from './pages/LegalPages'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <BrowserRouterComponent>
        <Routes>
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Router />} />
        </Routes>
      </BrowserRouterComponent>
    )
  }

  return (
    <BrowserRouterComponent>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/invitation/:token" element={<InvitationPage />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/subscription" element={<Navigate to="/login" replace />} />
          <Route path="/success" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouterComponent>
  )
}

export default App