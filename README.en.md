<div align="center">

<img src="assets/icons/icon-512.png" width="120" alt="Zeus Launcher" />

# ⚡ Zeus Launcher

**A modern Minecraft launcher built with Electron and Node.js**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-32-9feaf9.svg)](https://www.electronjs.org/)
![Version](https://img.shields.io/badge/version-0.1.0-blueviolet)

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [中文](README.zh.md)

</div>

---

## About

Zeus Launcher is a desktop Minecraft launcher for managing Vanilla / Forge / Fabric instances, with mod search and installation straight from Modrinth. It supports Microsoft account sign-in, skin management, a fully localized UI, and Discord Rich Presence.

## ✨ Features

- 🔑 **Microsoft account sign-in** — manage multiple accounts, change skin from an image, or reset to the default
- 🧩 **Instance management** — create Vanilla / Forge / Fabric instances, with direct control over the mod loader version
- 📦 **Modrinth integration** — search and install mods right inside the app (installs are only allowed on Forge/Fabric instances)
- 🌐 **Multi-language UI** — Korean · English · Japanese · Chinese
- 🎨 **Custom UI components** — hand-built dropdowns and scrollbars instead of native browser controls, matching the app theme
- 🔔 **Toast notifications** — modern toasts for errors and successes
- 🕹️ **Discord Rich Presence** — shows which screen you're on (Home, Instances, Settings, …), and while playing, which mod loader and version you launched
- ⚙️ **Fine-grained settings** — language, font, auto-hide launcher after the game starts, memory (RAM), game window size, quick-open launcher folder
- 📜 **In-app changelog** — browse update history, localized to your selected language

## 📸 Screenshots

| Home | Instances |
| --- | --- |
| ![Home screen](assets/screenshots/01-home.png) | ![Instance management](assets/screenshots/02-instances.png) |

| Modrinth | Changelog |
| --- | --- |
| ![Modrinth](assets/screenshots/03-modrinth.png) | ![Changelog](assets/screenshots/04-changelog.png) |

| Settings |
| --- |
| ![Settings](assets/screenshots/05-settings.png) |

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Runtime | [Electron](https://www.electronjs.org/) 32, Node.js |
| Auth | [msmc](https://github.com/Hanro50/msmc) (Microsoft OAuth) |
| Game launching | [minecraft-launcher-core](https://github.com/Pierce01/MinecraftLauncherCore) |
| Persistence | [electron-store](https://github.com/sindresorhus/electron-store) |
| Auto-update | [electron-updater](https://www.electron.build/auto-update) |
| Discord integration | [@xhayper/discord-rpc](https://github.com/xhayper/discord-rpc) |
| Packaging | [electron-builder](https://www.electron.build/) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install

```bash
git clone <repository-url>
cd zeus-launcher
npm install
```

### Run in development mode

Opens with DevTools enabled.

```bash
npm run dev
```

### Run normally

```bash
npm start
```

### Build for distribution

```bash
# current platform
npm run build

# a specific platform
npm run build:win
npm run build:mac
npm run build:linux
```

Build output is written to the `dist/` folder.

## 📁 Project Structure

```
src/
├── main/                 # Electron main process
│   ├── config/           # settings store, path utilities
│   ├── ipc/               # renderer ↔ main IPC handlers
│   └── services/
│       ├── auth/          # Microsoft auth / account management
│       ├── discord/       # Discord Rich Presence
│       ├── minecraft/     # version lookup, instances, launcher, skins
│       ├── modloader/     # Forge / Fabric loader version lookup
│       ├── modpack/       # modpack installation
│       ├── modrinth/      # Modrinth search / mod install
│       └── update/        # auto-updater
├── renderer/              # UI (plain HTML/CSS/JS)
│   ├── components/        # custom select, custom scrollbar
│   ├── i18n/               # localization resources
│   └── styles/             # theme CSS
└── shared/                # constants shared between main and renderer (IPC channels, etc.)
```

## ⚙️ Configuring Discord Rich Presence

By default the app uses the `discordClientId` value in `src/main/config/store.js`. If you fork and redistribute this project, create your own application in the [Discord Developer Portal](https://discord.com/developers/applications) and replace it with your Application ID. To disable Rich Presence entirely, set `discordRpcEnabled` to `false` in the same file.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
