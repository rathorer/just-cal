use std::path::PathBuf;
use serde_json::Value;
use tauri::{AppHandle, Manager, Wry};
use tauri_plugin_store::StoreExt;

const SETTINGS_FILE: &str = "db_settings.json";

fn get_file_location(app: &AppHandle<Wry>) -> Result<PathBuf, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = data_dir.join(SETTINGS_FILE);
    Ok(file_path)
}

/// Get all settings from the store as a JSON string.
/// Returns an empty string if the settings file doesn't exist.
/// The frontend can parse this string into JSON.
#[tauri::command]
pub async fn get_user_settings(
    app: AppHandle<Wry>,
) -> Result<Value, String> {
    
    let file_path = get_file_location(&app)?;
    // Check if the settings file exists
    if !file_path.exists() {
        println!("Settings file does not exist at {:?}, returning empty string", file_path);
        return Ok(serde_json::json!({})); // Return empty json if no file
    }

    // Load the store
    let store = app.store(file_path).map_err(|e| e.to_string())?;

    // Get all entries from the store and convert to JSON
    let entries = store.entries();
    let json=
        serde_json::to_value(&entries).map_err(|e| format!("Failed to serialize settings: {}", e))?;

    println!("Retrieved settings: {}", json);
    Ok(json)
}

/// Save settings to the store as JSON value.
/// If the settings file doesn't exist, it will be created.
/// If it exists, it will be updated with the new settings.
#[tauri::command]
pub async fn save_user_settings(
    app: AppHandle<Wry>,
    settings: Value,
) -> Result<(), String> {
    let file_path = get_file_location(&app)?;
    
    // Convert Value to Map - assuming it's an object
    let settings_map = settings.as_object()
        .ok_or("Settings must be a JSON object")?
        .clone();

    // Load or create the store
    let store = app.store(file_path.clone()).map_err(|e| e.to_string())?;

    // Clear existing entries and set new ones
    println!("Saving {} settings entries", settings_map.len());
    for (key, value) in settings_map {
        store.set(key.clone(), value);
    }

    // Save to disk
    store.save().map_err(|e| e.to_string())?;
    println!("Settings saved successfully to {:?}", file_path);

    Ok(())
}
