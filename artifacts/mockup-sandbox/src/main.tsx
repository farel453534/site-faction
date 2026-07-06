import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import App from './App';
import './index.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // e.g. "/__mockup"

function PreviewRouter() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.location.pathname; // e.g. /__mockup/preview/home-redesign/HomeRedesign
    const withoutBase = raw.startsWith(BASE) ? raw.slice(BASE.length) : raw;
    // withoutBase: /preview/home-redesign/HomeRedesign
    const match = withoutBase.match(/^\/preview\/(.+)\/([^/]+)$/);
    if (!match) {
      setLoading(false);
      return; // not a preview route → render App
    }
    const [, folder, name] = match;
    const key = `./components/mockups/${folder}/${name}.tsx`;

    import('./.generated/mockup-components').then(({ modules }) => {
      const loader = modules[key];
      if (!loader) {
        setError(`Composant non trouvé : ${key}`);
        setLoading(false);
        return;
      }
      loader().then((mod: Record<string, unknown>) => {
        const Comp = (mod[name] || mod['default']) as React.ComponentType | undefined;
        if (!Comp) {
          setError(`Export "${name}" introuvable dans ${key}`);
        } else {
          setComponent(() => Comp);
        }
        setLoading(false);
      }).catch((e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
    }).catch((e: unknown) => {
      setError(String(e));
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (error) return (
    <div style={{ padding: 32, color: '#f87171', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh' }}>
      <strong>Erreur de preview :</strong><br />{error}
    </div>
  );
  if (Component) return <Component />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(<PreviewRouter />);
