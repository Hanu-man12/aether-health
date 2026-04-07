import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { configureLambdaUrls } from './services/bedrockService';
import { LAMBDA_URLS } from './services/amplifyConfig';

// Initialize Lambda URLs from env vars (set after sandbox deploy)
configureLambdaUrls(LAMBDA_URLS);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);