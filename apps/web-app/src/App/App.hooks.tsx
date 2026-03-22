import { useEffect } from 'react';
import introJs from 'intro.js';
import { useNoteStore } from '../store';

export function useIntroTour(isMobile: boolean) {
  const introDismissed = useNoteStore((s) => s.settings.intro_dismissed);
  const updateSettings = useNoteStore((s) => s.updateSettings);

  useEffect(() => {
    if (introDismissed) return;
    const timer = setTimeout(() => {
      const dismiss = () => updateSettings({ intro_dismissed: true });
      introJs()
        .setOptions({
          steps: [
            {
              element: '#omnibar-planet-icon',
              intro: isMobile
                ? 'Tap the planet icon to open the command palette.'
                : 'Click the planet icon to open the command palette.',
            },
            {
              element: '#first-tag',
              intro: isMobile
                ? 'Tap a tag to filter notes by that tag. Hold Option and tap to select multiple tags at once.'
                : 'Click a tag to filter notes by that tag. Hold Option and click to select multiple tags at once.',
            },
          ],
          showBullets: true,
          showStepNumbers: false,
          exitOnOverlayClick: true,
        })
        .oncomplete(dismiss)
        .onexit(dismiss)
        .start();
    }, 500);
    return () => clearTimeout(timer);
  }, [introDismissed, updateSettings, isMobile]);
}

export function useExternalLinkHandler() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      } catch {
        // not a valid URL, let browser handle it
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
