import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'licenca',
    'adaptar',
    'roadmap',
    {
      type: 'category',
      label: 'Operação',
      collapsed: false,
      items: ['operacao/instalacao', 'operacao/backup-e-restauracao', 'operacao/atualizacao-e-monitoramento'],
    },
    {
      type: 'category',
      label: 'Técnico',
      collapsed: false,
      items: [
        'tecnico/arquitetura',
        'tecnico/ar-e-qr',
        'tecnico/api',
        'tecnico/seguranca',
        'tecnico/desenvolvimento',
      ],
    },
  ],
};

export default sidebars;
