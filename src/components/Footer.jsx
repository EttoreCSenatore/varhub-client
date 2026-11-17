export default function Footer() {
  return (
    <footer className="vh-footer py-4 mt-5">
      <div className="container small d-flex flex-column flex-md-row justify-content-between gap-2">
        <span>VARHub · built for VARLab · Conestoga College capstone project</span>
        <span>
          <a href="https://github.com/EttoreCSenatore/varhub-client" target="_blank" rel="noopener noreferrer">Source</a>
          {' · '}
          <a href="https://ettorecsenatore.github.io/varhub-client/" target="_blank" rel="noopener noreferrer">Docs</a>
        </span>
      </div>
    </footer>
  );
}
