import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "../utilities/UserSettings";
import { UserSettingsService } from "../services/UserSettingsService";

/**
 * UserSettingsContext - Provides user settings to all components
 */
const UserSettingsContext = createContext(null);

/**
 * UserSettingsProvider - Wraps the app to provide UserSettings via context
 * Loads settings from backend on mount
 */
export function UserSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await UserSettingsService.loadSettings();
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err);
      // Still provide defaults even if loading fails
      setSettings(new UserSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      if (!settings) throw new Error("No settings to save");
      await UserSettingsService.saveSettings(settings);
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err);
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      if (!settings) throw new Error("No settings to reset");
      await UserSettingsService.resetSettingsToDefaults(settings);
      setSettings(new UserSettings());
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to reset settings:", err);
      setError(err);
      return false;
    }
  };

  const value = {
    settings,
    isLoading,
    error,
    saveSettings,
    resetToDefaults,
    reloadSettings: loadSettings,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

/**
 * useUserSettings - Hook to access user settings in any component
 * @returns {Object} { settings, isLoading, error, saveSettings, resetToDefaults, reloadSettings }
 */
export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider"
    );
  }
  return context;
}
