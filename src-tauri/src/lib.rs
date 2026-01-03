use chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use serde::Serialize;
use std::convert::TryFrom;
use std::fmt;


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
fn fetch_day_items(date: String) -> Vec<DayItem> {
    // Parse the string into the desired chrono type inside the function
    match date.parse::<DateTime<Utc>>() {
        Ok(dt) => {
            println!("Received DateTime: {:?}", dt);
            // ... your logic ...
        }
        Err(e) => {
            eprintln!("Failed to parse DateTime: {}", e);
            // Handle error (e.g., return an error result)
        }
    }

    let count: usize = 10;
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
        .invoke_handler(tauri::generate_handler![fetch_day_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
