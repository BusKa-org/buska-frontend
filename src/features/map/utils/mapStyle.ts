// src/features/map/utils/mapStyle.ts
// Estilo de mapa usado em todos os componentes (mobile + web).
// OpenFreeMap é gratuito (sem cadastro, sem cartão, sem chave) e serve
// vector tiles do OpenStreetMap. Trocar pra outro provedor é uma linha.

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Atribuição obrigatória do OSM (já incluída pelo estilo, mas exposta caso
// algum componente queira renderizar manualmente).
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
