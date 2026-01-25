import React from 'react'
import ReactDOM from 'react-dom/client'
import MWStyleDiffs from './MWStyleDiffs' 
// ^ Make sure your big component file is named "MWStyleDiffs.jsx"
// and is also inside the 'src' folder.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MWStyleDiffs />
  </React.StrictMode>,
)