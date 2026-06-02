import { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useCache from '../hooks/useCache';
import DayAgenda from './DayAgenda';
import { getReminder } from '../services/reminderDetectionService';
import { Constants } from '../utilities/constants';
import JustDate from './../utilities/justDate';
import { useUserSettings } from "../contexts/UserSettingsContext";
import { convertUserInputToAgendaItem } from '../services/userInputDetectionsService';
import { getTitleOfAText } from '../services/titleDetectionService';

function RightSection(props) {
  const year = props.year;
  const month = props.month;
  const monthName = props.monthName;
  const handleAgendaAddParent = props.onAgendaAdd;
  const handleAgendaEditParent = props.onAgendaEdit;
  const handleAgendaRemoveParent = props.onAgendaRemove;
  const lastAgendaUpdate = props.lastAgendaUpdate;
  let selectedDate = props.selectedDate;
  let dateObj = new Date(year, month, selectedDate);
  let dateAsKey = JustDate.toISOLikeDateString(dateObj);
  //const [currentDate, setCurrentDate] = useState(selectedDate);

  const { settings } = useUserSettings();
  const [date, setDate] = useState(dateObj);
  const [items, setItems] = useState({ [dateAsKey]: undefined });
  const [recentRemoved, setRecentRemoved] = useState({ [dateAsKey]: [] });
  //const agendaCache = useCache(cacheTTL);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let dateObj = new Date(year, month, selectedDate);
    dateAsKey = JustDate.toISOLikeDateString(dateObj);
    setDate(dateObj);
  }, [year, month, selectedDate]);

  useEffect(() => {
    async function fetchDayItems() {
      try {
        if (date) {
          //let date = new Date(year, month, selectedDate);
          //let agenda = agendaCache.get(dateAsKey);
          //if(!agenda){
          let jsonDate = date.toISOString();
          let selectedDateAsKey = JustDate.toISOLikeDateString(date);
          //Only fetch if it was not already fetched.
          if (!items[selectedDateAsKey]) {

            //console.log('calling get_items_for_date.', jsonDate);
            const dayItems = await invoke("get_items_for_date", { date: jsonDate });
            //console.log("Fetched selected day items:", dayItems);

            setItems({ ...items, [selectedDateAsKey]: dayItems });
          }
          //agendaCache.set(dateAsKey, dayItems);
          // } else{
          //   setItems(agenda);
          // }
        }
      } catch (error) {
        console.error("Failed to fetch selected day items:", error);
      }
    }
    fetchDayItems();
  }, [date, selectedDate]);

  //TODO: Merge is doing extra work here,
  // anything we receive from parent (basically Day comp) can directly be replaced instead of merge.
  //In Day we already merged new and old and changed item and we updated DB, so updatedAgenda should
  // be source of truth. But this doesn't harm as desc and status will never be updated from Day.
  function mergeCurrentAndUpdatedAgendas(currentAgenda, updatedAgenda) {
    const mergedAgenda = currentAgenda.map(currentItem => {
      const existingItem = updatedAgenda.find(updatedItem => updatedItem.id === currentItem.id);
      // In case the updatedAgenda coming from Day, it may not have desc so skip and update other things.
      // So we update everything except desc and status (which is edited only from right section); 
      let currDescription = currentItem.description;
      let currStatus = currentItem.status;
      let updatedItem = existingItem ? { ...currentItem, ...existingItem } : currentItem;
      updatedItem.description = currDescription;
      updatedItem.status = currStatus;
      return updatedItem;
    });

    // Add unique items from arr2 that were not in arr1
    updatedAgenda.forEach(item2 => {
      if (!currentAgenda.some(item1 => item1.id === item2.id)) {
        mergedAgenda.push(item2);
      }
    });
    return mergedAgenda;
  }

  //Handle Agenda update from parent
  useEffect(() => {
    if (!lastAgendaUpdate || !date) {
      return;
    }
    const selectedDateKey = JustDate.toISOLikeDateString(date);
    if (lastAgendaUpdate.dateKey !== selectedDateKey) {
      return;
    }
    // const mergedAgenda = 
    //   mergeCurrentAndUpdatedAgendas(items[selectedDateKey] || [], lastAgendaUpdate.agenda);
    setItems((prevItems) => {
      const currentItems = prevItems[selectedDateKey] || [];
      return {
        ...prevItems,
        [selectedDateKey]: lastAgendaUpdate.agenda
      };
    });
    //setItems({...items, [selectedDateKey]: mergedAgenda});
  }, [lastAgendaUpdate, date]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (recentRemoved[dateAsKey] && recentRemoved[dateAsKey].length > 0) {
        console.log('checking to delete removed items');
        const now = Date.now();
        const expired = recentRemoved[dateAsKey].filter(
          r => r.expiresAt <= now
        );
        if (expired.length == 0) { return; }
        expired.forEach(async (removedItem) => {
          let jsonDate = date.toISOString();
          const agendaItem = removedItem.item;
          try {
            console.log('calling delete_single_item_of_date.', agendaItem);
            await invoke("delete_single_item_of_date", { date: jsonDate, item: agendaItem });
            console.log("Removed item from db", agendaItem);
          } catch (error) {
            console.error("Failed to fetch selected day items:", error);
          }
        });
        setRecentRemoved(recentRemoved[dateAsKey].filter(
          r => r.expiresAt > now
        ));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [dateAsKey, recentRemoved.length, recentRemoved]);

  const updateItemToBackend = async function (agendaItem) {
    try {
      let jsonDate = date.toISOString();
      console.log('calling update_single_item_of_date.', agendaItem);
      await invoke("update_single_item_of_date", { date: jsonDate, item: agendaItem });
      console.log("Update item from db", agendaItem);
    } catch (error) {
      console.error("Failed to update item.", error);
    }
  }

  function prepareAgendaItem(currentDate, userInput) {
    if (!userInput || userInput.trim() === "") {
      return null;
    }

    let currentDateAsKey = JustDate.toISOLikeDateString(currentDate);
    let lastId = items[currentDateAsKey].reduce((maxId, x) => x.id > maxId? x.id: maxId, 0);
    let title = getTitleOfAText(userInput);
    let description = userInput.length > Constants.MAX_CHARS_FOR_TITLE ? userInput: "";
    return convertUserInputToAgendaItem(currentDate, userInput, ++lastId, title, "Pending", description);
  }

  const handleRemove = function (dateKey, index, e) {
    let currentItems = [...items[dateKey]];
    const [removedItem] = currentItems.splice(index, 1);
    const removed = { item: removedItem, index: index, expiresAt: Date.now() + Constants.UNDO_DURATION_MS };

    setItems({ ...items, [dateKey]: currentItems });
    const currentRecentRemoved = recentRemoved[dateKey] ? [...recentRemoved[dateAsKey]] : [];
    currentRecentRemoved.push(removed);
    setRecentRemoved({ ...recentRemoved, [dateKey]: currentRecentRemoved });
    handleAgendaRemoveParent(dateKey, removedItem.id);
  };

  const handleUndo = function (dateKey, e) {
    const cloneRecentRemoved = [...recentRemoved[dateKey]];
    const lastRemoved = cloneRecentRemoved.pop();
    const newItems = items[dateKey] ? [...items[dateKey]] : [];
    newItems.splice(lastRemoved.index, 0, lastRemoved.item);
    setItems({ ...items, [dateKey]: newItems });
    setRecentRemoved({ ...recentRemoved, [dateKey]: cloneRecentRemoved });
    //agendaCache.set(dateAsKey, newCurrentItems);
    handleAgendaAddParent(selectedDate, lastRemoved.item, lastRemoved.index);
  };

  const handleMarkDone = function (dateKey, index, e) {
    const currentItems = [...items[dateKey]];
    currentItems[index].status = currentItems[index].status === "Done" ? "Pending" : "Done";
    setItems({ ...items, dateKey: currentItems });
    updateItemToBackend(currentItems[index]);
  };

  const handleAgendaEdit = function (dateKey, index, patch) {
    let prevItems = { ...items };
    const dayItems = prevItems[dateKey] || [];
    const oldItem = dayItems[index];
    if (oldItem) {
      const updatedItem = { ...oldItem, ...patch };
      const dayItemsClone = [...dayItems];
      dayItemsClone[index] = updatedItem;
      handleAgendaEditParent(dateKey, updatedItem.id, updatedItem);
      setItems({ ...prevItems, [dateKey]: dayItemsClone });
      updateItemToBackend(updatedItem);
    };
  }

  const handleNewAgendaItem = function (userInput) {
    let selectedDateAsKey = JustDate.toISOLikeDateString(date);
    let currentItems = [...items[selectedDateAsKey]];
    let newAgendaItem = prepareAgendaItem(date, userInput);
    if (newAgendaItem) {
      currentItems.push(newAgendaItem);
      setItems({ ...items, [selectedDateAsKey]: currentItems });
      handleAgendaAddParent(selectedDate, newAgendaItem);
    }
  };

  function scheduleAdd(textarea) {
    try {
      clearTimeout(saveTimerRef.current);
    } catch (e) { }
    saveTimerRef.current = setTimeout(() => {
      let userInput = textarea.value;
      handleNewAgendaItem(userInput);
      textarea.value = "";
    }, Constants.DEBOUNCE_DURATION);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleOnInput = function (e) {
    const target = e.target;
    const val = target.value;
    if (val && val.trim().length > 1) {
      scheduleAdd(target);
    }
  };
  const handleOnBlur = function (e) {
    const target = e.target;
    const val = target.val;
    if (val && val.trim().length > 1) {
      handleNewAgendaItem(val);
      target.value = "";
    }
  };
  const handleKeyDown = function (e) {
    const isModifierPressed = e.ctrlKey || e.metaKey;
    if (isModifierPressed) {
      const key = e.key.toLowerCase();
      const target = e.target;
      if (key === 'enter' || key === 's') {
        e.preventDefault();
        const val = target.value;
        if (val && val.trim().length > 1) {
          handleNewAgendaItem(val);
          target.value = "";
        }
      }
    }
  };

  const utcDateStringToLocaleTime = function (utcDateString) {
    const date = new Date(utcDateString);
    const time12hr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return time12hr;
  };

  const isMarkDone = function (item) {
    return item.status && item.status.toLowerCase() === "done";
  };

  return (
    <div className={`lg:block bg-base-100/90 border-l border-base-200 text-base-content max flex flex-col h-full overflow-y-auto bg-gradient-to-tl from-${settings && settings.backgroundShade}/10 to-base-100`}>
      <DayAgenda key={dateAsKey}
        selectedDateObj={dateObj}
        monthName={monthName}
        dayItems={items}
        recentRemoved={recentRemoved[dateAsKey]}
        onRemoveItem={handleRemove}
        onUndoRemove={handleUndo}
        onAgendaUpdate={handleAgendaAddParent}
        onMarkingItemDone={handleMarkDone}
        onAgendaEdit={handleAgendaEdit} />
      <div className="p-0 space-y-2 relative group card bg-base-100 shadow-md border border-base-300 mb-2">
        <div className="card-body p-4">
          <h4 className="card-title text-md">New agenda item:</h4>
          <textarea className="textarea w-auto textarea-ghost textarea-lg textarea-primary focus:outline-none focus:border-primary/70 focus:border-2"
            placeholder="Add new item for this day.."
            onInput={handleOnInput}
            onBlur={handleOnBlur}
            onKeyDown={handleKeyDown}>
          </textarea>
        </div>
      </div>
      {/* </div> */}
    </div>
  )
}

export default RightSection;