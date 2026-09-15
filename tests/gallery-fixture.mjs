const entries = [
  ['bible-rebinding-imprinting', 'Bible Rebinding & Personalized Imprinting', 'Personalization & Finishes', 'Custom rebound Bible with tooled spine, red ribbons, and gold scripture imprinting.'],
  ['leather-bindings-color', 'Leather Bindings in Color', 'Bible Rebinding & Restoration', 'Turquoise and pink leather-bound books with personalized gold lettering and ribbon markers.'],
  ['textured-leather-personalization', 'Textured Leather & Personalization', 'Personalization & Finishes', 'Black textured leather Bible cover with a personalized inset panel.'],
];
export const fixture = { featuredIds: [], projects: entries.map(([id, title, category, alt]) => ({ id, slug: id, title, category, description: 'A project story describing the leather cover, ribbons, and personalized finishing details.', photos: [{ id: 'original-1', width: 720, height: 900, alt, caption: '', label: '' }], coverId: 'original-1', revision: 1, publishedAt: '2026-08-12T12:00:00Z', updatedAt: '2026-08-12T12:00:00Z' })) };
