use tauri::{AppHandle, EventLoopMessage, Runtime, State, Manager, Wry};
use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, Utc, Weekday};
use tauri_plugin_store::{Store, StoreBuilder, StoreExt};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use crate::{models::{Day, Item}, store::StoreManager};

const STORE_FILE: &str = "db_justcal.json";
const USERS_KEY: &str = "users";

// async fn get_current_store<R: Runtime>(app: &AppHandle<Wry>) -> Result<Store<R>, String> {
//     let mut store = StoreBuilder::new(app, STORE_FILE)
//         .build()
//         .map_err(|e| e.to_string())?;

//     // Load existing data or create empty
//     store.reload().map_err(|e| e.to_string())?;
//     //store.save().map_err(|e| e.to_string())?;
//     Ok(store)
// }
// async fn get_month_store(app: &AppHandle<Wry>, date: &str) -> Result<Store<Wry>, String> {
//     let filename = get_store_filename(date);
//     let mut store = StoreBuilder::new(app, &filename)
//         .build()
//         .map_err(|e| e.to_string())?;

//     store.reload().map_err(|e| e.to_string())?; // creates if not exists
//     Ok(store)
// }
// fn get_store(state: tauri::State<'_, Mutex<AppState>>) -> u32 {
//     // Lock the mutex to get immutable access
//     let state = app.state::<Mutex<>>();
//     let app_state = state.lock().unwrap();
//     app_state.counter
// }

fn convert_date_to_key(date: String) -> String {
    // Date format is YYYY-MM-DDTHH:MM:SSZ when passed from frontend
    let date_part = &date[0..10]; 
    //YYYY-MM-DD
    date_part.to_string()
}
fn convert_date_to_month_key(date: String) -> String {
    // Date format is YYYY-MM-DDTHH:MM:SSZ when passed from frontend
    let year = &date[0..4];
    let month = &date[5..7];
    //YYYY-MM
    format!("{}-{}", year, month)
}

// #[derive(Serialize, Deserialize, Clone, Debug)]
// pub struct StorageService{
//     data: Vec<String>
// }

// Get for one date
#[tauri::command]
pub async fn get_items_for_date(app: AppHandle<Wry>, date: String) -> Result<Vec<Item>, String> {
    //get the store for the month from App state
    // let store = get_store(&app).await?;
    // let key = format!("{}{}", KEY_PREFIX, date);
    let store_manager = app.state::<StoreManager<Wry>>();
    let date_key = convert_date_to_key(date.clone());
    let month_key = convert_date_to_month_key(date.clone());

    let stores = store_manager.stores.read().unwrap();

    let store = stores
    .get(&month_key)
    .ok_or(format!("Store not found for month: {}", &month_key))?;

    // if let Some(store) = stores.get(&month_key) {  // "MM-YYYY" format
    // // Use the store
    //     let items = store.get(date_key);
    // } else {
    //     // Store not found for that month
    //     println!("Store not found");
    // }
    let obj_items = store
        .get(&date_key)
        .and_then(|v: serde_json::Value| serde_json::from_value::<Vec<Item>>(v.clone()).ok())
        .unwrap_or_default();
    
    Ok(obj_items)
}

#[tauri::command]
pub async fn get_items_for_month(manager: State<'_, StoreManager<Wry>>, date: String) -> Result<Vec<String>, String> {
    //let key = convert_date_to_key(date);
    let store_key = convert_date_to_month_key(date);
    //let manager = app.state::<store::StoreManager<R>>();
    let stores = manager.stores.read().unwrap();

    let store = stores
        .get(&store_key)
        .ok_or("Store not found")?;
    //get all items for the month, no filtering required here, all items stored in current store are for month
    // let items = store
    //     .get(&key)
    //     .and_then(|v| serde_json::from_value(v.clone()).ok())
    //     .into_iter()  
    //     .map(|f: Item| f.user_input.clone())
    //     .collect();
    let month_items: Vec<String> = store
        .keys()
        .into_iter()
        .filter_map(|k| store.get(&k))
        .filter_map(|v: serde_json::Value| serde_json::from_value(v.clone()).ok())
        //.and_then(|v| serde_json::from_value(v.clone()).ok())
        //.into_iter()
        .map(|f: Item| f.user_input.clone())
        //.map(|k| k.strip_prefix(KEY_PREFIX).unwrap().to_string())
        .collect();

    Ok(month_items)
}

// Save/Update one date
#[tauri::command]
pub async fn save_items_for_date(manager: State<'_, StoreManager<Wry>>, date: String, items: Vec<Item>) -> Result<(), String> {
    let key = convert_date_to_key(date.clone());
    let store_key = convert_date_to_month_key(date.clone());

    let stores = manager.stores.write().unwrap();
    let store = stores
        .get(&store_key)
        .ok_or("Store not found")?;
    store.set(key, serde_json::to_value(&items).map_err(|e| e.to_string())?);
    store.save().map_err(|e| e.to_string())?;
    store.reload().map_err(|e| e.to_string())?;
    
    Ok(())
}

// Optional: Delete one date
#[tauri::command]
pub async fn delete_items_for_date(manager: State<'_, StoreManager<Wry>>, date: String) -> Result<(), String> {
    let key = convert_date_to_key(date.clone());
    let store_key = convert_date_to_month_key(date.clone());
    let stores = manager.stores.write().unwrap();
    let store = stores
        .get(&store_key)
        .ok_or("Store not found")?;
    store.delete(key);
    store.save();
    Ok(())
}

// Optional: Get list of all dates that have data
// #[tauri::command]
// pub async fn get_all_dates(app: AppHandle) -> Result<Vec<String>, String> {
//     let store = get_store(&app).await?;
//     let keys: Vec<String> = store
//         .keys()
//         .into_iter()
//         .filter(|k| k.starts_with(KEY_PREFIX))
//         .map(|k| k.strip_prefix(KEY_PREFIX).unwrap().to_string())
//         .collect();
//     Ok(keys)
// }