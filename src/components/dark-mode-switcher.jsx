import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DarkModeSwitcher({ accent = false }) {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button
      type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        `p-2 rounded focus:outline-none focus:ring hover:bg-muted` +
        (accent ? ' text-primary' : '')
      }
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Moon size={20} className={accent ? 'text-primary' : ''} /> : <Sun size={20} className={accent ? 'text-primary' : ''} />}
    </button>
  );
}
