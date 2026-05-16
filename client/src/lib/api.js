export async function api(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const url = path.startsWith('/api') ? `${baseUrl}${path}` : path;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) return response.text();
  return response.json();
}
