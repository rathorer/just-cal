import { ExtractedTime } from "./entities";

/**
 * UserSettings class - Manages user-configurable settings
 * Each setting has validation and logging for invalid values
 */
export class UserSettings {
  #_keepDefaultReminder;
  #_defaultRemindTime;
  #_debounceDuration; // milliseconds
  #_smallScreenWidth; // pixels
  #_mediumScreenWidth; // pixels
  #_maxCharsForTitle;
  #_leftSectionDefaultWidth; // %
  #_leftSectionMinWidth; // %
  #_leftSectionMaxWidth; // %
  #_undoDurationMs; // milliseconds
  #_reminderTimePrecision; // minutes
  #_timeFormat; // "full", "long", "medium", "short"
  #_timeSelecterRangeH; // hours
  #_myDayStartH; // hours (0-23)
  #_notifyMinutesBeforeEvent; // minutes

  constructor() {
    // Initialize with defaults
    this.#_keepDefaultReminder = true;
    this.#_defaultRemindTime = new ExtractedTime(10, 0, false);
    this.#_debounceDuration = 2000; // milliseconds
    this.#_smallScreenWidth = 300; // pixels
    this.#_mediumScreenWidth = 700; // pixels
    this.#_maxCharsForTitle = 80;
    this.#_leftSectionDefaultWidth = 80; // %
    this.#_leftSectionMinWidth = 50; // %
    this.#_leftSectionMaxWidth = 90; // %
    this.#_undoDurationMs = 20000; // milliseconds
    this.#_reminderTimePrecision = 15; // minutes
    this.#_timeFormat = "short"; // "full", "long", "medium", "short"
    this.#_timeSelecterRangeH = 5; // hours
    this.#_myDayStartH = 7; // hours (0-23)
    this.#_notifyMinutesBeforeEvent = 15; // minutes

    // Store defaults for reset functionality
    this._defaults = this._captureDefaults();
  }

  _captureDefaults() {
    return {
      keepDefaultReminder: true,
      defaultRemindTime: new ExtractedTime(
        this.#_defaultRemindTime.hour,
        this.#_defaultRemindTime.minute,
        this.#_defaultRemindTime.isApprox
      ),
      debounceDuration: this.#_debounceDuration,
      smallScreenWidth: this.#_smallScreenWidth,
      mediumScreenWidth: this.#_mediumScreenWidth,
      maxCharsForTitle: this.#_maxCharsForTitle,
      leftSectionDefaultWidth: this.#_leftSectionDefaultWidth,
      leftSectionMinWidth: this.#_leftSectionMinWidth,
      leftSectionMaxWidth: this.#_leftSectionMaxWidth,
      undoDurationMs: this.#_undoDurationMs,
      reminderTimePrecision: this.#_reminderTimePrecision,
      timeFormat: this.#_timeFormat,
      timeSelecterRangeH: this.#_timeSelecterRangeH,
      myDayStartH: this.#_myDayStartH,
      notifyMinutesBeforeEvent: this.#_notifyMinutesBeforeEvent,
    };
  }

  get keepDefaultReminder(){
    return this.#_keepDefaultReminder;
  }
  // Getters
  get defaultRemindTime() {
    return this.#_defaultRemindTime;
  }

  get debounceDuration() {
    return this.#_debounceDuration;
  }

  get smallScreenWidth() {
    return this.#_smallScreenWidth;
  }

  get mediumScreenWidth() {
    return this.#_mediumScreenWidth;
  }

  get maxCharsForTitle() {
    return this.#_maxCharsForTitle;
  }

  get leftSectionDefaultWidth() {
    return this.#_leftSectionDefaultWidth;
  }

  get leftSectionMinWidth() {
    return this.#_leftSectionMinWidth;
  }

  get leftSectionMaxWidth() {
    return this.#_leftSectionMaxWidth;
  }

  get undoDurationMs() {
    return this.#_undoDurationMs;
  }

  get reminderTimePrecision() {
    return this.#_reminderTimePrecision;
  }

  get timeFormat() {
    return this.#_timeFormat;
  }

  get timeSelecterRangeH() {
    return this.#_timeSelecterRangeH;
  }

  get myDayStartH() {
    return this.#_myDayStartH;
  }

  get notifyMinutesBeforeEvent() {
    return this.#_notifyMinutesBeforeEvent;
  }

  // Setters with validation

  setKeepDefaultReminder(keep){
    this.#_keepDefaultReminder = keep;
    return true;
  }
  setDefaultRemindTime(hour, minute, isApprox = false) {
    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      console.warn(
        `Invalid default remind time: ${hour}:${minute}. Keeping previous value.`
      );
      return false;
    }
    this.#_defaultRemindTime = new ExtractedTime(hour, minute, isApprox);
    return true;
  }

  setDebounceDuration(value) {
    if (!Number.isInteger(value) || value < 100) {
      console.warn(
        `Invalid debounce duration: ${value}. Must be >= 100ms. Keeping previous value.`
      );
      return false;
    }
    this.#_debounceDuration = value;
    return true;
  }

  setSmallScreenWidth(value) {
    if (!Number.isInteger(value) || value <= 0) {
      console.warn(
        `Invalid small screen width: ${value}. Must be > 0. Keeping previous value.`
      );
      return false;
    }
    this.#_smallScreenWidth = value;
    return true;
  }

  setMediumScreenWidth(value) {
    if (!Number.isInteger(value) || value <= this.#_smallScreenWidth) {
      console.warn(
        `Invalid medium screen width: ${value}. Must be > small screen width (${this.#_smallScreenWidth}). Keeping previous value.`
      );
      return false;
    }
    this.#_mediumScreenWidth = value;
    return true;
  }

  setMaxCharsForTitle(value) {
    if (!Number.isInteger(value) || value <= 0) {
      console.warn(
        `Invalid max chars for title: ${value}. Must be > 0. Keeping previous value.`
      );
      return false;
    }
    this.#_maxCharsForTitle = value;
    return true;
  }

  setLeftSectionDefaultWidth(value) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      console.warn(
        `Invalid left section default width: ${value}. Must be 0-100. Keeping previous value.`
      );
      return false;
    }
    if (value < this.#_leftSectionMinWidth || value > this.#_leftSectionMaxWidth) {
      console.warn(
        `Left section default width ${value} is outside min-max range (${this.#_leftSectionMinWidth}-${this.#_leftSectionMaxWidth}). Keeping previous value.`
      );
      return false;
    }
    this.#_leftSectionDefaultWidth = value;
    return true;
  }

  setLeftSectionMinWidth(value) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      console.warn(
        `Invalid left section min width: ${value}. Must be 0-100. Keeping previous value.`
      );
      return false;
    }
    if (value > this.#_leftSectionMaxWidth) {
      console.warn(
        `Left section min width cannot be > max width (${this.#_leftSectionMaxWidth}). Keeping previous value.`
      );
      return false;
    }
    this.#_leftSectionMinWidth = value;
    return true;
  }

  setLeftSectionMaxWidth(value) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      console.warn(
        `Invalid left section max width: ${value}. Must be 0-100. Keeping previous value.`
      );
      return false;
    }
    if (value < this.#_leftSectionMinWidth) {
      console.warn(
        `Left section max width cannot be < min width (${this.#_leftSectionMinWidth}). Keeping previous value.`
      );
      return false;
    }
    this.#_leftSectionMaxWidth = value;
    return true;
  }

  setUndoDurationMs(value) {
    if (!Number.isInteger(value) || value < 1000) {
      console.warn(
        `Invalid undo duration: ${value}. Must be >= 1000ms. Keeping previous value.`
      );
      return false;
    }
    this.#_undoDurationMs = value;
    return true;
  }

  setReminderTimePrecision(value) {
    if (!Number.isInteger(value) || value <= 0) {
      console.warn(
        `Invalid reminder time precision: ${value}. Must be > 0. Keeping previous value.`
      );
      return false;
    }
    this.#_reminderTimePrecision = value;
    return true;
  }

  setTimeFormat(value) {
    const validFormats = ["full", "long", "medium", "short"];
    if (!validFormats.includes(value)) {
      console.warn(
        `Invalid time format: ${value}. Must be one of: ${validFormats.join(", ")}. Keeping previous value.`
      );
      return false;
    }
    this.#_timeFormat = value;
    return true;
  }

  setTimeSelecterRangeH(value) {
    if (!Number.isInteger(value) || value <= 0 || value > 12) {
      console.warn(
        `Invalid time selecter range: ${value}. Must be 1-12 hours. Keeping previous value.`
      );
      return false;
    }
    this.#_timeSelecterRangeH = value;
    return true;
  }

  setMyDayStartH(value) {
    if (!Number.isInteger(value) || value < 0 || value > 23) {
      console.warn(
        `Invalid my day start hour: ${value}. Must be 0-23. Keeping previous value.`
      );
      return false;
    }
    this.#_myDayStartH = value;
    return true;
  }

  setNotifyMinutesBeforeEvent(value) {
    if (!Number.isInteger(value) || value <= 0) {
      console.warn(
        `Invalid notify minutes before event: ${value}. Must be > 0. Keeping previous value.`
      );
      return false;
    }
    this.#_notifyMinutesBeforeEvent = value;
    return true;
  }

  /**
   * Convert UserSettings to JSON for backend storage
   */
  toJSON() {
    return {
      keepDefaultReminder: this._keepDefaultReminder,
      defaultRemindTime: {
        hour: this.#_defaultRemindTime.hour,
        minute: this.#_defaultRemindTime.minute,
        isApprox: this.#_defaultRemindTime.isApprox,
      },
      debounceDuration: this.#_debounceDuration,
      smallScreenWidth: this.#_smallScreenWidth,
      mediumScreenWidth: this.#_mediumScreenWidth,
      maxCharsForTitle: this.#_maxCharsForTitle,
      leftSectionDefaultWidth: this.#_leftSectionDefaultWidth,
      leftSectionMinWidth: this.#_leftSectionMinWidth,
      leftSectionMaxWidth: this.#_leftSectionMaxWidth,
      undoDurationMs: this.#_undoDurationMs,
      reminderTimePrecision: this.#_reminderTimePrecision,
      timeFormat: this.#_timeFormat,
      timeSelecterRangeH: this.#_timeSelecterRangeH,
      myDayStartH: this.#_myDayStartH,
      notifyMinutesBeforeEvent: this.#_notifyMinutesBeforeEvent,
    };
  }

  /**
   * Create UserSettings instance from JSON (backend data)
   */
  static fromJSON(data) {
    const settings = new UserSettings();
    if (!data) return settings;

    // Apply loaded settings with validation
    if(data.keepDefaultReminder !== undefined)
      settings.setKeepDefaultReminder(data.keepDefaultReminder);
    if (data.defaultRemindTime) {
      settings.setDefaultRemindTime(
        data.defaultRemindTime.hour,
        data.defaultRemindTime.minute,
        data.defaultRemindTime.isApprox
      );
    }
    if (data.debounceDuration !== undefined)
      settings.setDebounceDuration(data.debounceDuration);
    if (data.smallScreenWidth !== undefined)
      settings.setSmallScreenWidth(data.smallScreenWidth);
    if (data.mediumScreenWidth !== undefined)
      settings.setMediumScreenWidth(data.mediumScreenWidth);
    if (data.maxCharsForTitle !== undefined)
      settings.setMaxCharsForTitle(data.maxCharsForTitle);
    if (data.leftSectionDefaultWidth !== undefined)
      settings.setLeftSectionDefaultWidth(data.leftSectionDefaultWidth);
    if (data.leftSectionMinWidth !== undefined)
      settings.setLeftSectionMinWidth(data.leftSectionMinWidth);
    if (data.leftSectionMaxWidth !== undefined)
      settings.setLeftSectionMaxWidth(data.leftSectionMaxWidth);
    if (data.undoDurationMs !== undefined)
      settings.setUndoDurationMs(data.undoDurationMs);
    if (data.reminderTimePrecision !== undefined)
      settings.setReminderTimePrecision(data.reminderTimePrecision);
    if (data.timeFormat !== undefined)
      settings.setTimeFormat(data.timeFormat);
    if (data.timeSelecterRangeH !== undefined)
      settings.setTimeSelecterRangeH(data.timeSelecterRangeH);
    if (data.myDayStartH !== undefined)
      settings.setMyDayStartH(data.myDayStartH);
    if (data.notifyMinutesBeforeEvent !== undefined)
      settings.setNotifyMinutesBeforeEvent(data.notifyMinutesBeforeEvent);

    return settings;
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults() {
    const defaults = this._defaults;
    this._keepDefaultReminder = defaults.keepDefaultReminder;
    this.#_defaultRemindTime = new ExtractedTime(
      defaults.defaultRemindTime.hour,
      defaults.defaultRemindTime.minute,
      defaults.defaultRemindTime.isApprox
    );
    this.#_debounceDuration = defaults.debounceDuration;
    this.#_smallScreenWidth = defaults.smallScreenWidth;
    this.#_mediumScreenWidth = defaults.mediumScreenWidth;
    this.#_maxCharsForTitle = defaults.maxCharsForTitle;
    this.#_leftSectionDefaultWidth = defaults.leftSectionDefaultWidth;
    this.#_leftSectionMinWidth = defaults.leftSectionMinWidth;
    this.#_leftSectionMaxWidth = defaults.leftSectionMaxWidth;
    this.#_undoDurationMs = defaults.undoDurationMs;
    this.#_reminderTimePrecision = defaults.reminderTimePrecision;
    this.#_timeFormat = defaults.timeFormat;
    this.#_timeSelecterRangeH = defaults.timeSelecterRangeH;
    this.#_myDayStartH = defaults.myDayStartH;
    this.#_notifyMinutesBeforeEvent = defaults.notifyMinutesBeforeEvent;
  }
}
