import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { platform } from 'node:process';
import { fileURLToPath } from 'node:url';

// npm run render:og -- [input-art] [output-jpeg] [card-preset]
const currentScriptPath = fileURLToPath(import.meta.url);
const scriptDirectory = dirname(currentScriptPath);
const repositoryRoot = resolve(scriptDirectory, '..');

const inputArgument = process.argv[2] ?? 'public/og/art/default-base.png';
const outputArgument = process.argv[3] ?? 'public/og-image.jpg';
const presetArgument = process.argv[4] ?? 'base';
const inputPath = isAbsolute(inputArgument) ? inputArgument : resolve(repositoryRoot, inputArgument);
const outputPath = isAbsolute(outputArgument) ? outputArgument : resolve(repositoryRoot, outputArgument);

const cardPresets = {
  base: {
    eyebrow: 'FIELD SYSTEM / EXTRACTION INTELLIGENCE',
    titlePrimary: 'EXFIL',
    titleAccent: 'ZONE',
    descriptor: 'ASSISTANT',
    benefit: 'Plan tasks, builds, and the route out.',
    status: 'FIELD READY // LIVE DATA',
  },
  tasks: {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'TASK',
    titleAccent: 'CHAINS',
    titleGap: 12,
    descriptor: 'PROGRESS TRACKER',
    benefit: 'Track requirements, progress, and what opens next.',
    status: 'CHAIN STATE // LOCAL PROGRESS',
    screen: {
      path: ['public', 'og', 'art', 'tasks-ui-capture.png'],
      left: 475,
      top: 135,
      width: 588,
      height: 352,
    },
  },
  combat: {
    eyebrow: 'FIELD SYSTEM / COMBAT SIM',
    titlePrimary: 'COMBAT',
    titleAccent: 'SIM',
    titleGap: 12,
    descriptor: 'DAMAGE MODEL',
    benefit: 'Know where to aim and how many rounds it takes.',
    status: 'AIMED SHOT // LIVE LOADOUT',
    screen: {
      path: ['public', 'og', 'art', 'combat-sim-ui-capture-2.png'],
      left: 475,
      top: 135,
      width: 588,
      height: 352,
    },
  },
  hideout: {
    eyebrow: 'FIELD SYSTEM / HIDEOUT',
    titlePrimary: 'HIDEOUT',
    titleAccent: '',
    descriptor: 'UPGRADE PLANNER',
    benefit: 'See what is ready, what it costs, and what blocks it.',
    status: '70 UPGRADES // 29 ZONES',
    screen: {
      path: ['public', 'og', 'art', 'hideout-ui-capture.png'],
      left: 475,
      top: 135,
      width: 588,
      height: 352,
      brightness: 1.08,
    },
  },
  gunsmith: {
    eyebrow: 'FIELD SYSTEM / GUNSMITH',
    titlePrimary: 'GUN',
    titleAccent: 'SMITH',
    descriptor: 'WEAPON BUILDER',
    benefit: 'Assemble real parts and see the resulting weapon stats.',
    status: 'BUILD STATE // LIVE STATS',
    screen: {
      path: ['public', 'og', 'art', 'gunsmith-ui-capture.png'],
      left: 475,
      top: 135,
      width: 588,
      height: 352,
    },
  },
  items: {
    eyebrow: 'FIELD SYSTEM / ITEMS',
    titlePrimary: 'ITEM',
    titleAccent: 'S',
    titleGap: 12,
    descriptor: 'DATABASE',
    benefit: 'Know every item and what it is worth.',
    status: 'DATABASE // LIVE DATA',
  },
  guides: {
    eyebrow: 'FIELD SYSTEM / GUIDES',
    titlePrimary: 'GUIDE',
    titleAccent: 'S',
    titleGap: 12,
    descriptor: 'FIELD MANUALS',
    benefit: 'Learn the systems that keep you alive.',
    status: 'KNOWLEDGE // FIELD TESTED',
  },
  'guide-damage': {
    eyebrow: 'FIELD MANUAL / COMBAT',
    titlePrimary: 'DAMAGE',
    titleAccent: '',
    descriptor: 'STEP BY STEP',
    benefit: 'From pulling the trigger to losing health.',
    status: 'SHOT RESOLUTION // INTERACTIVE GUIDE',
  },
  'guide-armor': {
    eyebrow: 'FIELD MANUAL / PROTECTION',
    titlePrimary: 'ARMOR',
    titleAccent: '',
    descriptor: 'PENETRATION',
    benefit: 'Penetration, wear, and the gaps in your armor.',
    status: 'PROTECTION MODEL // FIELD GUIDE',
  },
  'vendor-ark': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'ARK',
    titleAccent: '',
    descriptor: 'TOMMY',
    benefit: '37 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '01 / 06',
      merchant: 'TOMMY',
      taskCount: 37,
      trust: 'TRUST 1-4',
      portrait: ['public', 'images', 'tasks', 'img_ark1Merchant.webp'],
      icon: ['public', 'images', 'tasks', 'icon_Arkshop1_nobg.webp'],
    },
  },
  'vendor-regiment': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'REGIMENT',
    titleAccent: '',
    titleSize: 92,
    descriptor: 'IGOR',
    benefit: '35 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '02 / 06',
      merchant: 'IGOR',
      taskCount: 35,
      trust: 'TRUST 1-4',
      portrait: ['public', 'images', 'tasks', 'img_RegiMerchant.webp'],
      icon: ['public', 'images', 'tasks', 'icon_Regishop_nobg.webp'],
    },
  },
  'vendor-forge': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'BOULDER',
    titleAccent: 'FORGE',
    titleGap: 10,
    titleSize: 76,
    descriptor: 'MAXIMILIAN',
    descriptorSize: 30,
    descriptorSpacing: 8,
    benefit: '39 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '03 / 06',
      merchant: 'MAXIMILIAN',
      taskCount: 39,
      trust: 'TRUST 1-4',
      portrait: ['public', 'images', 'tasks', 'img_ar2Merchant.webp'],
      icon: ['public', 'images', 'tasks', 'icon_Arkshop2_nobg.webp'],
    },
  },
  'vendor-ntg': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'N.T.G',
    titleAccent: '',
    descriptor: 'MAGGIE',
    benefit: '35 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '04 / 06',
      merchant: 'MAGGIE',
      taskCount: 35,
      trust: 'TRUST 1-4',
      portrait: ['public', 'images', 'tasks', 'img_DocMerchant.webp'],
      icon: ['public', 'images', 'tasks', 'icon_NTGshop_nobg.webp'],
    },
  },
  'vendor-trupiks': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: "TRUPIK'S",
    titleAccent: '',
    titleSize: 92,
    descriptor: 'JOHNNY',
    benefit: '29 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '05 / 06',
      merchant: 'JOHNNY',
      taskCount: 29,
      trust: 'TRUST NOT PUBLISHED',
      portrait: ['public', 'images', 'tasks', 'img_TPMerchant.webp'],
      icon: ['public', 'images', 'tasks', 'icon_TPshop_nobg.webp'],
    },
  },
  'vendor-neumann': {
    eyebrow: 'FIELD SYSTEM / TASKS',
    titlePrimary: 'NEUMANN',
    titleAccent: '',
    titleSize: 92,
    descriptor: 'ANNA',
    benefit: '44 tasks. See what opens next.',
    status: 'VENDOR DOSSIER // LOCAL PROGRESS',
    vendor: {
      index: '06 / 06',
      merchant: 'ANNA',
      taskCount: 44,
      trust: 'TRUST 1-4',
      portrait: ['public', 'images', 'tasks', 'img_GunsmithMerchant.webp'],
      icon: ['public', 'images', 'tasks', 'Icon_GunsmithShop_nobg.webp'],
    },
  },
};

const card = cardPresets[presetArgument];

if (!card) {
  throw new Error(`Unknown OG card preset: ${presetArgument}`);
}

const assetPath = (...segments) => resolve(scriptDirectory, 'assets', ...segments);
const repositoryPath = (...segments) => resolve(repositoryRoot, ...segments);

const fontconfigDirectory = resolve(tmpdir(), 'exfil-zone-og-fontconfig');
const fontconfigCacheDirectory = resolve(fontconfigDirectory, 'cache');
const fontconfigPath = resolve(fontconfigDirectory, 'fonts.conf');
const systemFontDirectories = platform === 'win32'
  ? ['C:/Windows/Fonts']
  : platform === 'darwin'
    ? ['/System/Library/Fonts', '/Library/Fonts']
    : ['/usr/share/fonts', '/usr/local/share/fonts'];
const xmlPath = (path) => path.replaceAll('&', '&amp;').replaceAll('\\', '/');

await mkdir(fontconfigCacheDirectory, { recursive: true });
await writeFile(fontconfigPath, `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
${systemFontDirectories.map((path) => `  <dir>${xmlPath(path)}</dir>`).join('\n')}
  <cachedir>${xmlPath(fontconfigCacheDirectory)}</cachedir>
</fontconfig>
`);

if (process.env.EXFIL_ZONE_OG_FONTCONFIG_READY !== '1') {
  const child = spawnSync(process.execPath, [currentScriptPath, ...process.argv.slice(2)], {
    env: {
      ...process.env,
      EXFIL_ZONE_OG_FONTCONFIG_READY: '1',
      FONTCONFIG_FILE: fontconfigPath,
    },
    stdio: 'inherit',
  });

  if (child.error) throw child.error;
  process.exit(child.status ?? 1);
}

const { default: sharp } = await import('sharp');

const [saira, plexSans, plexMono] = await Promise.all([
  readFile(assetPath('og-fonts', 'saira-condensed-800-latin.woff2'), 'base64'),
  readFile(assetPath('og-fonts', 'ibm-plex-sans-600-latin.woff2'), 'base64'),
  readFile(assetPath('og-fonts', 'ibm-plex-mono-600-latin.woff2'), 'base64'),
]);

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>
    @font-face { font-family: 'Saira Condensed OG'; src: url(data:font/woff2;base64,${saira}) format('woff2'); font-weight: 800; }
    @font-face { font-family: 'IBM Plex Sans OG'; src: url(data:font/woff2;base64,${plexSans}) format('woff2'); font-weight: 600; }
    @font-face { font-family: 'IBM Plex Mono OG'; src: url(data:font/woff2;base64,${plexMono}) format('woff2'); font-weight: 600; }
  </style>
  <defs>
    <linearGradient id="copy-field" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0A0E12" stop-opacity="0.94"/>
      <stop offset="0.56" stop-color="#0A0E12" stop-opacity="0.75"/>
      <stop offset="0.72" stop-color="#0A0E12" stop-opacity="0"/>
    </linearGradient>
    <pattern id="technical-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="#8DA0AE" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#copy-field)"/>
  <rect x="24" y="24" width="1152" height="582" fill="url(#technical-grid)" opacity="0.7"/>
  <path d="M24 606V24H1090L1122 56H1176V606Z" fill="none" stroke="#33414D" stroke-width="1"/>
  <path d="M1090 24L1122 56H1176" fill="none" stroke="#8DA0AE" stroke-opacity="0.7" stroke-width="1"/>

  <rect x="202" y="81" width="26" height="2" fill="#FF4A24"/>
  <text x="242" y="88" fill="#8DA0AE" font-family="IBM Plex Mono OG, monospace" font-size="16" font-weight="600" letter-spacing="2.8">${card.eyebrow}</text>

  <text x="72" y="302" font-family="Saira Condensed OG, Arial Narrow, sans-serif" font-size="${card.titleSize ?? 108}" font-weight="800" letter-spacing="-1"><tspan fill="#ECF2F7">${card.titlePrimary}</tspan><tspan dx="${card.titleGap ?? 0}" fill="#FF4A24">${card.titleAccent}</tspan></text>
  <text x="76" y="364" fill="#ECF2F7" font-family="IBM Plex Mono OG, monospace" font-size="${card.descriptorSize ?? 34}" font-weight="600" letter-spacing="${card.descriptorSpacing ?? 11}">${card.descriptor}</text>

  <path d="M72 410H504" stroke="#33414D" stroke-width="1"/>
  <path d="M72 410H122" stroke="#FF4A24" stroke-width="3"/>
  <text x="72" y="453" fill="#B9C6CF" font-family="IBM Plex Sans OG, sans-serif" font-size="24" font-weight="600">${card.benefit}</text>

  <g transform="translate(72 540)">
    <rect width="10" height="10" fill="#FF4A24"/>
    <text x="25" y="11" fill="#8DA0AE" font-family="IBM Plex Mono OG, monospace" font-size="14" font-weight="600" letter-spacing="2.4">${card.status}</text>
  </g>
</svg>`);

await mkdir(dirname(outputPath), { recursive: true });

const screenSource = card.screen ? sharp(repositoryPath(...card.screen.path)) : null;

async function renderVendorDossier(vendor) {
  const portraitMask = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="288" height="288" viewBox="0 0 288 288">
      <path d="M0 0H258L288 30V288H0Z" fill="#fff"/>
    </svg>
  `);
  const portrait = await sharp(repositoryPath(...vendor.portrait))
    .resize(288, 288, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.78, saturation: 0.38 })
    .sharpen({ sigma: 0.7 })
    .composite([{ input: portraitMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const icon = await sharp(repositoryPath(...vendor.icon))
    .resize(112, 112, { fit: 'contain' })
    .grayscale()
    .tint('#B9C6CF')
    .png()
    .toBuffer();
  const base = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="588" height="352" viewBox="0 0 588 352">
      <defs>
        <pattern id="screen-grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M18 0H0V18" fill="none" stroke="#8DA0AE" stroke-opacity="0.06" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="588" height="352" fill="#0A0E12"/>
      <rect width="588" height="352" fill="url(#screen-grid)"/>
      <path d="M22 54H248" stroke="#33414D"/>
      <path d="M22 54H70" stroke="#FF4A24" stroke-width="2"/>
      <path d="M238 80V272" stroke="#33414D"/>
      <path d="M238 122V202" stroke="#FF4A24" stroke-width="2"/>
      <rect x="233" y="76" width="10" height="10" fill="#141B22" stroke="#8DA0AE"/>
      <rect x="233" y="117" width="10" height="10" fill="#FF4A24"/>
      <rect x="233" y="198" width="10" height="10" fill="#141B22" stroke="#8DA0AE"/>
      <rect x="233" y="268" width="10" height="10" fill="#141B22" stroke="#8DA0AE"/>
      <rect x="276" y="31" width="288" height="288" fill="#141B22"/>
    </svg>
  `);
  const foreground = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="588" height="352" viewBox="0 0 588 352">
      <style>
        @font-face { font-family: 'Saira Condensed OG'; src: url(data:font/woff2;base64,${saira}) format('woff2'); font-weight: 800; }
        @font-face { font-family: 'IBM Plex Mono OG'; src: url(data:font/woff2;base64,${plexMono}) format('woff2'); font-weight: 600; }
      </style>
      <defs>
        <linearGradient id="portrait-fade" x1="0" x2="1">
          <stop offset="0" stop-color="#0A0E12" stop-opacity="0.72"/>
          <stop offset="0.28" stop-color="#0A0E12" stop-opacity="0"/>
        </linearGradient>
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 1H588" stroke="#0A0E12" stroke-opacity="0.2"/>
        </pattern>
      </defs>
      <rect x="276" y="31" width="288" height="288" fill="url(#portrait-fade)"/>
      <rect x="276" y="31" width="288" height="288" fill="url(#scanlines)" opacity="0.32"/>
      <path d="M276 319V31H534L564 61V319Z" fill="none" stroke="#33414D"/>
      <path d="M534 31L564 61" stroke="#8DA0AE" stroke-opacity="0.7"/>
      <text x="22" y="35" fill="#8DA0AE" font-family="IBM Plex Mono OG, monospace" font-size="12" font-weight="600" letter-spacing="2">VENDOR DOSSIER // ${vendor.index}</text>
      <text x="298" y="298" fill="#ECF2F7" font-family="Saira Condensed OG, Arial Narrow, sans-serif" font-size="31" font-weight="800" letter-spacing="1">${vendor.merchant}</text>
      <rect x="298" y="307" width="42" height="2" fill="#FF4A24"/>
      <text x="22" y="326" fill="#8DA0AE" font-family="IBM Plex Mono OG, monospace" font-size="12" font-weight="600" letter-spacing="1.6">CHAIN INDEX // ${vendor.taskCount} TASKS</text>
      <text x="564" y="341" text-anchor="end" fill="#8DA0AE" font-family="IBM Plex Mono OG, monospace" font-size="10" font-weight="600" letter-spacing="1.3">${vendor.trust}</text>
    </svg>
  `);

  return sharp(base)
    .composite([
      { input: icon, left: 78, top: 92, opacity: 0.72 },
      { input: portrait, left: 276, top: 31 },
      { input: foreground, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

const vendorScreen = card.vendor ? await renderVendorDossier(card.vendor) : null;

const [background, logo, screen] = await Promise.all([
  sharp(inputPath).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer(),
  sharp(repositoryPath('public', 'brand', 'logo-ez.svg')).resize(110, 110, { fit: 'contain' }).png().toBuffer(),
  vendorScreen ?? (screenSource && card.screen
    ? screenSource
      .resize(card.screen.width, card.screen.height, { fit: 'cover', position: 'centre' })
      .modulate({ brightness: card.screen.brightness ?? 0.98, saturation: 0.9 })
      .sharpen({ sigma: 0.6 })
      .png()
      .toBuffer()
    : null),
]);

const screenPlacement = card.vendor
  ? { left: 475, top: 135 }
  : card.screen;
const art = screen && screenPlacement
  ? await sharp(background).composite([{
    input: screen,
    left: screenPlacement.left,
    top: screenPlacement.top,
  }]).toBuffer()
  : background;

await sharp(art)
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 51, left: 75 },
  ])
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: true })
  .toFile(outputPath);

console.log(`Rendered ${outputPath} from ${inputPath}`);
