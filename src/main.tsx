import React from 'react'
import ReactDOM from 'react-dom/client'
import MWStyleDiffs from './MWStyleDiffs'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MWStyleDiffs />
  </React.StrictMode>,
)