// src/contexts/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Function to get initial settings from localStorage or return default settings
  const getInitialSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return {
          codeFontSize: '1rem', // Default font size
          ...parsedSettings // Override with saved settings if they exist
        };
      }
    } catch (error) {
      console.error('Error parsing saved settings:', error);
    }
    
    // If no settings are found, return default settings
    return {
      codeFontSize: '1rem',
    };
  };

  const [settings, setSettings] = useState(getInitialSettings);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings({
      codeFontSize: '1rem',
    });
    localStorage.removeItem('appSettings');
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};