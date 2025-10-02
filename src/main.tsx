import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
// import { ClerkProvider } from '@clerk/clerk-react'

// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY // Phase 1 integration

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY}> */}
        <App />
      {/* </ClerkProvider> */}
    </Router>
  </React.StrictMode>,
)

