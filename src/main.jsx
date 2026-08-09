import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import { HelmetProvider } from "react-helmet-async";
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationProvider';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <NotificationProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </NotificationProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
