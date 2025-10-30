import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UseNavigationWithLoading from './UseNavigationWithLoading.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UseNavigationWithLoading />
  </StrictMode>,
)
