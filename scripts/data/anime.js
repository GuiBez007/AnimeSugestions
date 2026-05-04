import { bruno } from './Recomendacoes/Bruno.js';
import { guilherme } from './Recomendacoes/Guilherme.js';
import { jhonas } from './Recomendacoes/Jhonas.js';

export const animeData = [
  ...bruno.map(a => ({ ...a, recommendedBy: 'Bruno' })),
  ...guilherme.map(a => ({ ...a, recommendedBy: 'Guilherme' })),
  ...jhonas.map(a => ({ ...a, recommendedBy: 'Jhonas' }))
];
