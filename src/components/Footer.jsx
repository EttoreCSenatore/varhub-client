import { brand } from '../brand';

export default function Footer() {
  return (
    <footer className="vh-footer py-4 mt-5">
      <div className="container small d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>{brand.name} · {brand.org} · powered by VARHub, an open-source AR/VR showcase (AGPL-3.0)</span>
        <span>
          <a href={brand.sourceUrl} target="_blank" rel="noopener noreferrer">Source</a>
          {' · '}
          <a href="https://ettorecsenatore.github.io/varhub-client/" target="_blank" rel="noopener noreferrer">Docs</a>
        </span>
      </div>
    </footer>
  );
}
