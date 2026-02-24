import React, { useState, useEffect, useRef } from "react";
import { useUserSettings } from "../contexts/UserSettingsContext";
import CrossIcon from "../components/icons/Cross";
import UndoIcon from '../components/icons/Undo';

// import "../styles/SettingsPage.css";

/**
 * SettingsPage - Component for users to edit their preferences
 * Displays all configurable settings with validation and save/reset functionality
 */
export function SettingsPage(props) {
  const handleClose = props.onClose;
  const { settings, isLoading, error, saveSettings, resetToDefaults, reloadSettings } = useUserSettings();
  //const [keepDefaultReminder, setKeepDefaultReminder] = useState(settings.keepDefaultReminder);
  const [localSettings, setLocalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [timeFormatSample, setTimeFormatSample] = useState("");
  const initialSettings = useRef(settings);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        keepDefaultReminder: settings.keepDefaultReminder,
        defaultRemindTimeHour: settings.defaultRemindTime.hour,
        defaultRemindTimeMinute: settings.defaultRemindTime.minute,
        debounceDuration: settings.debounceDuration,
        smallScreenWidth: settings.smallScreenWidth,
        mediumScreenWidth: settings.mediumScreenWidth,
        maxCharsForTitle: settings.maxCharsForTitle,
        leftSectionDefaultWidth: settings.leftSectionDefaultWidth,
        leftSectionMinWidth: settings.leftSectionMinWidth,
        leftSectionMaxWidth: settings.leftSectionMaxWidth,
        undoDurationMs: settings.undoDurationMs,
        reminderTimePrecision: settings.reminderTimePrecision,
        timeFormat: settings.timeFormat,
        timeSelecterRangeH: settings.timeSelecterRangeH,
        myDayStartH: settings.myDayStartH,
        notifyMinutesBeforeEvent: settings.notifyMinutesBeforeEvent,
      });
      setHasChanges(false);
      setValidationErrors({});
      initialSettings.current = settings;
    }
  }, [settings]);

  const handleKeepReminder = (e) => {
    let isChecked = e.target.checked;
    //setKeepDefaultReminder(isChecked);
    setLocalSettings((prev) => {
      return { ...prev, keepDefaultReminder: isChecked }
    });
    setHasChanges(true);
  };

  const handleInputChange = (field, value) => {
    const numValue = field.includes("Hour") || field.includes("Minute") ||
      field.includes("Duration") || field.includes("Width") ||
      field.includes("Chars") || field.includes("Range") ||
      field.includes("Start") || field.includes("Minutes")
      ? parseInt(value) || value
      : value;
    if (field.includes('timeFormat')) {
      let date = new Date();
      const formattedTime = date.toLocaleTimeString(undefined, { timeStyle: value });
      setTimeFormatSample(formattedTime);
    }
    const newSettings = {
      ...localSettings,
      [field]: numValue,
    };
    setLocalSettings(newSettings);
    const changed = Object.keys(initialSettings.current).some(
      (key) => newSettings[key] !== initialSettings.current[key]
    );
    setHasChanges(changed);
  };

  const validateChanges = () => {
    const errors = {};
    if (
      !Number.isInteger(localSettings.defaultRemindTimeHour) ||
      localSettings.defaultRemindTimeHour < 0 ||
      localSettings.defaultRemindTimeHour > 23
    ) {
      errors.defaultRemindTimeHour = "Hour must be 0-23";
    }

    if (
      !Number.isInteger(localSettings.defaultRemindTimeMinute) ||
      localSettings.defaultRemindTimeMinute < 0 ||
      localSettings.defaultRemindTimeMinute > 59
    ) {
      errors.defaultRemindTimeMinute = "Minute must be 0-59";
    }

    if (localSettings.debounceDuration < 100) {
      errors.debounceDuration = "Must be at least 100ms";
    }

    if (localSettings.smallScreenWidth <= 0) {
      errors.smallScreenWidth = "Must be greater than 0";
    }

    if (localSettings.mediumScreenWidth <= localSettings.smallScreenWidth) {
      errors.mediumScreenWidth =
        "Must be greater than small screen width";
    }

    if (localSettings.maxCharsForTitle <= 0) {
      errors.maxCharsForTitle = "Must be greater than 0";
    }

    if (
      localSettings.leftSectionDefaultWidth < 0 ||
      localSettings.leftSectionDefaultWidth > 100
    ) {
      errors.leftSectionDefaultWidth = "Must be 0-100";
    }

    if (
      localSettings.leftSectionMinWidth < 0 ||
      localSettings.leftSectionMinWidth > 100
    ) {
      errors.leftSectionMinWidth = "Must be 0-100";
    }

    if (
      localSettings.leftSectionMaxWidth < 0 ||
      localSettings.leftSectionMaxWidth > 100
    ) {
      errors.leftSectionMaxWidth = "Must be 0-100";
    }

    if (
      localSettings.leftSectionMinWidth >
      localSettings.leftSectionMaxWidth
    ) {
      errors.leftSectionMinWidth = "Min cannot be greater than max";
    }

    if (localSettings.undoDurationMs < 1000) {
      errors.undoDurationMs = "Must be at least 1000ms";
    }

    if (localSettings.reminderTimePrecision <= 0) {
      errors.reminderTimePrecision = "Must be greater than 0";
    }

    if (
      !["full", "long", "medium", "short"].includes(
        localSettings.timeFormat
      )
    ) {
      errors.timeFormat = "Invalid format";
    }

    if (
      !Number.isInteger(localSettings.timeSelecterRangeH) ||
      localSettings.timeSelecterRangeH <= 0 ||
      localSettings.timeSelecterRangeH > 12
    ) {
      errors.timeSelecterRangeH = "Must be 1-12";
    }

    if (
      !Number.isInteger(localSettings.myDayStartH) ||
      localSettings.myDayStartH < 0 ||
      localSettings.myDayStartH > 23
    ) {
      errors.myDayStartH = "Must be 0-23";
    }

    if (localSettings.notifyMinutesBeforeEvent <= 0) {
      errors.notifyMinutesBeforeEvent = "Must be greater than 0";
    }

    return errors;
  };

  const handleSave = async () => {
    if (hasChanges) {
      const errors = validateChanges();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setIsSaving(true);
      setSaveMessage("");

      try {
        // Apply all changes to settings instance
        settings.setKeepDefaultReminder(localSettings.keepDefaultReminder);
        settings.setDefaultRemindTime(
          localSettings.defaultRemindTimeHour,
          localSettings.defaultRemindTimeMinute
        );
        settings.setDebounceDuration(localSettings.debounceDuration);
        settings.setSmallScreenWidth(localSettings.smallScreenWidth);
        settings.setMediumScreenWidth(localSettings.mediumScreenWidth);
        settings.setMaxCharsForTitle(localSettings.maxCharsForTitle);
        settings.setLeftSectionDefaultWidth(
          localSettings.leftSectionDefaultWidth
        );
        settings.setLeftSectionMinWidth(localSettings.leftSectionMinWidth);
        settings.setLeftSectionMaxWidth(localSettings.leftSectionMaxWidth);
        settings.setUndoDurationMs(localSettings.undoDurationMs);
        settings.setReminderTimePrecision(localSettings.reminderTimePrecision);
        settings.setTimeFormat(localSettings.timeFormat);
        settings.setTimeSelecterRangeH(localSettings.timeSelecterRangeH);
        settings.setMyDayStartH(localSettings.myDayStartH);
        settings.setNotifyMinutesBeforeEvent(
          localSettings.notifyMinutesBeforeEvent
        );

        // Save to backend
        const success = await saveSettings();
        if (success) {
          setSaveMessage("✓ Settings saved successfully!");
          setHasChanges(false);
          setValidationErrors({});
          setTimeout(() => setSaveMessage(""), 3000);
        } else {
          setSaveMessage("✗ Failed to save settings. Please try again.");
        }
      } catch (err) {
        console.error("Error saving settings:", err);
        setSaveMessage("✗ Error saving settings. Please try again.");
      } finally {
        setIsSaving(false);
        handleClose();
      }
    }
    handleClose();
  };

  const handleReset = async () => {
    setIsSaving(true);
    const success = await resetToDefaults();
    if (success) {
      setSaveMessage("✓ Settings reset to defaults!");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("✗ Failed to reset settings. Please try again.");
    }
    setIsSaving(false);
  };

  const handleCancel = () => {

    setLocalSettings(null);
    setHasChanges(false);
    setValidationErrors({});
    setSaveMessage("");
    // Reload from current settings
    if (settings) {
      setLocalSettings({
        keepDefaultReminder: settings.keepDefaultReminder,
        defaultRemindTimeHour: settings.defaultRemindTime.hour,
        defaultRemindTimeMinute: settings.defaultRemindTime.minute,
        debounceDuration: settings.debounceDuration,
        smallScreenWidth: settings.smallScreenWidth,
        mediumScreenWidth: settings.mediumScreenWidth,
        maxCharsForTitle: settings.maxCharsForTitle,
        leftSectionDefaultWidth: settings.leftSectionDefaultWidth,
        leftSectionMinWidth: settings.leftSectionMinWidth,
        leftSectionMaxWidth: settings.leftSectionMaxWidth,
        undoDurationMs: settings.undoDurationMs,
        reminderTimePrecision: settings.reminderTimePrecision,
        timeFormat: settings.timeFormat,
        timeSelecterRangeH: settings.timeSelecterRangeH,
        myDayStartH: settings.myDayStartH,
        notifyMinutesBeforeEvent: settings.notifyMinutesBeforeEvent,
      });
    }
  };

  if (isLoading) {
    return <div className="w-full min-h-screen bg-base-100 flex items-center justify-center text-lg text-gray-600">Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-base-100 flex items-center justify-center text-lg text-error">
        <p>Error loading settings: {error.message}</p>
        <p>Default values will be used.</p>
      </div>
    );
  }

  if (!localSettings) {
    return <div className="w-full min-h-screen bg-base-100 flex items-center justify-center text-lg text-gray-600">Loading...</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-3rem)] bg-base-100">
      <div className="w-full h-full pl-3 pr-3 bg-base-100/90 border-b border-base-300 text-base-content overflow-y-auto">
        {/* Header with Close and Reset Buttons */}
        <div className="flex justify-between items-center mt-4 mb-4">
          <h2 className="text-2xl font-bold">Set Your Preferences</h2>
          <div className="flex gap-2">
            {/* Reset to Defaults Button */}
            {hasChanges &&
              <button
                type="button"
                className="btn btn-md btn-ghost"
                onClick={handleCancel}
                disabled={isSaving}
                title="Undo all changes"
              >
                <UndoIcon className="h-6 w-6" />
              </button>}
            <button
              type="button"
              className="btn btn-md btn-ghost gap-2"
              onClick={handleReset}
              disabled={isSaving}
              title="Reset to defaults"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {/* Close Button */}
            <button
              type="button"
              className="btn btn-md btn-ghost"
              onClick={handleSave}
              disabled={isSaving}
              title="Close settings"
            >
              <CrossIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        {saveMessage && (
          <div
            className={`alert mb-4 ${saveMessage.includes("✓") ? "alert-success" : "alert-error"
              }`}
          >
            {saveMessage}
          </div>
        )}
        {/* 4-Column Layout */}
        <div className="grid grid-cols-4 gap-0 text-lg">
          {/* Empty Column 1 */}
          <div></div>

          {/* Columns 2-3: Main Content */}
          <div className="col-span-2">
            {/* Time Settings Section */}
            <fieldset className="fieldset mb-8">
              <legend className="legend text-lg font-bold">Time Settings</legend>

              <div className="grid grid-cols-2 gap-4 text-lg">
                {/* Default Reminder Time */}
                <div className="flex items-start">
                  <label htmlFor="defaultReminder" className="label">
                    <span className="label-text">Keep a Default Reminder</span>
                  </label>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      id="defaultReminder"
                      type="checkbox"
                      checked={localSettings.keepDefaultReminder}
                      // value={`${localSettings.keepDefaultReminder}`}
                      onChange={handleKeepReminder}
                      className={`checkbox checkbox-lg text-center`}
                    />
                  </div>
                  <span className="text-sm text-gray-600 italic">If no reminder specified in input text, whether to keep a default one.</span>
                </div>
                {localSettings.keepDefaultReminder && (<>
                  <div className="flex items-start">
                    <label htmlFor="defaultRemindTimeHour" className="label">
                      <span className="label-text">Default Reminder Time</span>
                    </label>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        id="defaultRemindTimeHour"
                        type="number"
                        min="0"
                        max="23"
                        value={localSettings.defaultRemindTimeHour}
                        onChange={(e) =>
                          handleInputChange("defaultRemindTimeHour", e.target.value, value == e.target.value)
                        }
                        className={`input input-bordered w-20 text-center ${validationErrors.defaultRemindTimeHour ? "input-error" : ""}`}
                      />
                      <span className="text-lg text-gray-500 font-bold">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={String(localSettings.defaultRemindTimeMinute).padStart(
                          2,
                          "0"
                        )}
                        onChange={(e) =>
                          handleInputChange(
                            "defaultRemindTimeMinute",
                            e.target.value
                          )
                        }
                        className={`input input-bordered w-20 text-center ${validationErrors.defaultRemindTimeMinute ? "input-error" : ""}`}
                      />
                    </div>
                    {validationErrors.defaultRemindTimeHour && (
                      <span className="text-md text-error mt-1 block">
                        {validationErrors.defaultRemindTimeHour}
                      </span>
                    )}
                    {validationErrors.defaultRemindTimeMinute && (
                      <span className="text-md text-error mt-1 block">
                        {validationErrors.defaultRemindTimeMinute}
                      </span>
                    )}
                    <span className="text-sm text-gray-600 italic">24 hour format</span>
                  </div>
                </>)}
                {/* My Day Starts At */}
                <div className="flex items-start">
                  <label htmlFor="myDayStartH" className="label">
                    <span className="label-text">My Day Starts At (Hour)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="myDayStartH"
                    type="number"
                    min="0"
                    max="23"
                    value={localSettings.myDayStartH}
                    onChange={(e) => handleInputChange("myDayStartH", e.target.value)}
                    className={`input input-bordered w-full ${validationErrors.myDayStartH ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">(24-hour format) Makes time selection easy.</span>
                  {validationErrors.myDayStartH && (
                    <span className="text-md text-error mt-1 block">{validationErrors.myDayStartH}</span>
                  )}
                </div>

                {/* Time Display Format */}
                <div className="flex items-start">
                  <label htmlFor="timeFormat" className="label">
                    <span className="label-text">Time Display Format</span>
                  </label>
                </div>
                <div>
                  <select
                    id="timeFormat"
                    value={localSettings.timeFormat}
                    onChange={(e) => handleInputChange("timeFormat", e.target.value)}
                    className={`select select-bordered w-full ${validationErrors.timeFormat ? "select-error" : ""}`}
                  >
                    <option value="full">Full</option>
                    <option value="long">Long</option>
                    <option value="medium">Medium</option>
                    <option value="short">Short</option>
                  </select>
                  <span className="text-sm text-gray-600 italic">{timeFormatSample}</span>
                  {validationErrors.timeFormat && (
                    <span className="text-md text-error mt-1 block">{validationErrors.timeFormat}</span>
                  )}
                </div>

                {/* Time Selector Range */}
                <div className="flex items-start">
                  <label htmlFor="timeSelecterRangeH" className="label">
                    <span className="label-text">Time Selector Range (Hours)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="timeSelecterRangeH"
                    type="number"
                    min="1"
                    max="12"
                    value={localSettings.timeSelecterRangeH}
                    onChange={(e) =>
                      handleInputChange("timeSelecterRangeH", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.timeSelecterRangeH ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">
                    Makes time selection easy by showing upfront ±{localSettings.timeSelecterRangeH} hour range.
                  </span>
                  {validationErrors.timeSelecterRangeH && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.timeSelecterRangeH}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Display Settings Section */}
            <fieldset className="fieldset mb-8">
              <legend className="legend text-lg">Display Settings</legend>

              <div className="grid grid-cols-2 gap-4 text-lg">
                {/* Small Screen Width */}
                <div className="flex items-start">
                  <label htmlFor="smallScreenWidth" className="label">
                    <span className="label-text">Small Screen Width (px)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="smallScreenWidth"
                    type="number"
                    min="1"
                    value={localSettings.smallScreenWidth}
                    onChange={(e) =>
                      handleInputChange("smallScreenWidth", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.smallScreenWidth ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Breakpoint for small screens</span>
                  {validationErrors.smallScreenWidth && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.smallScreenWidth}
                    </span>
                  )}
                </div>

                {/* Medium Screen Width */}
                <div className="flex items-start">
                  <label htmlFor="mediumScreenWidth" className="label">
                    <span className="label-text">Medium Screen Width (px)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="mediumScreenWidth"
                    type="number"
                    value={localSettings.mediumScreenWidth}
                    onChange={(e) =>
                      handleInputChange("mediumScreenWidth", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.mediumScreenWidth ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Breakpoint for medium screens</span>
                  {validationErrors.mediumScreenWidth && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.mediumScreenWidth}
                    </span>
                  )}
                </div>

                {/* Max Title Characters */}
                <div className="flex items-start">
                  <label htmlFor="maxCharsForTitle" className="label">
                    <span className="label-text">Max Title Length (Characters)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="maxCharsForTitle"
                    type="number"
                    min="1"
                    value={localSettings.maxCharsForTitle}
                    onChange={(e) =>
                      handleInputChange("maxCharsForTitle", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.maxCharsForTitle ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Breaks sentence into title & description based on this.</span>
                  {validationErrors.maxCharsForTitle && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.maxCharsForTitle}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Layout Settings Section */}
            <fieldset className="fieldset mb-8">
              <legend className="legend text-lg">Layout Settings</legend>

              <div className="grid grid-cols-2 gap-4 text-lg">
                {/* Left Panel Default Width */}
                <div className="flex items-start">
                  <label htmlFor="leftSectionDefaultWidth" className="label">
                    <span className="label-text">Left Panel Default Width (%)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="leftSectionDefaultWidth"
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.leftSectionDefaultWidth}
                    onChange={(e) =>
                      handleInputChange("leftSectionDefaultWidth", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.leftSectionDefaultWidth ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">This decides month and right section division.</span>
                  {validationErrors.leftSectionDefaultWidth && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.leftSectionDefaultWidth}
                    </span>
                  )}
                </div>

                {/* Left Panel Min Width */}
                <div className="flex items-start">
                  <label htmlFor="leftSectionMinWidth" className="label">
                    <span className="label-text">Left Panel Min Width (%)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="leftSectionMinWidth"
                    type="number"
                    disabled={true}
                    min="0"
                    max="100"
                    value={localSettings.leftSectionMinWidth}
                    onChange={(e) =>
                      handleInputChange("leftSectionMinWidth", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.leftSectionMinWidth ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Not configurable for now.</span>
                  {validationErrors.leftSectionMinWidth && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.leftSectionMinWidth}
                    </span>
                  )}
                </div>

                {/* Left Panel Max Width */}
                <div className="flex items-start">
                  <label htmlFor="leftSectionMaxWidth" className="label">
                    <span className="label-text">Left Panel Max Width (%)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="leftSectionMaxWidth"
                    type="number"
                    min="0"
                    max="100"
                    disabled={true}
                    value={localSettings.leftSectionMaxWidth}
                    onChange={(e) =>
                      handleInputChange("leftSectionMaxWidth", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.leftSectionMaxWidth ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Not configurable for now.</span>
                  {validationErrors.leftSectionMaxWidth && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.leftSectionMaxWidth}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Performance Settings Section */}
            <fieldset className="fieldset mb-8">
              <legend className="legend text-lg">Performance Settings</legend>

              <div className="grid grid-cols-2 gap-4 text-lg">
                {/* Debounce Duration */}
                <div className="flex items-start">
                  <label htmlFor="debounceDuration" className="label">
                    <span className="label-text">Wait before auto saving (ms)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="debounceDuration"
                    type="number"
                    min="100"
                    value={localSettings.debounceDuration}
                    onChange={(e) =>
                      handleInputChange("debounceDuration", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.debounceDuration ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Let you type, when you pause for this long, auto saves.</span>
                  {validationErrors.debounceDuration && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.debounceDuration}
                    </span>
                  )}
                </div>

                {/* Undo Duration */}
                <div className="flex items-start">
                  <label htmlFor="undoDurationMs" className="label">
                    <span className="label-text">Undo Duration (ms)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="undoDurationMs"
                    type="number"
                    min="1000"
                    step="100"
                    value={localSettings.undoDurationMs}
                    onChange={(e) =>
                      handleInputChange("undoDurationMs", e.target.value)
                    }
                    className={`input input-bordered w-2/3 ${validationErrors.undoDurationMs ? "input-error" : ""}`}
                  />
                  <span className="text-md text-gray-600 output pl-4 w-1/3">{(localSettings.undoDurationMs) / 1000} seconds</span>
                  <div>
                    <span className="text-sm text-gray-600 italic">After removing an item, for how long undo should be available</span>
                  </div>
                  {validationErrors.undoDurationMs && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.undoDurationMs}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Notification Settings Section */}
            <fieldset className="fieldset mb-8">
              <legend className="legend text-lg">Notification Settings</legend>

              <div className="grid grid-cols-2 gap-4 text-lg">
                {/* Reminder Time Precision */}
                <div className="flex items-start">
                  <label htmlFor="reminderTimePrecision" className="label">
                    <span className="label-text">Time Precision (minutes)</span>
                  </label>
                </div>
                <div>
                  <input
                    id="reminderTimePrecision"
                    type="number"
                    min="1"
                    value={localSettings.reminderTimePrecision}
                    onChange={(e) =>
                      handleInputChange("reminderTimePrecision", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.reminderTimePrecision ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">
                    Makes time selection easy, gives different times based on this interval.
                  </span>
                  {validationErrors.reminderTimePrecision && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.reminderTimePrecision}
                    </span>
                  )}
                </div>

                {/* Notify Minutes Before Event */}
                <div className="flex items-start">
                  <label htmlFor="notifyMinutesBeforeEvent" className="label">
                    <span className="label-text">Notify Minutes Before Event</span>
                  </label>
                </div>
                <div>
                  <input
                    id="notifyMinutesBeforeEvent"
                    type="number"
                    min="1"
                    value={localSettings.notifyMinutesBeforeEvent}
                    onChange={(e) =>
                      handleInputChange("notifyMinutesBeforeEvent", e.target.value)
                    }
                    className={`input input-bordered w-full ${validationErrors.notifyMinutesBeforeEvent ? "input-error" : ""}`}
                  />
                  <span className="text-sm text-gray-600 italic">Send notification {localSettings.notifyMinutesBeforeEvent} minutes before the event.</span>
                  {validationErrors.notifyMinutesBeforeEvent && (
                    <span className="text-md text-error mt-1 block">
                      {validationErrors.notifyMinutesBeforeEvent}
                    </span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* </form> */}
          </div>

          {/* Empty Column 4 */}
          <div></div>
        </div>
      </div>
    </div>
  );
}