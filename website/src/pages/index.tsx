import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Feature = {title: string; body: string};

const features: Feature[] = [
  {
    title: translate({id: 'home.feature.0.title', message: 'Galeria pública'}),
    body: translate({id: 'home.feature.0.body', message: 'Os projetos do VARLab com busca e filtros, abertos a qualquer visitante, sem conta.'}),
  },
  {
    title: translate({id: 'home.feature.1.title', message: 'AR por QR Code'}),
    body: translate({id: 'home.feature.1.body', message: 'Escaneie um QR Code e abra modelos 3D com AR ou vídeos 360° direto no navegador do celular.'}),
  },
  {
    title: translate({id: 'home.feature.2.title', message: 'Feedback em um toque'}),
    body: translate({id: 'home.feature.2.body', message: 'Nota de 1 a 5 e comentário sem precisar de conta; o painel mostra o resultado.'}),
  },
  {
    title: translate({id: 'home.feature.3.title', message: 'PWA e offline'}),
    body: translate({id: 'home.feature.3.body', message: 'Instalável, com a lista de projetos e as mídias em cache para uso sem internet.'}),
  },
  {
    title: translate({id: 'home.feature.4.title', message: 'API própria'}),
    body: translate({id: 'home.feature.4.body', message: 'Servidor Express com PostgreSQL (Neon), papéis, limites de requisição e testes de integração.'}),
  },
  {
    title: translate({id: 'home.feature.5.title', message: 'Código aberto'}),
    body: translate({id: 'home.feature.5.body', message: 'Cliente e servidor públicos sob licença MIT, com documentação em português e inglês.'}),
  },
];

const roles = [
  translate({id: 'home.role.0', message: 'React 19 + Vite'}),
  translate({id: 'home.role.1', message: 'WebXR + Three.js'}),
  translate({id: 'home.role.2', message: 'Express + PostgreSQL'}),
  translate({id: 'home.role.3', message: 'Firebase'}),
];

export default function Home(): ReactNode {
  return (
    <Layout
      title={translate({id: 'home.title', message: 'Marketing com realidade aumentada'})}
      description={translate({
        id: 'home.description',
        message: 'VARHub é a plataforma web de marketing do VARLab: projetos, AR por QR Code, feedback e notificações. Projeto final do Conestoga College.',
      })}>
      <header className={styles.hero}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            VARHub
          </Heading>
          <p className={styles.tagline}>
            <Translate id="home.tagline">Escaneie um QR Code e explore os projetos do VARLab em realidade aumentada e vídeo 360°, direto no celular.</Translate>
          </p>
          <div className={styles.roles}>
            {roles.map((r) => (
              <span key={r} className={styles.role}>
                {r}
              </span>
            ))}
          </div>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              <Translate id="home.docs">Ler a documentação</Translate>
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/tecnico/arquitetura">
              <Translate id="home.arch">Arquitetura</Translate>
            </Link>
          </div>
        </div>
      </header>
      <main className="container">
        <section className={styles.features}>
          {features.map((f) => (
            <div key={f.title} className={styles.card}>
              <Heading as="h3">{f.title}</Heading>
              <p>{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  );
}
