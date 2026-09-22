'use client';

import { memo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
// Bundled at build time instead of fetched from a CDN at runtime — see
// ShippingMap.tsx, which hit the same CSP connect-src issue.
import worldAtlas from 'world-atlas/countries-110m.json';

interface RoyalWorldMapProps {
  /** Lowercased country names we ship to, highlighted brighter than the
   *  rest of the map. Ignored entirely when `subtle` is set. */
  shippedCountries: string[];
  /** Flat, uniform, very-low-opacity treatment with no covered-country
   *  highlighting — the mobile hero's background watermark. Defaults to
   *  the desktop treatment (highlighted coverage, higher opacity). */
  subtle?: boolean;
}

function RoyalWorldMap({ shippedCountries, subtle = false }: RoyalWorldMapProps) {
  return (
    <ComposableMap
      projection="geoMercator"
      width={800}
      height={420}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <Geographies geography={worldAtlas as any}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const countryName = geo.properties.name.toLowerCase();
            let isCovered = shippedCountries.includes(countryName);

            // Same alias handling as ShippingMap — the atlas' names don't
            // always match what's stored in shipping_zones.
            if (!isCovered) {
              if (countryName === 'united states of america' && shippedCountries.includes('united states')) isCovered = true;
              if (countryName === 'united kingdom' && shippedCountries.includes('uk')) isCovered = true;
              if (countryName === 'united arab emirates' && shippedCountries.includes('uae')) isCovered = true;
            }

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={subtle ? 'rgba(255, 255, 255, 0.07)' : isCovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)'}
                stroke={subtle ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth={subtle ? 0.35 : 0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}

export default memo(RoyalWorldMap);
