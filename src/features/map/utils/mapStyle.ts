export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';

const OSM_TILE_URLS = [
  'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
  'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
];

export const MAP_STYLE_DEFINITION = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: OSM_TILE_URLS,
      tileSize: 256,
      attribution: OSM_ATTRIBUTION,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
} as const;

export const MAP_STYLE_JSON = JSON.stringify(MAP_STYLE_DEFINITION);

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
