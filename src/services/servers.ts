import { SpeedTestServer } from '../types/speedtest';

const STORAGE_KEY_CUSTOM_SERVERS = 'speedtest_custom_servers';
const STORAGE_KEY_SELECTED_SERVER = 'speedtest_selected_server_id';

export const DEFAULT_SERVERS: SpeedTestServer[] = [
  {
    id: 'cloudflare-global',
    name: 'Cloudflare Edge CDN',
    location: 'Nearest Global Anycast Edge (300+ Cities)',
    provider: 'Cloudflare',
    pingUrl: 'https://speed.cloudflare.com/__down?bytes=0',
    downloadUrl: (bytes: number) => `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },
  {
    id: 'fastly-global',
    name: 'Fastly Multi-CDN Edge',
    location: 'Worldwide High-Speed CDN Edge',
    provider: 'Fastly',
    pingUrl: 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    downloadUrl: (bytes: number) => {
      // Use standard high-speed CDN assets for multi-megabyte chunks
      if (bytes <= 2000000) {
        return 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      }
      return 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
    },
    uploadUrl: 'https://speed.cloudflare.com/__up',
    isCustom: false,
  },
];

export function getCustomServers(): SpeedTestServer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SERVERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomServer(server: Omit<SpeedTestServer, 'downloadUrl'> & { downloadBaseUrl: string }): SpeedTestServer {
  const newServer: SpeedTestServer = {
    id: server.id || `custom-${Date.now()}`,
    name: server.name,
    location: server.location,
    provider: server.provider || 'Custom Dedicated Server',
    pingUrl: server.pingUrl,
    downloadUrl: (bytes: number) => {
      const url = new URL(server.downloadBaseUrl, window.location.href);
      url.searchParams.set('bytes', String(bytes));
      return url.toString();
    },
    uploadUrl: server.uploadUrl,
    isCustom: true,
  };

  const existing = getCustomServers();
  const filtered = existing.filter((s) => s.id !== newServer.id);
  const updated = [...filtered, newServer];

  localStorage.setItem(STORAGE_KEY_CUSTOM_SERVERS, JSON.stringify(updated.map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
    provider: s.provider,
    pingUrl: s.pingUrl,
    downloadBaseUrl: server.downloadBaseUrl,
    uploadUrl: s.uploadUrl,
    isCustom: true,
  }))));

  return newServer;
}

export function deleteCustomServer(id: string): void {
  const existing = getCustomServers();
  const updated = existing.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_SERVERS, JSON.stringify(updated));
}

export function getAllServers(): SpeedTestServer[] {
  const custom = getCustomServers().map((item: any) => ({
    ...item,
    downloadUrl: (bytes: number) => {
      try {
        const url = new URL(item.downloadBaseUrl || item.pingUrl, window.location.href);
        url.searchParams.set('bytes', String(bytes));
        return url.toString();
      } catch {
        return item.downloadBaseUrl || item.pingUrl;
      }
    },
  }));
  return [...DEFAULT_SERVERS, ...custom];
}

export function getSelectedServerId(): string {
  return localStorage.getItem(STORAGE_KEY_SELECTED_SERVER) || DEFAULT_SERVERS[0].id;
}

export function setSelectedServerId(id: string): void {
  localStorage.setItem(STORAGE_KEY_SELECTED_SERVER, id);
}

export function getActiveServer(): SpeedTestServer {
  const id = getSelectedServerId();
  const all = getAllServers();
  return all.find((s) => s.id === id) || DEFAULT_SERVERS[0];
}
