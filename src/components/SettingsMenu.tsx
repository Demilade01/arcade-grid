import React, { useState } from 'react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: GameSettings) => void;
  currentSettings: GameSettings;
}

export interface GameSettings {
  speed: number;
  gridSize: number;
  theme: 'dark' | 'neon' | 'retro';
  showGrid: boolean;
  soundEnabled: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [settings, setSettings] = useState<GameSettings>(currentSettings);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Game Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Speed Setting */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Game Speed: {settings.speed}x
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={settings.speed}
              onChange={(e) => handleSettingChange('speed', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Grid Size Setting */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Grid Size: {settings.gridSize}px
            </label>
            <input
              type="range"
              min="15"
              max="30"
              value={settings.gridSize}
              onChange={(e) => handleSettingChange('gridSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'neon', 'retro'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleSettingChange('theme', theme)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.theme === theme
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-white text-sm capitalize">{theme}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">
                Show Grid Lines
              </label>
              <button
                onClick={() => handleSettingChange('showGrid', !settings.showGrid)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.showGrid ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showGrid ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">
                Sound Effects
              </label>
              <button
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                const defaultSettings: GameSettings = {
                  speed: 1,
                  gridSize: 20,
                  theme: 'dark',
                  showGrid: true,
                  soundEnabled: false
                };
                setSettings(defaultSettings);
                onSettingsChange(defaultSettings);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
