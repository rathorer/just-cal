import { invoke } from "@tauri-apps/api/core";
import { UserSettings } from "../utilities/UserSettings";

/**
 * UserSettingsService - Handles persistence of user settings to backend
 * Uses Tauri's invoke command to communicate with Rust backend
 */
export class UserSettingsService {
  /**
   * Load user settings from backend
   * Falls back to defaults if nothing is saved yet
   * @returns {Promise<UserSettings>}
   */
  static async loadSettings() {
    try {
      const data = '{"keepDefaultReminder": "true", defaultRemindTime":{"hour":10,"minute":0,"isApprox":false},"debounceDuration":2000,"smallScreenWidth":300,"mediumScreenWidth":700,"maxCharsForTitle":80,"leftSectionDefaultWidth":80,"leftSectionMinWidth":50,"leftSectionMaxWidth":90,"undoDurationMs":20000,"reminderTimePrecision":15,"timeFormat":"short","timeSelecterRangeH":5,"myDayStartH":7,"notifyMinutesBeforeEvent":15}';
      const settings = await invoke("get_user_settings");

      return UserSettings.fromJSON(settings);
    } catch (error) {
      console.warn(
        "Failed to load user settings from backend, using defaults:",
        error
      );
      return new UserSettings();
    }
  }

  /**
   * Save user settings to backend
   * @param {UserSettings} settings - The settings instance to save
   * @returns {Promise<void>}
   */
  static async saveSettings(settings) {
    try {
      if (!(settings instanceof UserSettings)) {
        throw new Error("Invalid settings object. Must be UserSettings instance.");
      }
      await invoke("save_user_settings", { settings: settings.toJSON() });
      console.log("User settings saved successfully");
    } catch (error) {
      console.error("Failed to save user settings:", error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults and save to backend
   * @param {UserSettings} settings - The settings instance to reset
   * @returns {Promise<void>}
   */
  static async resetSettingsToDefaults(settings) {
    try {
      if (!(settings instanceof UserSettings)) {
        throw new Error("Invalid settings object. Must be UserSettings instance.");
      }
      settings.resetToDefaults();
      await this.saveSettings(settings);
      console.log("User settings reset to defaults and saved");
    } catch (error) {
      console.error("Failed to reset user settings:", error);
      throw error;
    }
  }

  /**
   * Delete all saved user settings from backend (resets to defaults)
   * @returns {Promise<void>}
   */
  // static async deleteSettings() {
  //   try {
  //     await invoke("delete_user_settings");
  //     console.log("User settings deleted");
  //   } catch (error) {
  //     console.error("Failed to delete user settings:", error);
  //     throw error;
  //   }
  // }
}
