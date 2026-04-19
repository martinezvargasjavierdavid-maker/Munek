import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './app/cart'
import { CatalogProvider } from './app/CatalogProvider'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AdminPage } from './pages/AdminPage'
import { LogisticaPage } from './pages/LogisticaPage'
import { TerminosPage } from './pages/TerminosPage'
import { PrivacidadPage } from './pages/PrivacidadPage'

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/producto/:productId" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/logistica-pro" element={<LogisticaPage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </CatalogProvider>
    </BrowserRouter>
  )
}

