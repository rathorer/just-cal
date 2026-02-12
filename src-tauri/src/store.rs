use tauri::{State, Manager, Runtime};
use tauri_plugin_store::{Store, StoreBuilder};
use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc, Local};
use std::sync::Arc;
use std::sync::RwLock;
use std::collections::HashMap;
use tauri_plugin_store::StoreExt;

pub const DATE_FORMAT: &str = "%Y-%m-%d";

pub struct StoreManager<R: Runtime> {
    pub stores: RwLock<HashMap<String, Arc<Store<R>>>>,
}

pub fn date_to_month_key(date: &str) -> String {
    // Date format is YYYY-MM-DDTHH:MM:SSZ when passed from frontend
     let selected_date = if date.is_empty() {
        let now_local: DateTime<Local> = Local::now();
        now_local.format(DATE_FORMAT).to_string()
    } else {
        date.to_string()
    };
    let parts: Vec<&str> = selected_date.split('-').take(2).collect();
    if parts.len() == 2 {
        format!("{}-{}", parts[1], parts[0]) //MM-YYYY.json
    } else {
        "current".to_string() // fallback
    }
}

pub fn date_to_store_filename(date: &str) -> String {
    // date is expected in "YYYY-MM-DD" format
    let month_key = date_to_month_key(date);
    format!("{}.json", month_key)
}

//Store helper functions, create new load from disk, save to disk, add to appstate etc.
pub fn reload_store_from_disk<R: Runtime>(app: &tauri::AppHandle<R>, date: String) -> Result<Arc<Store<R>>, String> {
    let filename = date_to_store_filename(&date);
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = data_dir.join(&filename);
    
    let store = StoreBuilder::new(app, file_path)
        .build()
        .map_err(|e| e.to_string())?;
    
    store.reload().map_err(|e| e.to_string())?;
    
    // Update or add store to app state via StoreManager
    add_store_to_app_state(app, &date, Some(store.clone()));
    
    Ok(store)
}   

pub fn setup_new_store<R: Runtime>(app: &tauri::AppHandle<R>, date: &str) ->  Result<Arc<Store<R>>, String> {
    let filename = date_to_store_filename(date);
    //let data_dir = app_data_dir(&config).expect("failed to resolve app data dir");
    let data_dir = app.path().app_data_dir().expect("failed to resolve app data dir");
    let file_path = data_dir.join(filename); // or similar
    println!("Store setup started with file: {}", file_path.display());
    
    //app.store will load or create store from filepath.
    let store = app.store(file_path).map_err(|e| e.to_string())?;
    // StoreBuilder::new(app, file_path)
    //     .build()
    //     .map_err(|e| e.to_string())?;
    
    //store.save().map_err(|e| e.to_string())?;
    
    // Add store to app state via StoreManager
    add_store_to_app_state(app, date, Some(store.clone()));
    
    Ok(store)
}

pub fn initialize_store_manager<R: Runtime>() -> StoreManager<R> {
    StoreManager {
        stores: RwLock::new(HashMap::new()),
    }
}

pub fn get_store_manager<R: Runtime>(app: &tauri::AppHandle<R>) -> State<'_, StoreManager<R>> {
    return app.state::<StoreManager<R>>().clone();
}

pub fn get_store_from_app_state<R: Runtime>(app: &tauri::AppHandle<R>, date: &str) -> Result<Arc<Store<R>>, String> {
    let store_manager = get_store_manager(app);
    let month_key = date_to_store_filename(date).split('.').next().unwrap_or("current").to_string();
    let stores_lock = store_manager.stores.read().unwrap();
    if let Some(store) = stores_lock.get(&month_key) {
        Ok(store.clone())
    } else {
        Err("Store for the month not found".to_string())
    }
}

pub fn add_store_to_app_state<R: Runtime>(app: &tauri::AppHandle<R>, date: &str, store: Option<Arc<Store<R>>>) {
    
    let this_month_store = if store.is_none() { 
        reload_store_from_disk(&app, date.to_string()) 
    } else { 
        Ok(store.unwrap()) 
    };
    match this_month_store {
        Ok(store) => {
            let store_manager = app.state::<StoreManager<R>>();
            let mut store_manager_lock = store_manager.stores.write().unwrap();
            let month_key = date_to_month_key(&date);
            store_manager_lock.insert(month_key.to_string(), store);
            println!("Store updated for month key: {}", month_key);
        },
        Err(e) => {
            println!("Error updating store: {}, {}", &date, e);
        }
    }
    
}

pub fn get_current_store<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Arc<Store<R>>, String> {
    let store_manager = get_store_manager(app);
    let stores_lock = store_manager.stores.read().unwrap();
    if let Some(store) = stores_lock.get("current") {
        Ok(store.clone())
    } else {
        Err("Current store not found".to_string())
    }
}