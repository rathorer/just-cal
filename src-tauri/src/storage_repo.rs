use crate::{
    models::{DayItem, Item},
    store::{self, StoreManager},
};
use chrono::{DateTime, Local, Utc};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State, Wry};
use tauri_plugin_store::Store;

fn convert_date_to_key(date: String) -> String {
    // Date format is YYYY-MM-DDTHH:MM:SSZ when passed from frontend
    let date_part = &date[0..10];
    //YYYY-MM-DD
    date_part.to_string()
}
fn convert_date_to_month_key(date: String) -> String {
    // Date YYYY-MM-DDTHH:MM:SSZ and month key is MM-YYYY
    store::date_to_month_key(&date)
}

// Common helper to parse date into locale string and store keys
fn parse_date_keys(date: DateTime<Utc>) -> (String, String, String) {
    let locale_datetime: DateTime<Local> = DateTime::from(date);
    let locale_date_str = locale_datetime.to_string();
    let key = convert_date_to_key(locale_date_str.clone());
    let store_key = convert_date_to_month_key(locale_date_str.clone());
    (locale_date_str, key, store_key)
}

// Get store from manager; if not present and `app_opt` provided, attempt reload/create
fn get_store_with_fallback(
    app_opt: Option<&AppHandle<Wry>>,
    manager: &State<'_, StoreManager<Wry>>,
    store_key: &str,
    locale_date_str: &str,
) -> Result<Arc<Store<Wry>>, String> {
    let stores = manager.stores.read().unwrap();
    if let Some(s) = stores.get(store_key) {
        Ok(s.clone())
    } else {
        drop(stores);
        if let Some(app) = app_opt {
            store::get_or_reload_store(app, locale_date_str)
        } else {
            Err(format!("Store not found for month: {}", store_key))
        }
    }
}

// Get for one date
#[tauri::command]
pub async fn get_items_for_date(
    app: AppHandle<Wry>,
    date: DateTime<Utc>,
) -> Result<Vec<Item>, String> {
    let store_manager = app.state::<StoreManager<Wry>>();
    let (locale_date_str, date_key, month_key) = parse_date_keys(date);

    let stores = store_manager.stores.read().unwrap();
    let all_stores = format!("{:?}", stores.clone().into_keys());
    println!("get date wise: stores in state {}", all_stores);
    let store = stores
        .get(&month_key)
        .ok_or(format!("Store not found for month: {}", &month_key))?;
    let obj_items = store
        .get(&date_key)
        .and_then(|v: serde_json::Value| serde_json::from_value::<Vec<Item>>(v.clone()).ok())
        .unwrap_or_default();

    Ok(obj_items)
}

#[tauri::command]
pub async fn get_items_for_month(
    app: AppHandle<Wry>,
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
) -> Result<Vec<DayItem>, String> {
    let (_locale_date_str, _key, store_key) = parse_date_keys(date);
    let store = get_store_with_fallback(Some(&app), &manager, &store_key, &_locale_date_str)?;

    let mut month_items: Vec<DayItem> = store
        .entries()
        .into_iter()
        .filter_map(
            |(k, v)| match serde_json::from_value::<Vec<Item>>(v.clone()) {
                Ok(items) => {
                    let day_items: Vec<DayItem> = items
                        .into_iter()
                        .map(|item| DayItem {
                            id: item.id,
                            title: item.title,
                            user_input: item.user_input,
                            status: item.status,
                            date: k.clone(),
                        })
                        .collect();
                    Some(day_items)
                }
                Err(e) => {
                    println!(
                        "Deserialization failed for key {}: {:?}, value: {:?}",
                        k, e, v
                    );
                    None
                }
            },
        )
        .flatten() // Flatten Vec<Vec<DayItem>> to Vec<DayItem>
        .collect();
    month_items.sort_by(|a, b| a.date.cmp(&b.date).then(a.id.cmp(&b.id)));
    Ok(month_items)
}

#[tauri::command]
pub async fn get_full_items_for_month(
    app: AppHandle<Wry>,
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
) -> Result<Vec<(String, Vec<Item>)>, String> {
    let (_locale_date_str, _key, store_key) = parse_date_keys(date);
    let store = get_store_with_fallback(Some(&app), &manager, &store_key, &_locale_date_str)?;

    let month_items: Vec<(String, Vec<Item>)> = store
        .entries()
        .into_iter()
        .filter_map(
            |(k, v)| match serde_json::from_value::<Vec<Item>>(v.clone()) {
                Ok(items) => Some((k, items)),
                Err(e) => {
                    println!(
                        "Deserialization failed for key {}: {:?}, value: {:?}",
                        k, e, v
                    );
                    None
                }
            },
        )
        .collect();

    Ok(month_items)
}

// Save/Update one date
#[tauri::command]
pub async fn save_items_for_date(
    app: AppHandle<Wry>,
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
    items: Vec<Item>,
) -> Result<(), String> {
    let (_locale_date_str, key, store_key) = parse_date_keys(date);
    //println!("in backend save items for date {}", store_key);
    let stores = manager.stores.read().unwrap();
    let store = if let Some(s) = stores.get(&store_key) {
        s.clone()
    } else {
        drop(stores);
        // Create a new store if it doesn't exist
        store::setup_new_store(&app, &_locale_date_str)?
    };
    store.set(
        key,
        serde_json::to_value(&items).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_single_item_of_date(
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
    item: Item,
) -> Result<(), String> {
    let (_locale_date_str, key, store_key) = parse_date_keys(date);
    let stores = manager.stores.read().unwrap();
    let store = stores.get(&store_key).ok_or("Store not found")?;
    let mut day_items = store
        .get(&key)
        .and_then(|v: serde_json::Value| serde_json::from_value::<Vec<Item>>(v.clone()).ok())
        .unwrap_or_default();
    println!("incomming: {}", &item.id);
    day_items.retain(|x| x.id != item.id);
    print!("items: {:?}", &day_items);
    store.set(
        &key,
        serde_json::to_value(&day_items).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_single_item_of_date(
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
    item: Item,
) -> Result<(), String> {
    let (_locale_date_str, key, store_key) = parse_date_keys(date);
    let stores = manager.stores.read().unwrap();
    let store = stores.get(&store_key).ok_or("Store not found")?;
    let mut day_items = store
        .get(&key)
        .and_then(|v: serde_json::Value| serde_json::from_value::<Vec<Item>>(v.clone()).ok())
        .unwrap_or_default();
    if let Some(pos) = day_items.iter().position(|x| x.id == item.id) {
        day_items[pos] = item;
    } else {
        day_items.push(item);
    }
    store.set(
        &key,
        serde_json::to_value(&day_items).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

// Optional: Delete one date
#[tauri::command]
pub async fn delete_items_for_date(
    manager: State<'_, StoreManager<Wry>>,
    date: DateTime<Utc>,
) -> Result<(), String> {
    let (_locale_date_str, key, store_key) = parse_date_keys(date);
    let stores = manager.stores.read().unwrap();
    let store = stores.get(&store_key).ok_or("Store not found")?;
    store.delete(key);
    store.save().map_err(|e| e.to_string())?;
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
