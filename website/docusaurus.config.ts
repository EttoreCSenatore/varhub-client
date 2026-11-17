import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'VARHub',
  tagline: 'Conceito de plataforma para publicar projetos de VR e AR para empresas e escolas. Software livre.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://ettorecsenatore.github.io',
  baseUrl: '/varhub-client/',
  organizationName: 'EttoreCSenatore',
  projectName: 'varhub-client',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    localeConfigs: {
      'pt-BR': {label: 'Português (BR)', htmlLang: 'pt-BR'},
      en: {label: 'English', htmlLang: 'en'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    navbar: {
      title: 'VARHub',
      logo: {
        alt: 'Logo do VARHub',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentação',
        },
        {to: '/docs/roadmap', label: 'Roadmap', position: 'left'},
        {type: 'localeDropdown', position: 'right'},
        {
          href: 'https://github.com/EttoreCSenatore/varhub-client',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Produto',
          items: [
            {label: 'Visão geral', to: '/docs/intro'},
            {label: 'Adaptar ao seu negócio', to: '/docs/adaptar'},
            {label: 'Roadmap', to: '/docs/roadmap'},
          ],
        },
        {
          title: 'Técnico',
          items: [
            {label: 'Arquitetura', to: '/docs/tecnico/arquitetura'},
            {label: 'AR e QR Code', to: '/docs/tecnico/ar-e-qr'},
            {label: 'API', to: '/docs/tecnico/api'},
            {label: 'Segurança', to: '/docs/tecnico/seguranca'},
            {label: 'Desenvolvimento', to: '/docs/tecnico/desenvolvimento'},
          ],
        },
        {
          title: 'Projeto',
          items: [
            {label: 'Cliente (GitHub)', href: 'https://github.com/EttoreCSenatore/varhub-client'},
            {label: 'Servidor (GitHub)', href: 'https://github.com/EttoreCSenatore/varhub-server'},
            {label: 'Licença', to: '/docs/licenca'},
          ],
        },
      ],
      copyright: `VARHub © ${new Date().getFullYear()} Ettore Senatore. Software livre (AGPL-3.0-or-later). Nasceu como projeto final do Conestoga College. Feito com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['json', 'bash', 'sql', 'javascript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
