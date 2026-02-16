use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, Local, Utc, Weekday};
use serde::Serialize;
use std::convert::TryFrom;
use tauri::{Wry, AppHandle, Manager, State};
mod storage_repo;
mod store;
mod models;

use crate::store::{add_store_to_app_state, setup_new_store, get_or_reload_store};


#[derive(Serialize, Debug, Clone)]
enum ItemState {
    Draft = 0,
    Pending = 1,
    Done = 2,
    Discarted = 3,
}
#[derive(Debug)]
pub struct ConversionError;

impl TryFrom<usize> for ItemState {
    type Error = &'static str;

    fn try_from(value: usize) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(ItemState::Draft),
            1 => Ok(ItemState::Pending),
            2 => Ok(ItemState::Done),
            3 => Ok(ItemState::Discarted),
            _ => Err("Invalid value for ItemState"),
        }
    }
}

#[derive(Serialize, Debug, Clone)]
struct DayItem {
    id: u32,
    item: String,
    status: ItemState,
}
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
#[tauri::command]
fn update_store(date: String, app: AppHandle<Wry>) {
    println!("Updating store for date: {}", date);
    
    // Get store from AppState, with automatic fallback to disk and creation of new store if needed
    match get_or_reload_store(&app, &date) {
        Ok(_store) => {
            println!("Store loaded successfully for date: {}", date);
        },
        Err(e) => {
            println!("Error loading store for date {}: {}", date, e);
        }
    }
}

#[tauri::command]
fn fetch_day_items(date: &str) -> Vec<DayItem> {
    // Parse the date part from the string to get date components
    println!("in backend..fetching day items..{:?}", date);
    let date_part = &date[0..10]; // Assuming format is YYYY-MM-DDTHH:MM:SSZ
    println!("{}", date_part);
    let naive_date = NaiveDate::parse_from_str(date_part, "%Y-%m-%d").unwrap();
    let day = naive_date.day();
    let weekday = naive_date.weekday();
    let mut count: usize = 5;
    if weekday == Weekday::Sun{
        count = 0;
    } else{
        count = (day % 6) as usize;
    }
    let mut items_vec: Vec<DayItem> = Vec::with_capacity(count);
    let tasks: [String; 5] = [
        String::from("Batch processing capabilities"),
        String::from("AI-driven content writing application"),
        String::from("Canvas-based photo viewer"),
        String::from("A simple table calendar just cal"),
        String::from("MS Extensions posts")
    ];

     for i in 0..count {
        let task_idx: usize = i % 5;
        let mut status: ItemState = if i > 5 { 
            ItemState::Pending 
        } else { 
            ItemState::try_from(i % 4).expect("Modulus operation should result in a valid state") 
        }; 
        if i > 7 {
            status = ItemState::Discarted;
        }
        let task = &tasks[task_idx];  
        let obj = DayItem {
            id: i as u32,
            item: format!("{} - {}", task, i),
            status: status,
        };
        items_vec.push(obj);
    }

    items_vec
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app: &mut tauri::App| {
            // Initialize and manage the StoreManager first
            app.manage(store::initialize_store_manager::<Wry>());
            
            // Create a new store or load the existing one
            // this also put the store in the app's resource table
            // so your following `store` calls (from both Rust and JS)
            // will reuse the same store.
            let app_dir = app.path().app_data_dir()
                .map_err(|e| e.to_string())?;

            std::fs::create_dir_all(&app_dir)
                .map_err(|e| e.to_string())?;

            let now_local: DateTime<Local> = Local::now();
            let current_date = now_local.format(store::DATE_FORMAT).to_string();
            let store = setup_new_store(app.handle(), &current_date)?;
            add_store_to_app_state(app.handle(), &current_date, Some(store.clone()));

            // Remove the store from the resource table
            store.close_resource();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fetch_day_items, 
            update_store, 
            storage_repo::get_items_for_date,
            storage_repo::get_items_for_month,
            storage_repo::save_items_for_date,
            storage_repo::delete_single_item_of_date,
            storage_repo::update_single_item_of_date,
            storage_repo::delete_items_for_date])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
