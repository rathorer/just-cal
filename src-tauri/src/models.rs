
use serde::{Serialize, Deserialize};
use chrono::{NaiveDate, NaiveDateTime};
use std::default::Default;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
enum ItemState {
    Draft = 0,
    #[default]
    Pending = 1,
    Done = 2,
    Discarted = 3,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Item {
    id: u32,
    pub user_input: String,
    title: String,
    description: String,
    status: ItemState,
    time: NaiveDateTime,
    reminder: Option<NaiveDateTime>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Day {
    id: NaiveDate,
    day: String,
    month: u32,
    year: u32,
    items: Vec<Item>,
}

// match datetime {
//     Some(dt) => println!("The datetime is: {}", dt),
//     None => println!("The timestamp was invalid"),
// }
