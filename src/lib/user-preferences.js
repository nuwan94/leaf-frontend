// User Preferences Manager - Centralized localStorage management
export class UserPreferences {
  // Default preferences
  static defaults = {
    language: 'en',
    darkMode: false,
    fontSize: 100,
    colorblindFilter: 'none',
    highContrast: false,
    reducedMotion: false,
  };

  // Get a preference value
  static get(key) {
    try {
      const value = localStorage.getItem(`user-${key}`);
      return value ? JSON.parse(value) : this.defaults[key];
    } catch {
      return this.defaults[key];
    }
  }

  // Set a preference value
  static set(key, value) {
    try {
      localStorage.setItem(`user-${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  // Get all preferences
  static getAll() {
    const prefs = {};
    Object.keys(this.defaults).forEach(key => {
      prefs[key] = this.get(key);
    });
    return prefs;
  }

  // Reset all preferences to defaults
  static resetAll() {
    Object.keys(this.defaults).forEach(key => {
      this.set(key, this.defaults[key]);
    });
  }

  // Export preferences (for backup/sharing)
  static export() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  // Import preferences (from backup)
  static import(jsonString) {
    try {
      const prefs = JSON.parse(jsonString);
      Object.keys(prefs).forEach(key => {
        if (key in this.defaults) {
          this.set(key, prefs[key]);
        }
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Preference keys for consistent naming
export const PREF_KEYS = {
  LANGUAGE: 'language',
  DARK_MODE: 'darkMode',
  FONT_SIZE: 'fontSize',
  COLORBLIND_FILTER: 'colorblindFilter',
  HIGH_CONTRAST: 'highContrast',
  REDUCED_MOTION: 'reducedMotion',
};
