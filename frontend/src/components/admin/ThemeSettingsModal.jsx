import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Maximize2,
  Check,
  Save,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useTheme, PALETTES, FONT_FAMILIES, FONT_SIZES } from '../../context/ThemeContext';

const ThemeSettingsModal = ({ isOpen, onClose, onShowToast }) => {
  const {
    themePalette,
    globalFont,
    globalFontSize,
    updateAdminTheme
  } = useTheme();

  const [selectedPalette, setSelectedPalette] = useState(themePalette);
  const [selectedFont, setSelectedFont] = useState(globalFont);
  const [selectedFontSize, setSelectedFontSize] = useState(globalFontSize);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPalette(themePalette);
      setSelectedFont(globalFont);
      setSelectedFontSize(globalFontSize);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, themePalette, globalFont, globalFontSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateAdminTheme({
        themePalette: selectedPalette,
        globalFont: selectedFont,
        globalFontSize: selectedFontSize
      });
      if (onShowToast) {
        onShowToast('System branding & theme successfully updated across MongoDB Atlas!');
      }
      onClose();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to update theme: ' + err.message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const previewPalette = PALETTES[selectedPalette] || PALETTES.violet;
  const previewFont = FONT_FAMILIES[selectedFont] || FONT_FAMILIES.Inter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-violet-200/80 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-800/60 border border-violet-400/40 text-violet-200 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
              Admin System Configuration
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Theme & Branding Settings
            </h2>
            <p className="text-xs text-violet-200/90 max-w-xl">
              Configure the clinical theme, accent colors, and global typography persisted system-wide to MongoDB Atlas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform duration-200 hover:rotate-90 cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* 1. Theme Accent Palette */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Theme Accent Palette</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(PALETTES).map((pal) => {
                const isSelected = selectedPalette === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setSelectedPalette(pal.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative ${
                      isSelected
                        ? 'border-violet-600 dark:border-violet-400 bg-violet-50/70 dark:bg-violet-950/40 ring-2 ring-violet-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: pal.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: pal.primaryHover }}
                        />
                      </div>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-violet-600 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pal.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{pal.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Global Font Family */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Global Typography / Font Family</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(FONT_FAMILIES).map((f) => {
                const isSelected = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFont(f.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-bold ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                    style={{ fontFamily: f.css }}
                  >
                    <p className="text-xs">{f.id}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Aa Bb Gg</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Global Base Font Size */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Global Base Font Size</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(FONT_SIZES).map((fsItem) => {
                const isSelected = selectedFontSize === fsItem.id;
                return (
                  <button
                    key={fsItem.id}
                    type="button"
                    onClick={() => setSelectedFontSize(fsItem.id)}
                    className={`p-3 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-bold ring-2 ring-violet-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs">{fsItem.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Real-Time Style Preview</span>
              <span className="font-mono text-[10px] text-violet-600 dark:text-violet-400">Live Feedback</span>
            </div>
            <div
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
              style={{ fontFamily: previewFont.css, fontSize: selectedFontSize }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">🐾 4 Paw Animal Clinic Demo</span>
                <span
                  className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                  style={{ backgroundColor: previewPalette.primary }}
                >
                  System Theme
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Sample preview showcasing chosen typography ({previewFont.name}) and primary color ({previewPalette.primary}).
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs cursor-default"
                  style={{ backgroundColor: previewPalette.primary }}
                >
                  Primary Action
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-default"
                  style={{ borderColor: previewPalette.borderTint, color: previewPalette.primary, backgroundColor: previewPalette.bgTint }}
                >
                  Secondary Tint
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changes persist to MongoDB Atlas and apply to all clinic terminals.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Atlas...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save System Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSettingsModal;
