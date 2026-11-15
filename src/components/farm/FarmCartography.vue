<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '@/stores/appStore';

const props = withDefaults(
  defineProps<{
    plotName: string;
    plotCode: string;
    surfaceHa: number;
    slopePercent: number;
    locality: string;
    lat: number;
    lng: number;
  }>(),
  {
    plotCode: 'OBL-N-03',
    surfaceHa: 3.2,
    slopePercent: 3.5,
    locality: 'Obala',
    lat: 4.1717,
    lng: 11.5283,
  }
);

const appStore = useAppStore();

type MapMode = 'sat' | 'topo' | 'cad';
const mode = ref<MapMode>('sat');

/* ------------------------------------------------------------------ *
 * Surveyed boundary of the parcel, expressed in metres (local grid).
 * The initial ring is a realistic five-point field outline; it is then
 * rescaled so that its computed area matches the area declared by the
 * farmer, which keeps the plan geometrically honest.
 * ------------------------------------------------------------------ */
const RAW_RING: [number, number][] = [
  [0, 0],
  [96, 9],
  [108, 84],
  [46, 108],
  [-8, 72],
];

const geo = computed(() => {
  const shoelace = (ring: [number, number][]) => {
    let sum = 0;
    for (let i = 0; i < ring.length; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[(i + 1) % ring.length];
      sum += x1 * y2 - x2 * y1;
    }
    return Math.abs(sum) / 2;
  };

  const targetAreaM2 = Math.max(0.1, props.surfaceHa) * 10_000;
  const k = Math.sqrt(targetAreaM2 / shoelace(RAW_RING));

  const ring: [number, number][] = RAW_RING.map(([x, y]) => [x * k, y * k]);

  const perimeterM = ring.reduce((acc, [x, y], i) => {
    const [nx, ny] = ring[(i + 1) % ring.length];
    return acc + Math.hypot(nx - x, ny - y);
  }, 0);

  const cx = ring.reduce((a, [x]) => a + x, 0) / ring.length;
  const cy = ring.reduce((a, [, y]) => a + y, 0) / ring.length;

  // Map frame inside the SVG viewBox
  const FRAME = { x: 20, y: 20, w: 720, h: 400 };
  const pad = 74;

  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const pxPerM = Math.min((FRAME.w - pad * 2) / spanX, (FRAME.h - pad * 2) / spanY);

  const offsetX = FRAME.x + (FRAME.w - spanX * pxPerM) / 2 - minX * pxPerM;
  const offsetY = FRAME.y + (FRAME.h - spanY * pxPerM) / 2 + maxY * pxPerM;

  const toPx = ([x, y]: [number, number]): [number, number] => [
    offsetX + x * pxPerM,
    offsetY - y * pxPerM,
  ];

  const pts = ring.map(toPx);
  const polygonPoints = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const sides = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const lenM = Math.hypot(
      (ring[(i + 1) % ring.length][0] - ring[i][0]),
      (ring[(i + 1) % ring.length][1] - ring[i][1])
    );
    const [dx, dy] = [(q[0] - p[0]) / pxPerM, -(q[1] - p[1]) / pxPerM];
    const bearing = (Math.atan2(dx, dy) * 180) / Math.PI;
    return {
      x: (p[0] + q[0]) / 2,
      y: (p[1] + q[1]) / 2,
      lenM: Math.round(lenM),
      bearing: ((bearing + 360) % 360).toFixed(0),
    };
  });

  const [ccx, ccy] = toPx([cx, cy]);

  // Vertex coordinates derived from the parcel centroid (metres -> degrees)
  const METERS_PER_DEG = 111_320;
  const latPerM = 1 / METERS_PER_DEG;
  const lngPerM = 1 / (METERS_PER_DEG * Math.cos((props.lat * Math.PI) / 180));

  const vertices = ring.map(([x, y], i) => ({
    id: `P${i + 1}`,
    px: pts[i][0],
    py: pts[i][1],
    lat: (props.lat + (y - cy) * latPerM).toFixed(5),
    lng: (props.lng + (x - cx) * lngPerM).toFixed(5),
    xm: x.toFixed(1),
    ym: y.toFixed(1),
  }));

  // A round bar length that fits nicely under the plan
  const targetBar = 120;
  const rawBar = targetBar / pxPerM;
  const steps = [10, 20, 25, 50, 100, 200, 250, 500];
  const barM = steps.reduce((best, s) => (Math.abs(s - rawBar) < Math.abs(best - rawBar) ? s : best), steps[0]);
  const barPx = barM * pxPerM;

  const baseElevation = 640 + Math.round((props.lat - 3.8) * 40);
  const contourStep = Math.max(2, Math.round(props.slopePercent * 1.5));

  return {
    ring,
    pts,
    polygonPoints,
    sides,
    vertices,
    perimeterM,
    areaM2: targetAreaM2,
    pxPerM,
    centroid: { x: ccx, y: ccy },
    frame: FRAME,
    barM,
    barPx,
    baseElevation,
    contourStep,
    scaleRatio: Math.round(100 / (pxPerM * 0.2646) * 1), // ~1:X for 96dpi rendering
  };
});

const perimeterLabel = computed(
  () => `${Math.round(geo.value.perimeterM)} m`
);

const slopeLabel = computed(() => {
  if (props.slopePercent < 4) return appStore.t('cartography.low');
  if (props.slopePercent < 9) return appStore.t('cartography.moderate');
  return appStore.t('cartography.steep');
});

const centroidLabel = computed(
  () => `${props.lat.toFixed(4)}°N  ${props.lng.toFixed(4)}°E`
);

// Graticule ticks labelled in decimal degrees (1' ≈ 1.85 km)
const graticule = computed(() => {
  const lines: { x?: number; y?: number; label: string; side: 'top' | 'left' }[] = [];
  const { frame } = geo.value;
  const cols = 6;
  const rows = 4;
  for (let i = 1; i < cols; i++) {
    const x = frame.x + (frame.w / cols) * i;
    const dLng = props.lng + ((x - frame.x - frame.w / 2) / frame.w) * 0.06;
    lines.push({ x, label: `${dLng.toFixed(3)}°E`, side: 'top' });
  }
  for (let i = 1; i < rows; i++) {
    const y = frame.y + (frame.h / rows) * i;
    const dLat = props.lat + ((frame.h / 2 - (y - frame.y)) / frame.h) * 0.05;
    lines.push({ y, label: `${dLat.toFixed(3)}°N`, side: 'left' });
  }
  return lines;
});
</script>

<template>
  <div class="space-y-3">
    <!-- Layer switcher -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex p-1 bg-surface-container-high rounded-xl">
        <button
          v-for="m in (['sat', 'topo', 'cad'] as MapMode[])"
          :key="m"
          type="button"
          :class="[
            'px-3 py-1.5 text-label-md font-label-md rounded-lg transition-all cursor-pointer min-h-[34px]',
            mode === m
              ? 'bg-surface-container-lowest text-on-surface shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface',
          ]"
          @click="mode = m"
        >
          {{ m === 'sat' ? appStore.t('cartography.satellite') : m === 'topo' ? appStore.t('cartography.topographic') : appStore.t('cartography.cadastral') }}
        </button>
      </div>

      <span class="font-caption text-caption text-on-surface-variant">
        {{ appStore.t('cartography.scale') }} 1:{{ geo.scaleRatio }}
      </span>
    </div>

    <!-- Plan -->
    <div class="relative w-full rounded-xl overflow-hidden ring-1 ring-outline-variant/40 shadow-inner">
      <svg
        class="w-full h-auto block"
        viewBox="0 0 760 560"
        role="img"
        :aria-label="`${appStore.t('cartography.parcelPlan')} — ${plotName}`"
      >
        <defs>
          <pattern id="parcelFill" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#1F6B3A" stroke-width="2.5" opacity="0.35" />
          </pattern>
          <linearGradient id="parcelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1F6B3A" stop-opacity="0.42" />
            <stop offset="100%" stop-color="#8CD79B" stop-opacity="0.18" />
          </linearGradient>
          <pattern id="paperHatch" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6 L6 0" stroke="#c9bfa4" stroke-width="0.4" opacity="0.5" />
          </pattern>
        </defs>

        <!-- Base layer -->
        <rect x="0" y="0" width="760" height="560" :fill="mode === 'sat' ? '#243024' : mode === 'topo' ? '#f4efe1' : '#ffffff'" />

        <template v-if="mode === 'sat'">
          <image
            href="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&auto=format&fit=crop&q=80"
            x="0"
            y="0"
            width="760"
            height="560"
            preserveAspectRatio="xMidYMid slice"
            opacity="0.92"
          />
          <rect x="0" y="0" width="760" height="560" fill="#0d1b12" opacity="0.34" />
        </template>

        <rect
          v-else-if="mode === 'topo'"
          x="0"
          y="0"
          width="760"
          height="560"
          fill="url(#paperHatch)"
          opacity="0.5"
        />

        <!-- Graticule -->
        <g :opacity="mode === 'sat' ? 0.34 : 0.55">
          <template v-for="(g, i) in graticule" :key="i">
            <line
              v-if="g.x"
              :x1="g.x"
              y1="20"
              :x2="g.x"
              y2="420"
              :stroke="mode === 'sat' ? '#d9f2e0' : '#7c8a7f'"
              stroke-width="0.6"
              stroke-dasharray="4 4"
            />
            <line
              v-if="g.y"
              x1="20"
              :y1="g.y"
              x2="740"
              :y2="g.y"
              :stroke="mode === 'sat' ? '#d9f2e0' : '#7c8a7f'"
              stroke-width="0.6"
              stroke-dasharray="4 4"
            />
            <text
              v-if="g.x"
              :x="g.x"
              y="15"
              text-anchor="middle"
              font-size="8.5"
              :fill="mode === 'sat' ? '#e8f5ec' : '#5d6b60'"
              font-family="ui-monospace, monospace"
            >{{ g.label }}</text>
            <text
              v-if="g.y"
              x="17"
              :y="g.y - 3"
              text-anchor="end"
              font-size="8.5"
              :fill="mode === 'sat' ? '#e8f5ec' : '#5d6b60'"
              font-family="ui-monospace, monospace"
            >{{ g.label }}</text>
          </template>
        </g>

        <!-- SRTM contour lines -->
        <g v-if="mode !== 'cad'">
          <path
            v-for="n in 5"
            :key="`c${n}`"
            :d="`M 30 ${100 + n * 46} C 190 ${60 + n * 46}, 330 ${150 + n * 40}, 470 ${105 + n * 45} S 650 ${55 + n * 48}, 730 ${95 + n * 46}`"
            fill="none"
            :stroke="mode === 'sat' ? '#f0d9a8' : '#b08a55'"
            :stroke-width="n === 3 ? 1.6 : 0.9"
            :opacity="mode === 'sat' ? 0.55 : 0.8"
          />
          <text
            v-for="n in 5"
            :key="`cl${n}`"
            x="640"
            :y="96 + n * 47"
            font-size="8"
            :fill="mode === 'sat' ? '#f7e7c4' : '#8a6a3c'"
            font-family="ui-monospace, monospace"
          >{{ geo.baseElevation + (n - 3) * geo.contourStep }} m</text>
        </g>

        <!-- Parcel -->
        <polygon
          :points="geo.polygonPoints"
          :fill="mode === 'cad' ? 'url(#parcelFill)' : 'url(#parcelGradient)'"
          :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'"
          stroke-width="3"
          stroke-dasharray="9 4"
          stroke-linejoin="round"
        />

        <!-- Segment lengths + bearings -->
        <g font-family="ui-monospace, monospace">
          <template v-for="(s, i) in geo.sides" :key="`s${i}`">
            <rect
              :x="s.x - 30"
              :y="s.y - 11"
              width="60"
              height="15"
              rx="7.5"
              :fill="mode === 'sat' ? 'rgba(13,27,18,0.78)' : 'rgba(255,255,255,0.92)'"
            />
            <text
              :x="s.x"
              :y="s.y - 0.5"
              text-anchor="middle"
              font-size="9"
              :fill="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'"
            >{{ s.lenM }} m · {{ s.bearing }}°</text>
          </template>
        </g>

        <!-- Vertex markers -->
        <g v-for="v in geo.vertices" :key="v.id">
          <circle :cx="v.px" :cy="v.py" r="7" fill="#ffffff" stroke="#005226" stroke-width="3" />
          <text
            :x="v.px + 12"
            :y="v.py - 9"
            font-size="9.5"
            font-weight="700"
            :fill="mode === 'sat' ? '#ffffff' : '#005226'"
            font-family="ui-monospace, monospace"
          >{{ v.id }}</text>
        </g>

        <!-- Centroid -->
        <g>
          <circle :cx="geo.centroid.x" :cy="geo.centroid.y" r="11" fill="none" stroke="#FDAF40" stroke-width="2" />
          <line :x1="geo.centroid.x - 16" :y1="geo.centroid.y" :x2="geo.centroid.x + 16" :y2="geo.centroid.y" stroke="#FDAF40" stroke-width="1.4" />
          <line :x1="geo.centroid.x" :y1="geo.centroid.y - 16" :x2="geo.centroid.x" :y2="geo.centroid.y + 16" stroke="#FDAF40" stroke-width="1.4" />
          <rect
            :x="geo.centroid.x - 58"
            :y="geo.centroid.y + 20"
            width="116"
            height="16"
            rx="8"
            fill="rgba(13,27,18,0.82)"
          />
          <text
            :x="geo.centroid.x"
            :y="geo.centroid.y + 31"
            text-anchor="middle"
            font-size="9"
            fill="#f4efe1"
            font-family="ui-monospace, monospace"
          >{{ centroidLabel }}</text>
        </g>

        <!-- North arrow -->
        <g transform="translate(706, 74)">
          <circle r="24" :fill="mode === 'sat' ? 'rgba(13,27,18,0.7)' : 'rgba(255,255,255,0.9)'" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="1.4" />
          <path d="M0 -17 L6 4 L0 0 L-6 4 Z" :fill="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" />
          <text
            y="17"
            text-anchor="middle"
            font-size="9"
            font-weight="700"
            :fill="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'"
          >{{ appStore.t('cartography.north') }}</text>
        </g>

        <!-- Graphic scale -->
        <g transform="translate(40, 388)">
          <rect x="0" y="0" width="24" height="7" :fill="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'" />
          <rect :x="geo.barPx / 2" y="0" :width="geo.barPx / 2" height="7" :fill="mode === 'sat' ? '#0d1b12' : '#ffffff'" :stroke="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'" stroke-width="0.8" />
          <text x="0" y="-5" font-size="9" :fill="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'" font-family="ui-monospace, monospace">0</text>
          <text :x="geo.barPx / 2" y="-5" text-anchor="middle" font-size="9" :fill="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'" font-family="ui-monospace, monospace">{{ geo.barM / 2 }}</text>
          <text :x="geo.barPx" y="-5" text-anchor="end" font-size="9" :fill="mode === 'sat' ? '#e8f5ec' : '#1F6B3A'" font-family="ui-monospace, monospace">{{ geo.barM }} m</text>
        </g>

        <!-- Legend -->
        <g transform="translate(40, 44)">
          <rect x="0" y="0" width="176" height="86" rx="8" :fill="mode === 'sat' ? 'rgba(13,27,18,0.74)' : 'rgba(255,255,255,0.94)'" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="1" />
          <text x="10" y="16" font-size="9" font-weight="700" :fill="mode === 'sat' ? '#c9f7d6' : '#005226'" font-family="ui-monospace, monospace">{{ appStore.t('cartography.legend').toUpperCase() }}</text>
          <line x1="10" y1="30" x2="34" y2="30" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="3" stroke-dasharray="7 3" />
          <text x="40" y="33" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">{{ appStore.t('cartography.boundary') }}</text>
          <line x1="10" y1="48" x2="34" y2="48" :stroke="mode === 'sat' ? '#f0d9a8' : '#b08a55'" stroke-width="1.2" />
          <text x="40" y="51" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">{{ appStore.t('cartography.contour') }}</text>
          <line x1="10" y1="66" x2="34" y2="66" :stroke="mode === 'sat' ? '#d9f2e0' : '#7c8a7f'" stroke-width="0.8" stroke-dasharray="3 3" />
          <text x="40" y="69" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">{{ appStore.t('cartography.graticule') }}</text>
        </g>

        <!-- Title block (cartouche) -->
        <g transform="translate(470, 316)">
          <rect x="0" y="0" width="270" height="104" rx="8" :fill="mode === 'sat' ? 'rgba(13,27,18,0.82)' : 'rgba(255,255,255,0.96)'" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="1.2" />
          <text x="12" y="19" font-size="10" font-weight="700" :fill="mode === 'sat' ? '#c9f7d6' : '#005226'" font-family="ui-monospace, monospace">
            {{ appStore.t('cartography.titleBlock').toUpperCase() }}
          </text>
          <line x1="12" y1="26" x2="258" y2="26" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="0.7" opacity="0.6" />
          <text x="12" y="41" font-size="9.5" :fill="mode === 'sat' ? '#e8f5ec' : '#1b2a22'">{{ plotName }}</text>
          <text x="258" y="41" text-anchor="end" font-size="9" :fill="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" font-family="ui-monospace, monospace">{{ plotCode }}</text>
          <text x="12" y="56" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">
            {{ appStore.t('cartography.area') }}: {{ surfaceHa }} ha
          </text>
          <text x="150" y="56" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">
            {{ appStore.t('cartography.perimeter') }}: {{ perimeterLabel }}
          </text>
          <text x="12" y="70" font-size="8.5" :fill="mode === 'sat' ? '#e8f5ec' : '#33463a'">
            {{ appStore.t('cartography.slope') }}: {{ slopePercent }}% ({{ slopeLabel }})
          </text>
          <text x="12" y="84" font-size="7.5" :fill="mode === 'sat' ? '#cfe6d6' : '#5d6b60'" font-family="ui-monospace, monospace">
            {{ appStore.t('cartography.datum') }}
          </text>
          <text x="12" y="96" font-size="7.5" :fill="mode === 'sat' ? '#cfe6d6' : '#5d6b60'" font-family="ui-monospace, monospace">
            {{ appStore.t('cartography.source') }}
          </text>
        </g>

        <!-- Neat-line frame -->
        <rect x="8" y="8" width="744" height="544" fill="none" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="2" />
        <rect x="14" y="14" width="732" height="532" fill="none" :stroke="mode === 'sat' ? '#c9f7d6' : '#1F6B3A'" stroke-width="0.6" opacity="0.7" />
      </svg>
    </div>

    <!-- Survey table -->
    <div class="overflow-x-auto rounded-xl border border-outline-variant/30">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-container-low">
            <th class="px-3 py-2 font-label-md text-caption text-on-surface-variant uppercase tracking-wider">{{ appStore.t('cartography.vertices') }}</th>
            <th class="px-3 py-2 font-label-md text-caption text-on-surface-variant uppercase tracking-wider">X (m)</th>
            <th class="px-3 py-2 font-label-md text-caption text-on-surface-variant uppercase tracking-wider">Y (m)</th>
            <th class="px-3 py-2 font-label-md text-caption text-on-surface-variant uppercase tracking-wider">Latitude</th>
            <th class="px-3 py-2 font-label-md text-caption text-on-surface-variant uppercase tracking-wider">Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="v in geo.vertices"
            :key="v.id"
            class="border-t border-outline-variant/20 hover:bg-surface-container-low/60"
          >
            <td class="px-3 py-1.5 font-body-bold text-caption text-primary">{{ v.id }}</td>
            <td class="px-3 py-1.5 font-mono text-caption text-on-surface">{{ v.xm }}</td>
            <td class="px-3 py-1.5 font-mono text-caption text-on-surface">{{ v.ym }}</td>
            <td class="px-3 py-1.5 font-mono text-caption text-on-surface">{{ v.lat }}</td>
            <td class="px-3 py-1.5 font-mono text-caption text-on-surface">{{ v.lng }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
