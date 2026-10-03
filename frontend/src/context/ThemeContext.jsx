import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const PALETTES = {
  violet: {
    id: 'violet',
    name: 'Soft Lavender & Violet',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    bgTint: '#f5f3ff',
    borderTint: '#ede9fe',
    badgeText: '#6d28d9',
    headerGradient: 'from-violet-900 via-purple-900 to-indigo-950',
    description: 'Modern, soothing clinical lavender with crisp violet accents'
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Hospital Indigo',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    bgTint: '#eef2ff',
    borderTint: '#e0e7ff',
    badgeText: '#4338ca',
    headerGradient: 'from-indigo-950 via-slate-900 to-blue-950',
    description: 'High-contrast executive indigo styling'
  },
  teal: {
    id: 'teal',
    name: 'Classic Clinical Teal',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    bgTint: '#f0fdfa',
    borderTint: '#ccfbf1',
    badgeText: '#0f766e',
    headerGradient: 'from-teal-900 via-emerald-950 to-slate-900',
    description: 'Traditional veterinary hospital emerald & teal'
  }
};

export const FONT_FAMILIES = {
  Inter: {
    id: 'Inter',
    name: 'Inter (Clinical Modern)',
    css: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  Poppins: {
    id: 'Poppins',
    name: 'Poppins (Soft & Friendly)',
    css: "'Poppins', 'Inter', -apple-system, sans-serif"
  },
  'Segoe UI': {
    id: 'Segoe UI',
    name: 'Segoe UI (Enterprise Clean)',
    css: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  'system-ui': {
    id: 'system-ui',
    name: 'System Default',
    css: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
  }
};

export const FONT_SIZES = {
  '13px': { id: '13px', label: 'Compact (13px)', size: '13px' },
  '14px': { id: '14px', label: 'Standard (14px)', size: '14px' },
  '16px': { id: '16px', label: 'Large (16px)', size: '16px' }
};

export const CUSTOMER_SCALES = [
  { scale: 0.85, label: 'A-', title: 'Compact text' },
  { scale: 1.0, label: 'A', title: 'Standard text' },
  { scale: 1.2, label: 'A+', title: 'Enlarged accessibility text' }
];

const SCALE_STORAGE_KEY = '4paw_customer_font_scale';
const BASE_ROOT_PX = 16;

const readSavedScale = () => {
  try {
    const saved = parseFloat(localStorage.getItem(SCALE_STORAGE_KEY));
    return CUSTOMER_SCALES.some((s) => s.scale === saved) ? saved : 1.0;
  } catch {
    return 1.0;
  }
};

/**
 * Tailwind typography/spacing is rem-based, so the only reliable way to scale
 * the whole UI is to change the root <html> font-size.
 */
const applyRootFontScale = (scale) => {
  const root = document.documentElement;
  root.style.setProperty('--customer-font-scale', scale.toString());
  root.style.fontSize = `${BASE_ROOT_PX * scale}px`;
};

export const ThemeProvider = ({ children }) => {
  const [themePalette, setThemePalette] = useState('violet');
  const [globalFont, setGlobalFont] = useState('Inter');
  const [globalFontSize, setGlobalFontSize] = useState('14px');
  const [customerFontScale, setCustomerFontScaleState] = useState(readSavedScale);
  // Scale only applies while a customer session is active (set by App based on role)
  const [isCustomerScaleActive, setCustomerScaleActive] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Apply CSS custom properties to document root
  const applyVariables = useCallback((paletteId, fontId, fontSizeVal) => {
    const palette = PALETTES[paletteId] || PALETTES.violet;
    const font = FONT_FAMILIES[fontId] || FONT_FAMILIES.Inter;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', palette.primary);
    root.style.setProperty('--primary-hover', palette.primaryHover);
    root.style.setProperty('--bg-tint', palette.bgTint);
    root.style.setProperty('--border-tint', palette.borderTint);
    root.style.setProperty('--font-family', font.css);
    root.style.setProperty('--global-font-size', fontSizeVal || '14px');

    // Update body styling
    document.body.style.fontFamily = font.css;
  }, []);

  // Keep root <html> font-size in sync with the customer scale (role-scoped)
  useEffect(() => {
    applyRootFontScale(isCustomerScaleActive ? customerFontScale : 1.0);
  }, [customerFontScale, isCustomerScaleActive]);

  // Fetch initial theme settings from MongoDB Atlas
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings/theme');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const { themePalette: p, globalFont: f, globalFontSize: s } = json.data;
            if (p && PALETTES[p]) setThemePalette(p);
            if (f && FONT_FAMILIES[f]) setGlobalFont(f);
            if (s && FONT_SIZES[s]) setGlobalFontSize(s);
            applyVariables(p || 'violet', f || 'Inter', s || '14px');
          }
        }
      } catch (err) {
        console.warn('[ThemeContext] Falling back to default soft violet theme:', err.message);
        applyVariables('violet', 'Inter', '14px');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [applyVariables]);

  // Admin: Update theme settings system-wide (Persists to MongoDB Atlas)
  const updateAdminTheme = async (newSettings) => {
    const token = localStorage.getItem('token');
    const updatedPalette = newSettings.themePalette || themePalette;
    const updatedFont = newSettings.globalFont || globalFont;
    const updatedSize = newSettings.globalFontSize || globalFontSize;

    // Optimistic UI update
    setThemePalette(updatedPalette);
    setGlobalFont(updatedFont);
    setGlobalFontSize(updatedSize);
    applyVariables(updatedPalette, updatedFont, updatedSize);

    try {
      const res = await fetch('http://localhost:5000/api/settings/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          themePalette: updatedPalette,
          globalFont: updatedFont,
          globalFontSize: updatedSize
        })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('[ThemeContext] Failed to persist theme to Atlas:', err);
      return { success: false, message: err.message };
    }
  };

  // Customer: Adjust personal accessibility font scale (Persists to localStorage only)
  const updateCustomerFontScale = useCallback((scale) => {
    const numScale = parseFloat(scale) || 1.0;
    setCustomerFontScaleState(numScale);
    try {
      localStorage.setItem(SCALE_STORAGE_KEY, numScale.toString());
    } catch (e) {
      console.warn('Could not save customer scale to localStorage', e);
    }
    // Apply immediately (don't wait for the effect) for instant feedback
    applyRootFontScale(numScale);
  }, []);

  const activePalette = PALETTES[themePalette] || PALETTES.violet;

  return (
    <ThemeContext.Provider
      value={{
        themePalette,
        activePalette,
        globalFont,
        globalFontSize,
        customerFontScale,
        isThemeModalOpen,
        setIsThemeModalOpen,
        updateAdminTheme,
        updateCustomerFontScale,
        setCustomerFontScale: updateCustomerFontScale, // backward-compatible alias
        isCustomerScaleActive,
        setCustomerScaleActive,
        isLoadingSettings,
        palettes: PALETTES,
        fonts: FONT_FAMILIES,
        fontSizes: FONT_SIZES,
        customerScales: CUSTOMER_SCALES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
