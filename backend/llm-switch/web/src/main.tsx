// web/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LLMSwitchPanel } from './components/LLMSwitchPanel'; // <-- named import

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <LLMSwitchPanel />
  </React.StrictMode>
);
