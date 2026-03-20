import type { View } from './types';

interface UrlParams {
  view: View;
  selectedNoteId: number | null;
  showInfoPanel: boolean;
  settingDefault: boolean;
}

export function buildUrl({
  view,
  selectedNoteId,
  showInfoPanel,
  settingDefault,
}: UrlParams): string {
  let path: string;
  if (view === 'settings') {
    path = '/settings';
  } else if (view === 'collections') {
    path = '/collections';
  } else if (view === 'keys') {
    path = '/keys';
  } else if (view === 'graph') {
    path = '/graph';
  } else if (selectedNoteId) {
    path = `/notes/${selectedNoteId}`;
  } else {
    path = '/';
  }
  const params = new URLSearchParams();
  if (showInfoPanel !== settingDefault) {
    params.set('info', showInfoPanel ? '1' : '0');
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function syncUrl(params: UrlParams) {
  const url = buildUrl(params);
  if (url !== window.location.pathname + window.location.search) {
    window.history.pushState(null, '', url);
  }
}

export function parseUrl(): {
  view: View;
  selectedNoteId: number | null;
  showInfoPanel: boolean | null;
} {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const showInfoPanel = params.has('info') ? params.get('info') !== '0' : null;

  if (path === '/settings') {
    return { view: 'settings', selectedNoteId: null, showInfoPanel };
  }

  if (path === '/collections') {
    return { view: 'collections', selectedNoteId: null, showInfoPanel };
  }

  if (path === '/keys') {
    return { view: 'keys', selectedNoteId: null, showInfoPanel };
  }

  if (path === '/graph') {
    return { view: 'graph', selectedNoteId: null, showInfoPanel };
  }

  const noteMatch = path.match(/^\/notes\/(.+)$/);
  if (noteMatch) {
    return {
      view: 'notes',
      selectedNoteId: Number(noteMatch[1]),
      showInfoPanel,
    };
  }

  return { view: 'notes', selectedNoteId: null, showInfoPanel };
}
