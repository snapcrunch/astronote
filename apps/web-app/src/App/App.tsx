import 'intro.js/introjs.css';
import LoadingView from '../LoadingView';
import LoginView from '../LoginView';
import { useNoteStore } from '../store';
import { useExternalLinkHandler } from './App.hooks';
import MainApp from './MainApp';

function App() {
  const route = useNoteStore((s) => s.route);
  useExternalLinkHandler();

  if (route === 'loading') return <LoadingView />;
  if (route === 'login') return <LoginView />;
  return <MainApp />;
}

export default App;
