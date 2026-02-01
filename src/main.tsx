import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Remove loading screen
const loader = document.getElementById('loader')
if (loader) {
  setTimeout(() => {
    loader.style.opacity = '0'
    setTimeout(() => loader.remove(), 500)
  }, 800)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
