import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DarkModeSwitcher({ accent = false }) {
  const [dark, setDark] = useState(() => {
    // Check localStorage first, then default to light mode (false)
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('dark-mode', JSON.stringify(dark));
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
