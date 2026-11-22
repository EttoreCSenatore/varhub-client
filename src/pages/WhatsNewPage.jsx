import { Badge, Container } from 'react-bootstrap';
import releases from 'virtual:releases';

const KIND = {
  new: { label: 'New', bg: 'primary' },
  improvement: { label: 'Improvement', bg: 'info' },
  fix: { label: 'Fix', bg: 'secondary' },
  security: { label: 'Security', bg: 'danger' },
};

export default function WhatsNewPage() {
  return (
    <Container className="py-4 vh-narrow">
      <h1 className="h3 mb-4">What’s new</h1>
      {releases.map((release) => (
        <section key={release.version} className="mb-4" aria-labelledby={`v${release.version}`}>
          <h2 className="h5 mb-0" id={`v${release.version}`}>
            v{release.version} <span className="text-muted fw-normal">· {release.title.en}</span>
          </h2>
          <p className="small text-muted">{release.date}</p>
          <ul className="list-unstyled">
            {release.items.map((item) => (
              <li key={item.text.en} className="mb-2">
                <Badge bg={KIND[item.kind]?.bg || 'secondary'} className="me-2">{KIND[item.kind]?.label || item.kind}</Badge>
                {item.text.en}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Container>
  );
}
