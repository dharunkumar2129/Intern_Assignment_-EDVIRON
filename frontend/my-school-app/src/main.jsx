import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// No CSS imports are needed here anymore since App.jsx handles its own styles.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
