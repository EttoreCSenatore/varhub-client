// Everything an organization changes to make VARHub its own. Set these in .env (see .env.example);
// the defaults are the original deployment.
const env = import.meta.env;

export const brand = {
  name: env.VITE_BRAND_NAME || 'VARHub',
  org: env.VITE_ORG_NAME || 'VARLab',
  tagline: env.VITE_TAGLINE || 'Augmented and virtual reality experiences, right in your browser. No app to install.',
};
