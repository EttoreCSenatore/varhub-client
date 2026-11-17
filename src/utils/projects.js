export const TYPE_INFO = {
  model: { label: '3D / AR', action: 'View in 3D and AR', image: '/images/model.svg' },
  video360: { label: '360° video', action: 'Watch in 360°', image: '/images/video360.svg' },
  webxr: { label: 'WebXR demo', action: 'Launch experience', image: '/images/webxr.svg' },
  link: { label: 'Link', action: 'Open', image: '/images/placeholder.svg' },
};

export const typeInfo = (type) => TYPE_INFO[type] || TYPE_INFO.link;
export const thumbnailFor = (project) => project.thumbnail_url || typeInfo(project.type).image;
