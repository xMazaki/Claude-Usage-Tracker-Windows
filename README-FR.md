<p align="center">
  <img src="assets/icon.ico" width="80" alt="Claude Usage Tracker" />
</p>

<h1 align="center">Claude Usage Tracker — Windows</h1>

<p align="center">
  Suivi en temps réel de votre utilisation de Claude AI depuis la barre des tâches Windows.
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
  <a href="README.md">🇬🇧 English version</a>
</p>

---

## Téléchargement

> **[Télécharger le dernier .exe portable](https://github.com/xMazaki/Claude-Usage-Tracker-Windows/releases/latest)** — aucune installation requise, lancez-le directement.

---

## Aperçu

**Claude Usage Tracker** se place dans la barre des tâches Windows et vous donne un aperçu rapide de votre utilisation de Claude AI — limites de session, plafonds hebdomadaires, usage supplémentaire et crédits API — le tout dans un popover sombre et élégant.

Inspiré de l'excellente version macOS : [Claude-Usage-Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker) par **hamed-elfayome**. Ce projet est une reconstruction complète pour Windows avec Electron.

---

## Fonctionnalités

- **Icône dans la barre des tâches** avec indicateur d'utilisation en temps réel (batterie, barre de progression, pourcentage, et plus)
- **Usage session** — fenêtre glissante de 5 heures
- **Usage hebdomadaire** — plafond sur 7 jours, tous modèles
- **Usage supplémentaire & crédits API**
- **Multi-profils** — basculez entre plusieurs comptes Claude
- **Notifications** à seuils configurables (75%, 90%, 95%)
- **Statut Claude** (opérationnel, dégradé, panne)
- **Thème sombre** inspiré de l'interface Claude
- **i18n** — Anglais & Français
- **Portable .exe** — aucune installation requise, fonctionne depuis n'importe où
- **Lancement au démarrage** via le Registre Windows

---

## Stack Technique

| Couche | Technologie |
|--------|------------|
| Framework | [Electron](https://www.electronjs.org/) 28 |
| Frontend | [React](https://react.dev/) 18 + TypeScript |
| Bundler | [Webpack](https://webpack.js.org/) 5 |
| Packaging | [electron-builder](https://www.electron.build/) (portable .exe) |
| Stockage | Fichier local chiffré AES-256-GCM |
| Démarrage auto | Registre Windows (`HKCU\...\Run`) |

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) 18+
- npm

### Installation & Lancement

```bash
git clone https://github.com/xMazaki/Claude-Usage-Tracker-Windows.git
cd Claude-Usage-Tracker-Windows
npm install
npm run dev
```

### Créer le .exe portable

```bash
npm run build
npx electron-builder --win portable
```

Le fichier sera dans `release/Claude-Usage-Tracker-1.0.0-Portable.exe`.

---

## Configuration

1. Lancez l'application — elle apparaît dans la barre des tâches
2. Ouvrez **claude.ai** dans votre navigateur
3. Ouvrez les DevTools (`F12`) → **Application** → **Cookies**
4. Copiez la valeur de `sessionKey`
5. Collez-la dans l'assistant de configuration ou Paramètres → Identifiants

---

## Structure du projet

```
src/
├── main/               # Processus principal Electron
│   ├── main.ts         # Point d'entrée
│   ├── tray.ts         # Barre des tâches & fenêtre popover
│   ├── ipc-handlers.ts # Pont IPC
│   └── services/       # API, stockage, profils, notifications, démarrage auto
├── preload/            # Context bridge
├── renderer/           # Interface React
│   ├── components/     # PopoverView, SettingsView, SetupWizard
│   ├── hooks/          # Hooks useAPI
│   ├── i18n/           # Traductions EN/FR
│   └── styles/         # CSS (thème sombre)
└── shared/             # Types TypeScript partagés
```

---

## Crédits

- Inspiré de [Claude-Usage-Tracker](https://github.com/hamed-elfayome/Claude-Usage-Tracker) (macOS) par **hamed-elfayome**
- Version Windows par [@mazaki_eth](https://x.com/mazaki_eth)

---

## Licence

[MIT](LICENSE)
