// Everything an organization changes to make VARHub its own. Set these in .env (see .env.example);
// the defaults are the original deployment.
const env = import.meta.env;

export const brand = {
  name: env.VITE_BRAND_NAME || 'VARHub',
  org: env.VITE_ORG_NAME || 'VARLab',
  // AGPL section 13: a modified, hosted version must offer its source. Point this at your fork.
  sourceUrl: env.VITE_SOURCE_URL || 'https://github.com/EttoreCSenatore/varhub-client',
  tagline: env.VITE_TAGLINE || 'Augmented and virtual reality experiences, right in your browser. No app to install.',
};
