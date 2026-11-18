import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import './index.css'
import App from './App'
import { StudyProvider } from './state/StudyContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </React.StrictMode>,
)