import { Tray, nativeImage, BrowserWindow, screen, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { getActiveProfile, getProfiles, getSettings } from './services/profiles';
import { ClaudeUsage, IconStyle, Profile } from '../shared/types';

let tray: Tray | null = null;
let popoverWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const POPOVER_WIDTH = 360;
const POPOVER_HEIGHT = 580;
const SETTINGS_WIDTH = 650;
const SETTINGS_HEIGHT = 550;

export function createTray(): Tray {
  const icon = createTrayIcon(0, 'battery', false, true);
  tray = new Tray(icon);
  tray.setToolTip('Claude Usage Tracker');

  tray.on('click', (_event, bounds) => {
    togglePopover(bounds);
  });

  tray.on('right-click', () => {
    const menu = Menu.buildFromTemplate([
      { label: 'Settings', click: () => openSettings() },
      { type: 'separator' },
      { label: 'Quit', click: () => { const { app } = require('electron'); app.quit(); } },
    ]);
    tray?.popUpContextMenu(menu);
  });

  // IPC to minimize/show popover from renderer
  ipcMain.handle('minimize-popover', () => {
    if (popoverWindow && !popoverWindow.isDestroyed()) {
      popoverWindow.hide();
    }
  });

  ipcMain.handle('show-popover', () => {
    if (popoverWindow && !popoverWindow.isDestroyed()) {
      popoverWindow.show();
    }
  });

  return tray;
}

export function updateTrayIcon(usage: number, style: IconStyle, monochrome: boolean, showRemaining: boolean): void {
  if (!tray) return;
  const safeUsage = isNaN(usage) ? 0 : usage;
  const icon = createTrayIcon(safeUsage, style, monochrome, showRemaining);
  tray.setImage(icon);

  const displayVal = showRemaining ? Math.max(0, 100 - safeUsage) : safeUsage;
  tray.setToolTip(`Claude Usage: ${displayVal}%${showRemaining ? ' remaining' : ' used'}`);
}

function createTrayIcon(usage: number, style: IconStyle, monochrome: boolean, showRemaining: boolean): Electron.NativeImage {
  const size = 16;
  const canvas = createIconCanvas(size, usage, style, monochrome, showRemaining);
  return nativeImage.createFromBuffer(canvas, { width: size, height: size, scaleFactor: 1 });
}

function getIconColor(usage: number, monochrome: boolean): [number, number, number] {
  if (monochrome) return [255, 255, 255];
  if (usage < 50) return [217, 143, 64];   // Claude orange
  if (usage < 75) return [255, 152, 0];    // amber
  if (usage < 90) return [255, 87, 34];    // deep orange
  return [244, 67, 54];                     // red
}

function setPixel(pixels: Buffer, w: number, x: number, y: number, r: number, g: number, b: number, a: number) {
  if (x < 0 || x >= w || y < 0 || y >= w) return;
  const idx = (y * w + x) * 4;
  pixels[idx] = r; pixels[idx + 1] = g; pixels[idx + 2] = b; pixels[idx + 3] = a;
}

function createIconCanvas(size: number, usage: number, style: IconStyle, monochrome: boolean, showRemaining: boolean): Buffer {
  const fraction = Math.min(1, Math.max(0, usage / 100));
  const [r, g, b] = getIconColor(usage, monochrome);
  const w = size;
  const pixels = Buffer.alloc(w * w * 4, 0);

  switch (style) {
    case 'battery': {
      // Battery shape: body 0..12 x 3..12, tip 13..14 x 5..10
      for (let y = 3; y <= 12; y++) {
        for (let x = 0; x <= 12; x++) {
          if (y === 3 || y === 12 || x === 0 || x === 12) {
            setPixel(pixels, w, x, y, r, g, b, 200);
          }
        }
      }
      // Battery tip
      for (let y = 5; y <= 10; y++) {
        setPixel(pixels, w, 13, y, r, g, b, 180);
        setPixel(pixels, w, 14, y, r, g, b, 180);
      }
      // Fill level inside body
      const fillW = Math.round(fraction * 10);
      for (let y = 5; y <= 10; y++) {
        for (let x = 2; x < 2 + fillW; x++) {
          setPixel(pixels, w, x, y, r, g, b, 255);
        }
      }
      break;
    }

    case 'progressBar': {
      // Horizontal bar centered vertically
      const barY1 = 5, barY2 = 10;
      // Track (dim outline)
      for (let y = barY1; y <= barY2; y++) {
        for (let x = 0; x < w; x++) {
          if (y === barY1 || y === barY2 || x === 0 || x === w - 1) {
            setPixel(pixels, w, x, y, r, g, b, 80);
          }
        }
      }
      // Fill
      const fillW = Math.round(fraction * (w - 2));
      for (let y = barY1 + 1; y < barY2; y++) {
        for (let x = 1; x < 1 + fillW; x++) {
          setPixel(pixels, w, x, y, r, g, b, 255);
        }
      }
      break;
    }

    case 'percentage': {
      // Draw a simple filled circle whose size represents usage
      const cx = 7.5, cy = 7.5;
      const maxR = 7;
      const fillR = Math.max(2, fraction * maxR);
      for (let y = 0; y < w; y++) {
        for (let x = 0; x < w; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          // Outer ring
          if (dist <= maxR && dist > maxR - 1.2) {
            setPixel(pixels, w, x, y, r, g, b, 120);
          }
          // Filled portion
          if (dist <= fillR) {
            setPixel(pixels, w, x, y, r, g, b, 255);
          }
        }
      }
      break;
    }

    case 'iconWithBar': {
      // Top: small "C" dot, Bottom: progress bar
      // Dot centered at (7,4) radius 3
      const cx = 7, cy = 4, rad = 3;
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < w; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist <= rad && dist > rad - 1.5) {
            setPixel(pixels, w, x, y, r, g, b, 200);
          }
        }
      }
      // Center dot
      setPixel(pixels, w, cx, cy, r, g, b, 255);
      // Bar at bottom y=11..14
      for (let x = 1; x < w - 1; x++) {
        setPixel(pixels, w, x, 11, r, g, b, 60);
        setPixel(pixels, w, x, 12, r, g, b, 60);
        setPixel(pixels, w, x, 13, r, g, b, 60);
      }
      const fillW = Math.round(fraction * (w - 2));
      for (let x = 1; x < 1 + fillW; x++) {
        setPixel(pixels, w, x, 11, r, g, b, 255);
        setPixel(pixels, w, x, 12, r, g, b, 255);
        setPixel(pixels, w, x, 13, r, g, b, 255);
      }
      break;
    }

    case 'compact': {
      // Simple filled circle, color indicates status
      const cx = 7.5, cy = 7.5, rad = 5;
      for (let y = 0; y < w; y++) {
        for (let x = 0; x < w; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist <= rad) {
            setPixel(pixels, w, x, y, r, g, b, 255);
          }
        }
      }
      break;
    }

    default: {
      // Fallback: simple square outline with fill
      const fillW = Math.round(fraction * (w - 2));
      for (let y = 0; y < w; y++) {
        for (let x = 0; x < w; x++) {
          if (x === 0 || x === w - 1 || y === 0 || y === w - 1) {
            setPixel(pixels, w, x, y, r, g, b, 200);
          } else if (y >= 3 && y <= w - 4 && x >= 2 && x < 2 + fillW) {
            setPixel(pixels, w, x, y, r, g, b, 255);
          }
        }
      }
    }
  }

  return encodePNG(w, w, pixels);
}

function encodePNG(width: number, height: number, rgba: Buffer): Buffer {
  const zlib = require('zlib');
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    rgba.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);
  const chunks: Buffer[] = [signature];

  function writeChunk(type: string, data: Buffer) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const combined = Buffer.concat([typeBuffer, data]);
    const crc = crc32(combined);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc >>> 0, 0);
    chunks.push(len, typeBuffer, data, crcBuf);
  }

  writeChunk('IHDR', ihdr);
  writeChunk('IDAT', compressed);
  writeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat(chunks);
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return ~crc;
}

function togglePopover(bounds: Electron.Rectangle): void {
  if (popoverWindow && !popoverWindow.isDestroyed()) {
    if (popoverWindow.isVisible()) {
      popoverWindow.hide();
      return;
    }
    positionPopover(popoverWindow, bounds);
    popoverWindow.show();
    popoverWindow.focus();
    return;
  }
  showPopover(bounds);
}

function showPopover(bounds: Electron.Rectangle): void {
  popoverWindow = new BrowserWindow({
    width: POPOVER_WIDTH,
    height: POPOVER_HEIGHT,
    show: false,
    frame: false,
    resizable: true,
    minWidth: 320,
    minHeight: 400,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#2b2b2b',
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  popoverWindow.setMenuBarVisibility(false);
  popoverWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));

  popoverWindow.once('ready-to-show', () => {
    positionPopover(popoverWindow!, bounds);
    popoverWindow!.show();
    popoverWindow!.focus();
  });

  // No blur-to-hide: popup stays until user clicks minimize or tray icon
}

function positionPopover(win: BrowserWindow, trayBounds: Electron.Rectangle): void {
  const display = screen.getDisplayMatching(trayBounds);
  const workArea = display.workArea;

  let x = Math.round(trayBounds.x + trayBounds.width / 2 - POPOVER_WIDTH / 2);
  let y: number;

  if (trayBounds.y < workArea.y + workArea.height / 2) {
    y = trayBounds.y + trayBounds.height + 4;
  } else {
    y = trayBounds.y - POPOVER_HEIGHT - 4;
  }

  x = Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - POPOVER_WIDTH));
  y = Math.max(workArea.y, Math.min(y, workArea.y + workArea.height - POPOVER_HEIGHT));
  win.setPosition(x, y);
}

export function openSettings(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    show: false,
    frame: true,
    resizable: true,
    title: 'Claude Usage Tracker - Settings',
    backgroundColor: '#2b2b2b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'), {
    hash: 'settings',
  });

  settingsWindow.once('ready-to-show', () => {
    settingsWindow!.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

export function getPopoverWindow(): BrowserWindow | null {
  return popoverWindow && !popoverWindow.isDestroyed() ? popoverWindow : null;
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow : null;
}

export function getTray(): Tray | null {
  return tray;
}
