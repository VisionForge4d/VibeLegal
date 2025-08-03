const api = {
  async get(endpoint) {
    return request('GET', endpoint);
  },
  async post(endpoint, body) {
    return request('POST', endpoint, body);
  },
};

const request = async (method, endpoint, body) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiUrl}/api${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login?session=expired';
    
    // Return a promise that never resolves. This prevents the calling code
    // (e.g., in Dashboard.jsx) from proceeding to its .catch or .finally
    // blocks, which prevents the broken UI from rendering before the redirect.
    return new Promise(() => {});
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred.' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default api;