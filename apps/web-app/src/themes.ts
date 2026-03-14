import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeId } from '@repo/types';

const baseOverrides = {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
        },
        '#root': {
          height: '100%',
        },
      },
    },
  },
} as const;

const defaultTheme = createTheme({
  ...baseOverrides,
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const darkTheme = createTheme({
  ...baseOverrides,
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const solarizedLightTheme = createTheme({
  ...baseOverrides,
  palette: {
    primary: { main: '#268bd2' },
    secondary: { main: '#d33682' },
    background: { default: '#fdf6e3', paper: '#eee8d5' },
    text: { primary: '#657b83', secondary: '#93a1a1' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const solarizedDarkTheme = createTheme({
  ...baseOverrides,
  palette: {
    mode: 'dark',
    primary: { main: '#268bd2' },
    secondary: { main: '#d33682' },
    background: { default: '#002b36', paper: '#073642' },
    text: { primary: '#839496', secondary: '#586e75' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const nordTheme = createTheme({
  ...baseOverrides,
  palette: {
    mode: 'dark',
    primary: { main: '#88c0d0' },
    secondary: { main: '#b48ead' },
    background: { default: '#2e3440', paper: '#3b4252' },
    text: { primary: '#eceff4', secondary: '#d8dee9' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const draculaTheme = createTheme({
  ...baseOverrides,
  palette: {
    mode: 'dark',
    primary: { main: '#bd93f9' },
    secondary: { main: '#ff79c6' },
    background: { default: '#282a36', paper: '#44475a' },
    text: { primary: '#f8f8f2', secondary: '#6272a4' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

const MONO_FONT = "'Roboto Mono', monospace";

const geekLightTheme = createTheme({
  ...baseOverrides,
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  typography: { fontFamily: MONO_FONT },
});

export const themes: Record<ThemeId, { label: string; theme: Theme }> = {
  default: { label: 'Default', theme: defaultTheme },
  dark: { label: 'Dark', theme: darkTheme },
  'solarized-light': { label: 'Solarized Light', theme: solarizedLightTheme },
  'solarized-dark': { label: 'Solarized Dark', theme: solarizedDarkTheme },
  nord: { label: 'Nord', theme: nordTheme },
  dracula: { label: 'Dracula', theme: draculaTheme },
  'geek-light': { label: 'Geek (Light)', theme: geekLightTheme },
};
