import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { router } from './app/router'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('#root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
