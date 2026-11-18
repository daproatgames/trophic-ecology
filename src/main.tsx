import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import './index.css'
import App from './App'
import { StudyProvider } from './state/StudyContext'
import { CloudProvider } from './state/CloudContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudyProvider>
      <CloudProvider>
        <App />
      </CloudProvider>
    </StudyProvider>
  </React.StrictMode>,
)