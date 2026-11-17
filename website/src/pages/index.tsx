import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type Feature = {title: string; body: string};

const features: Feature[] = [
  {
    title: translate({id: 'home.feature.0.title', message: 'Galeria de projetos'}),
    body: translate({id: 'home.feature.0.body', message: 'Os projetos do VARLab e demonstrações WebXR, com acesso restrito a quem entrou na conta.'}),
  },
  {
    title: translate({id: 'home.feature.1.title', message: 'AR por QR Code'}),
    body: translate({id: 'home.feature.1.body', message: 'Aponte a câmera para um QR Code e abra vídeos, inclusive em visor 360°, ou links direto no navegador.'}),
  },
  {
    title: translate({id: 'home.feature.2.title', message: 'Contas e feedback'}),
    body: translate({id: 'home.feature.2.body', message: 'Cadastro e login com JWT, e um formulário de avaliação ligado a cada projeto.'}),
  },
  {
    title: translate({id: 'home.feature.3.title', message: 'PWA e notificações'}),
    body: translate({id: 'home.feature.3.body', message: 'Instalável, com cache offline e notificações push pelo Firebase Cloud Messaging.'}),
  },
  {
    title: translate({id: 'home.feature.4.title', message: 'API própria'}),
    body: translate({id: 'home.feature.4.body', message: 'Servidor Express com PostgreSQL (Neon), protegido com Helmet, limite de tentativas e rotas autenticadas.'}),
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
            <Translate id="home.tagline">Plataforma web que apresenta os projetos do VARLab com experiências de realidade aumentada, feedback dos visitantes e acesso offline.</Translate>
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
