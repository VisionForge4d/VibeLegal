// Frontend configuration for VibeLegal
const config = {
  // API Base URL - update this when you deploy your backend
  API_BASE_URL: (typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : "http://localhost:5000",
    
  // App configuration
  APP_NAME: 'VibeLegal',
  APP_VERSION: '1.0.0',
  
  // Contract limits by subscription tier
  SUBSCRIPTION_LIMITS: {
    basic: 25,
    premium: -1 // -1 means unlimited
  },
  
  // Supported contract types
  CONTRACT_TYPES: [
    { value: 'Employment Agreement', label: 'Employment Agreement' },
    { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
    { value: 'Service Contract', label: 'Service Contract' },
    { value: 'Independent Contractor', label: 'Independent Contractor Agreement' },
    { value: 'Purchase Agreement', label: 'Purchase Agreement' }
  ],
  
  // US States for jurisdiction selection
  US_STATES: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ]
};

export default config;

