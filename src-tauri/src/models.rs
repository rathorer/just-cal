use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use std::default::Default;

#[derive(Serialize, Deserialize, Debug, Clone, Default)]
#[repr(u8)]
pub enum ItemState {
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
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct Item {
    pub id: u32,
    pub user_input: String,
    pub title: String,
    description: String,
    pub status: ItemState,
    time: Option<DateTime<Utc>>,
    reminder: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DayItem {
    pub id: u32,
    pub title: String,
    pub user_input: String,
    pub status: ItemState,
    pub date: String
}
