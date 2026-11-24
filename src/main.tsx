import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/readex-pro/wght.css'
import './i18n'
import './styles/app.css'
import './styles/print.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
