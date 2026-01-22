
use serde::{Serialize, Deserialize};
use chrono::{NaiveDate, NaiveDateTime, DateTime, Utc};
use std::default::Default;
use std::convert::TryFrom;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[repr(u8)]
enum ItemState {
    Draft = 0,
    #[default]
    Pending = 1,
    Done = 2,
    Discarted = 3,
}

impl TryFrom<u8> for ItemState {
    type Error = String; // Or a custom error type
    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(ItemState::Discarted),
            1 => Ok(ItemState::Pending),
            2 => Ok(ItemState::Done),
            3 => Ok(ItemState::Discarted),
            _ => Err(format!("Invalid UserRole integer: {}", value)),
        }
        // Alternative using From trait and `as` cast (less safe for invalid values)
        // Ok(unsafe { std::mem::transmute(value) })
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Item {
    id: u32,
    pub user_input: String,
    title: String,
    description: String,
    status: ItemState,
    time: DateTime<Utc>,
    reminder: Option<DateTime<Utc>>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Day {
    id: NaiveDate,
    day: u32,
    month: u32,
    year: u32,
    items: Vec<Item>,
}

// match datetime {
//     Some(dt) => println!("The datetime is: {}", dt),
//     None => println!("The timestamp was invalid"),
// }
