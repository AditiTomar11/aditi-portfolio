const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export async function api(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(`${base}${endpoint}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status}).`);
      error.status = response.status;
      error.fields = data.fields;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError')
      throw new Error('The server took too long to respond. Please try again.');
    if (error instanceof TypeError)
      throw new Error('Unable to reach the server. Please check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export function safeUrl(value) {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}
