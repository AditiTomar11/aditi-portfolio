import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api.js';
import { projects as previewProjects } from '../../../shared/projects.js';
export function useProjects() {
  const [projects, setProjects] = useState(previewProjects);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('preview');
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/projects');
      const list = Array.isArray(data) ? data : data.projects;
      if (!Array.isArray(list)) throw new Error('The projects API returned an unexpected format.');
      setProjects(
        list
          .filter((item) => item && typeof item.title === 'string' && typeof item.slug === 'string')
          .map((item) => ({
            ...item,
            stack: Array.isArray(item.stack) ? item.stack : [],
            highlights: Array.isArray(item.highlights) ? item.highlights : [],
          }))
          .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      );
      setSource(data.source || 'api');
    } catch (err) {
      setError(err.message);
      setSource('preview');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { projects, loading, source, error, reload };
}
