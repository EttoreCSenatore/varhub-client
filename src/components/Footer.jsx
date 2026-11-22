import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { brand } from '../brand';

export default function Footer() {
  const [apiVersion, setApiVersion] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/version').then(({ data }) => { if (!cancelled) setApiVersion(data.version); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="vh-footer py-4 mt-5">
      <div className="container small d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>{brand.name} · {brand.org} · powered by VARHub, an open-source AR/VR showcase (AGPL-3.0)</span>
        <span>
          <Link to="/whats-new" data-testid="versions">app v{import.meta.env.VITE_APP_VERSION}{apiVersion ? ` · api v${apiVersion}` : ''}</Link>
          {' · '}
          <a href={brand.sourceUrl} target="_blank" rel="noopener noreferrer">Source</a>
          {' · '}
          <a href="https://ettorecsenatore.github.io/varhub-client/" target="_blank" rel="noopener noreferrer">Docs</a>
        </span>
      </div>
    </footer>
  );
}
