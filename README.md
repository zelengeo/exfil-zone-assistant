# ExfilZone Assistant 🎮

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.7-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive wiki and combat simulator for VR tactical shooters. Providing accurate damage calculations, item databases, and strategic guides optimized for VR gameplay.

[**View Live Demo**](https://exfil-zone-assistant.app) | [**Report Bug**](https://github.com/zelengeo/exfil-zone-assistant/issues) | [**Request Feature**](https://github.com/zelengeo/exfil-zone-assistant/issues)

</div>

## 🚀 Features

### ⚔️ Combat Simulator
- **Accurate Damage Calculations** - ~95% accuracy compared to in-game values
- **Time-to-Kill Analysis** - Calculate optimal loadouts for different scenarios
- **Penetration Mechanics** - Detailed armor penetration and damage reduction calculations
- **Range-Based Falloff** - Account for distance in your combat planning

### 📦 Item Database
- **Comprehensive Stats** - Hidden weapon stats, armor values, and ammunition data
- **Smart Filtering** - Filter by category, rarity, and subcategory
- **Detailed Comparisons** - Side-by-side item analysis
- **VR-Optimized UI** - Large touch targets and high contrast design

### 📚 Strategic Guides
- **Beginner Friendly** - Start with basics and progress to advanced tactics
- **Combat Mechanics** - Deep dives into game systems
- **VR-Specific Tips** - Optimize comfort and performance for VR play

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.7
- **Data**: Static JSON; MongoDB for accounts and reader submissions
- **Deployment**: Vercel

## 🏁 Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm (the committed lockfile is `package-lock.json`)
- Docker Desktop when working on authentication, submissions, admin features, or full validation

### Installation

1. Clone the repository

```bash
git clone https://github.com/zelengeo/exfil-zone-assistant.git
cd exfil-zone-assistant
```

2. Install dependencies

```bash
npm install
```

3. Create the local environment file. Fill in OAuth credentials only when you need to exercise the
   real Google or Discord sign-in flow.

```powershell
Copy-Item .env.example .env.local
```

4. Start the app with its local MongoDB replica set

```bash
npm run dev:local
```

`dev:local` starts MongoDB, creates the model indexes, verifies a real transaction, and overrides
only `MONGODB_URI` for the development process. Any Atlas URI in `.env.local` remains untouched.

5. To inspect the database, explicitly start the optional local admin UI

```bash
npm run db:ui
```

Open [http://localhost:8081](http://localhost:8081) and sign in with `local` / `exfilzone-local`.
Override `MONGO_EXPRESS_USERNAME` and `MONGO_EXPRESS_PASSWORD` in the shell if needed. Both MongoDB
and mongo-express bind only to `127.0.0.1`.

6. Open [http://localhost:3000](http://localhost:3000) in your browser

Run the full repeatable validation path against local MongoDB:

```bash
npm run verify:local
```

This prepares MongoDB, checks replica-set transactions, then runs lint, type checking, unit/data
tests, and the production build. It does not fake OAuth: signed-in browser flows still require a
localhost callback configured with Google or Discord. `npm run db:down` stops the stack without
deleting its volume.

### Building for Production

```bash
npm run build
npm start
```

## Coding agents

[`AGENTS.md`](AGENTS.md) is the canonical source of repository instructions. More specific
`AGENTS.md` files sit beside the routes and layers they govern. The `CLAUDE.md` files are one-line
compatibility imports, so Claude Code and agents that natively read `AGENTS.md` receive the same
guidance without maintaining two copies. Keep shared project rules in `AGENTS.md`; keep personal
agent settings outside the repository and tool-specific integrations in their adapter directory.

## 🗂️ Project Structure

```
exfil-zone-assistant/
├── src/
│   ├── app/               # Next.js App Router pages and route-owned code
│   ├── components/        # Components shared across routes
│   ├── content/           # Guide content
│   ├── lib/               # Request plumbing and pure game logic
│   ├── services/          # Data and persistence access
│   ├── models/            # Mongoose models
│   └── types/             # Shared TypeScript types
├── public/
│   ├── data/              # Validated game data served as JSON
│   └── images/            # Item and UI images
└── scripts/               # Validation and database utilities
```

## 🤝 Contributing

We love contributions! Whether it's fixing bugs, adding features, or improving documentation, your help makes this project better.

### How to Contribute

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure VR compatibility for UI changes
- Test on multiple screen sizes

### Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/zelengeo/exfil-zone-assistant/issues) with:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 🗺️ Roadmap

### Coming Soon
- 🎯 **Weapon Recoil Patterns** - Visual recoil analysis and control guides
- 🔧 **Attachment System** - Complete attachment database with hidden stats
- 💣 **Throwable Analysis** - Grenade damage ranges and effectiveness
- 📊 **Complete Item Database** - All consumables with hidden properties

### Future Plans (Community Driven)
- 📜 Quest Database & Walkthroughs
- 🏠 Hideout Calculator
- 🗺️ Interactive Maps
- 📱 Mobile App

See our [Development Roadmap](https://exfil-zone.vercel.app/guides/app-roadmap) for more details.

## 📊 Data Accuracy

Our combat simulator achieves ~95% accuracy when compared to in-game values under ideal conditions. Factors that may cause variance:
- Network latency and packet loss
- Server performance
- Game's RNG elements

For detailed accuracy testing, visit [/combat-sim/debug](https://exfil-zone.vercel.app/combat-sim/debug).

## 🎮 VR Optimization

This project is specifically optimized for VR browsers:
- Large, easy-to-click touch targets
- High contrast military-inspired design
- Minimal animations to prevent motion sickness
- Readable fonts at VR viewing distances

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Game data sourced from community testing and analysis
- UI inspired by military tactical interfaces
- Built with love for the VR gaming community

## 🌟 Support the Project

If you find this tool helpful:
- ⭐ **Star this repository** to help others find it
- 🐛 **Report bugs** to help us improve
- 💡 **Suggest features** to shape the roadmap
- 🤝 **Contribute code** to make it better

---

<div align="center">
  Made with ❤️ for VR Gamers

[Discord](https://discord.gg/2FCDZK6C25) • [X](https://x.com/pogapwnz) • [Website](https://exfil-zone-assistant.app)
</div>
