/** @type {import('tailwindcss').Config} */

/*
 * COLD STEEL — visual rework, Stage 1 (holding skin).
 *
 * Two vocabularies live here on purpose:
 *
 *   1. The real palette — steel / line / ink / ember / info / warn / good.
 *      New and rewritten views use ONLY these.
 *
 *   2. The alias block at the bottom — olive / military / tan pointed at the
 *      new palette so the not-yet-rewritten routes stay coherent. It is
 *      temporary. Each route's rewrite deletes its own old classes, and when
 *      `grep -roE "\b(military|olive|tan)-[0-9]+" src` returns nothing the
 *      alias block comes out and the rework is done.
 *
 * Note `ember` rather than `accent`: shadcn already owns `accent` for menu
 * hover surfaces (22 call sites). Ember is "the one action on the screen" —
 * if two things on a screen are ember, one of them is wrong.
 */

const steel = {
    950: '#0A0E12', // app background, deepest surface
    900: '#0C1116', // subject / detail pane
    880: '#0D1318', // top chrome, bottom nav
    850: '#0E141A', // schematic and chart plot area
    800: '#11171D', // resting card, list row
    750: '#141B22', // raised card, input field
    700: '#161E26', // hover / selected row
    650: '#1A222A', // active nav item, selected filter
    600: '#1C242C', // chip, avatar tile
    550: '#1E2830', // part icon tile
    500: '#26313C', // schematic part fill (secondary)
    450: '#2C3844', // schematic part fill (primary)
};

const line = {
    900: '#1B242C', // pane divider, hairline
    800: '#212A32', // card border (resting)
    700: '#262F38', // card border (raised)
    600: '#2A343D', // input border, chip border
    500: '#33414D', // secondary button border
    400: '#37434F', // emphasis border (selected card)
    300: '#3E4C59', // schematic outline
    200: '#46525E', // dashed empty-slot border
};

// Text ramp. Named `ink` because Tailwind's `text-` prefix is already taken by
// font size — `text-ink-300` reads, `text-text-300` does not.
const ink = {
    hi: '#F6FAFC',  // display numerals, hero headings
    100: '#ECF2F7', // headings
    200: '#DCE6ED', // sub-headings, list titles
    300: '#C6D3DC', // body
    400: '#A9BAC6', // secondary body
    500: '#8DA0AE', // muted body
    600: '#7E909F', // labels, eyebrows
    700: '#5C6E7C', // disabled, placeholder
    800: '#4C5A66', // unchecked control border
};

module.exports = {
    // NOTE: do not "fix" these globs. Tailwind 4 auto-detects sources; adding
    // src/app/** here overrides that detection and silently drops classes.
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/app/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                steel,
                line,
                ink,

                // The one action. Never more than one per screen.
                ember: {
                    DEFAULT: '#FF4A24',
                    hover: '#FF6B4A',
                    soft: '#FFB9A8', // text inside ember-bordered chips
                    pale: '#FFD9CE',
                    edge: '#3A2A22', // border/fill for ember-adjacent panels
                    ink: '#0A0E12',  // text on an ember fill
                },

                // Semantic. Separate from ember, and never a substitute for it.
                info: {
                    DEFAULT: '#5B8CA8', // neutral data, icons, secondary progress
                    light: '#6E9DB8',
                    soft: '#7FA8BF',
                    pale: '#9BBDD0',
                },
                warn: '#FFB020', // currency, partial progress, ready to build
                good: '#4ADE80', // completed, improved stat, favourable verdict
                bad: '#FF3D3D',
                track: '#28323B', // progress-bar track

                /* Item rarity. An ordinal tier scale, so it is its own vocabulary — reusing
                 * ember/warn/good here would make a Legendary chip look like a warning and an
                 * Ultimate one look like the page's single action.
                 *
                 * The steps are validated as a categorical palette against the card surface:
                 * every adjacent tier pair clears the CVD and normal-vision separation floors, and
                 * all six clear 3:1 contrast. Non-adjacent pairs (Rare vs Common, Rare vs Epic)
                 * sit closer than the floor — six hues on a dark ground cannot all separate — so
                 * rarity is never drawn as colour alone: RarityBadge always prints the tier name.
                 */
                rarity: {
                    common: {DEFAULT: '#8DA0AE', edge: '#2C363E', fill: '#161D24'},
                    uncommon: {DEFAULT: '#5FD18F', edge: '#234436', fill: '#12211A'},
                    rare: {DEFAULT: '#3E8FC7', edge: '#1E3D54', fill: '#0F1B25'},
                    epic: {DEFAULT: '#CFA2FF', edge: '#3B2E55', fill: '#191428'},
                    legendary: {DEFAULT: '#F5B23A', edge: '#4A3714', fill: '#1F180B'},
                    ultimate: {DEFAULT: '#FF5F5F', edge: '#4E2222', fill: '#211011'},
                },

                /* ---------------------------------------------------------
                 * HOLDING SKIN — temporary aliases, deleted in Stage 10.
                 *
                 * olive-400/500/600 were the old single "highlight". Cold Steel
                 * splits that into info (data) and ember (the one action), and
                 * which one a given call site wants cannot be decided in bulk.
                 * So every olive maps to INFO here — the quiet, safe default —
                 * and ember gets assigned per route during that route's
                 * rewrite, with the whole screen visible.
                 *
                 * The ramp splits by weight, not by hue: 200-400 are TEXT-weight
                 * info (light enough to read on steel), 500-600 are FILL-weight
                 * info (dark enough that the existing light button labels keep
                 * ~6:1 contrast). Mapping both to one mid-tone would have left
                 * every `bg-olive-600` button at 2.8:1.
                 * ------------------------------------------------------- */
                olive: {
                    50: ink.hi,
                    100: ink[100],
                    200: '#9BBDD0', // text weight
                    300: '#7FA8BF',
                    400: '#5B8CA8',
                    500: '#3E7191', // fill weight (hover)
                    600: '#35637E', // fill weight (rest)
                    700: line[800],
                    800: line[700],
                    900: line[900],
                    950: steel[950],
                },
                military: {
                    100: ink[100],
                    200: ink[200],
                    300: ink[300],
                    400: ink[500],
                    500: ink[700],
                    600: line[600],
                    700: steel[700],
                    800: steel[800],
                    // 850 was used in 4 files and defined nowhere — those
                    // panels have been rendering transparent. Defined now.
                    850: steel[850],
                    900: steel[950],
                    950: steel[950],
                },
                tan: {
                    100: ink[100],
                    200: ink[200],
                    300: ink[300],
                    400: ink[400],
                    500: ink[500],
                    600: ink[600],
                    700: ink[700],
                    800: ink[800],
                    900: line[500],
                    950: line[600],
                },
                // `camo` is deleted — it was defined here and used nowhere.
            },
            fontFamily: {
                display: ['var(--font-display)', 'Oswald', 'Arial Narrow', 'system-ui', 'sans-serif'],
                sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
            },
            fontSize: {
                // Larger text for VR readability
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '4rem',
            },
            letterSpacing: {
                eyebrow: '0.24em',
                micro: '0.18em',
                nav: '0.06em',
            },
            spacing: {
                // Larger touch targets for VR
                '12': '3rem',
                '16': '4rem',
                '20': '5rem',
                '24': '6rem',
                // Shell metrics from the handoff
                'chrome': '62px',
                'bottomnav': '66px',
            },
            // Radius 0 everywhere. The only non-rectangular shape in the design
            // is the clipped shoulder on hero panels (see .clip-shoulder).
            borderRadius: {
                'none': '0',
                'sm': '0',
                DEFAULT: '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '0',
            },
            minHeight: {
                '12': '3rem',
                '16': '4rem',
            },
            minWidth: {
                '12': '3rem',
                '16': '4rem',
                '48': '12rem',
            },
            maxWidth: {
                '7xl': '80rem',
            },
            screens: {
                // The layout rule is defined against 900px, not Tailwind's lg.
                'shell': '900px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
