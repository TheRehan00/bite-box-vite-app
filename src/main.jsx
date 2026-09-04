import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Marketplace from './Marketplace.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Marketplace />
  </StrictMode>,
)
