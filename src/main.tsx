// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <ClerkProvider publishableKey={clerkKey}>
        <App />
      </ClerkProvider>
    </Router>
  </React.StrictMode>
)
