<p align="center">
  <img src="assets/icon.ico" width="80" alt="Claude Usage Tracker" />
</p>

<h1 align="center">Claude Usage Tracker — Windows</h1>

<p align="center">
  Real-time Claude AI usage monitoring from your Windows system tray.
</p>

<p align="center">
  <a href="https://x.com/mazaki_eth">
    <img src="https://img.shields.io/badge/Twitter-@mazaki__eth-1DA1F2?style=flat-square&logo=x&logoColor=white" alt="Twitter" />
  </a>
  <a href="https://ko-fi.com/mazaki/tip">
    <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi" />
  </a>
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="README-FR.md">🇫🇷 Version française</a>
</p>

---

## Download

> **[Download the latest portable .exe](https://github.com/xMazaki/Claude-Usage-Tracker-Windows/releases/latest)** — no installation required, just run it.

---

## Overview

**Claude Usage Tracker** sits in your Windows system tray and gives you a quick glance at your Claude AI usage — session limits, weekly caps, extra usage, and API credits — all in a clean dark-themed popover.

Inspired by the excellent macOS version: [Claude-Usage-Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker) by **hamed-elfayome**. This project is a full Windows rebuild using Electron.

---

## Features

- **System tray icon** with real-time usage indicator (battery, progress bar, percentage, and more styles)
- **Session usage** — 5-hour rolling window utilization
- **Weekly usage** — 7-day cap across all models
- **Extra usage & API credits** tracking
- **Multi-profile** support — switch between Claude accounts
- **Notifications** at configurable thresholds (75%, 90%, 95%)
- **Claude status** indicator (operational, degraded, outage)
- **Dark theme** inspired by Claude's UI
- **i18n** — English & French
- **Portable .exe** — no installation required, runs from anywhere
- **Launch at login** via Windows Registry

---

## Screenshots

| Popover | Settings |
|---------|----------|
| ![Popover](https://via.placeholder.com/360x580/2b2b2b/ececec?text=Popover+Preview) | ![Settings](https://via.placeholder.com/650x550/2b2b2b/ececec?text=Settings+Preview) |

> Replace the placeholder images above with actual screenshots of your app.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Electron](https://www.electronjs.org/) 28 |
| Frontend | [React](https://react.dev/) 18 + TypeScript |
| Bundler | [Webpack](https://webpack.js.org/) 5 |
| Packaging | [electron-builder](https://www.electron.build/) (portable .exe) |
| Storage | AES-256-GCM encrypted local file |
| Autostart | Windows Registry (`HKCU\...\Run`) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
git clone https://github.com/xMazaki/Claude-Usage-Tracker-Windows.git
cd Claude-Usage-Tracker-Windows
npm install
npm run dev
```

### Build Portable .exe

```bash
npm run build
npx electron-builder --win portable
```

The output will be in `release/Claude-Usage-Tracker-1.0.0-Portable.exe`.

---

## Setup

1. Launch the app — it appears in your system tray
2. Open **claude.ai** in your browser
3. Open DevTools (`F12`) → **Application** → **Cookies**
4. Copy the value of `sessionKey`
5. Paste it in the setup wizard or Settings → Credentials

---

## Project Structure

```
src/
├── main/               # Electron main process
│   ├── main.ts         # Entry point
│   ├── tray.ts         # System tray & popover window
│   ├── ipc-handlers.ts # IPC bridge
│   └── services/       # API, storage, profiles, notifications, autostart
├── preload/            # Context bridge
├── renderer/           # React UI
│   ├── components/     # PopoverView, SettingsView, SetupWizard
│   ├── hooks/          # useAPI hooks
│   ├── i18n/           # EN/FR translations
│   └── styles/         # CSS (dark theme)
└── shared/             # Shared TypeScript types
```

---

## Credits

- Inspired by [Claude-Usage-Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker) (macOS) by **hamed-elfayome**
- Windows version by [@mazaki_eth](https://x.com/mazaki_eth)

---

## License

[MIT](LICENSE)
