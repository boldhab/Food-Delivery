import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('unhandledrejection', (event) => {
  const reason = event?.reason
  const message = reason?.message || ''
  if (
    reason?.name === 'AbortError' &&
    message.includes('play() request was interrupted by a call to pause()')
  ) {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
