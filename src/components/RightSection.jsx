import { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/core";
import UndoIcon from './icons/Undo';
import useCache from '../hooks/useCache';
import DayAgenda from './DayAgenda';
import { getReminder } from '../utilities/reminderUtils';
import { Constants } from '../utilities/constants';
import JustDate from './../utilities/justDate';

function RightSection(props) {
  const year = props.year;
  const month = props.month;
  const monthName = props.monthName;
  const handleAgendaUpdate = props.onAgendaUpdate;
  const lastAgendaUpdate = props.lastAgendaUpdate;
  let selectedDate = props.selectedDate;
  let dateObj = new Date(year, month, selectedDate);
  let dateAsKey = JustDate.toISOLikeDateString(dateObj);
  console.log('dateasKey:', dateAsKey);
  //const [currentDate, setCurrentDate] = useState(selectedDate);
  const [date, setDate] = useState(dateObj);
  const [items, setItems] = useState({ [dateAsKey]: [] });
  const [recentRemoved, setRecentRemoved] = useState({ dateAsKey: [] });
  //const agendaCache = useCache(cacheTTL);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let dateObj = new Date(year, month, selectedDate);
    dateAsKey = JustDate.toISOLikeDateString(dateObj);
    setDate(dateObj);
    console.log('items in rs: ', items[dateAsKey]);
  }, [year, month, selectedDate]);

  useEffect(() => {
    async function fetchDayItems() {
      try {
        if (date) {
          //let date = new Date(year, month, selectedDate);
          //let agenda = agendaCache.get(dateAsKey);
          //if(!agenda){
          let jsonDate = date.toISOString();
          console.log('calling get_items_for_date.', jsonDate);
          const dayItems = await invoke("get_items_for_date", { date: jsonDate });
          console.log("Fetched selected day items:", dayItems);

          let selectedDateAsKey = JustDate.toISOLikeDateString(date);
          setItems({ ...items, [selectedDateAsKey]: dayItems });
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

  function mergeCurrentAndUpdatedAgendas(currentAgenda, updatedAgenda) {
    const mergedAgenda = currentAgenda.map(item1 => {
      const existingItem = updatedAgenda.find(item2 => item2.id === item1.id);
      // In case the updatedAgenda coming from Day, it may not have desc so skip and update other things.
      // So we update only title and 
      let currDescription = item1.description;
      let currStatus = item1.status;
      let updatedItem = existingItem ? { ...item1, ...existingItem } : item1;
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
      return { ...prevItems, 
        [selectedDateKey]: mergeCurrentAndUpdatedAgendas(currentItems, lastAgendaUpdate.agenda) };
    });
    //setItems({...items, [selectedDateKey]: mergedAgenda});
  }, [lastAgendaUpdate, date]);

  function convertUserInputToAgenda(currentDate, userInput) {
    if (!userInput || userInput.trim() === "") {
      return null;
    }
    let currentDateAsKey = JustDate.toISOLikeDateString(currentDate);
    console.log('converting user input to agenda:', currentDate);
    let extractedTimes = getReminder(userInput);
    let reminderTime = extractedTimes.reminder;
    currentDate.setHours(reminderTime.hour);
    currentDate.setMinutes(reminderTime.minute);
    let reminderDateTimeStr = currentDate.toISOString();
    let eventDateTimeStr = null;
    if (extractedTimes.event) {
      currentDate.setHours(extractedTimes.event.hour);
      currentDate.setMinutes(extractedTimes.event.minute);
      eventDateTimeStr = currentDate.toISOString();
    }
    let multipleSentences = userInput.match(Constants.SENTENCE_DETECTION);
    let title = multipleSentences ? multipleSentences[0] : userInput;
    let description = userInput;
    if (title.length > Constants.MAX_CHARS_FOR_TITLE) {
      title = title.substring(0, Constants.MAX_CHARS_FOR_TITLE);
    }
    return {
      id: items[currentDateAsKey].length + 1,
      user_input: userInput,
      title: title,
      description: description,
      status: "Pending",
      time: eventDateTimeStr,
      reminder: reminderDateTimeStr
    }
  }

  const handleRemove = function (dateKey, index, e) {
    //const target = e.currentTarget;
    //console.log(target);
    //if (target && target.attributes.name.value === 'removeItem') {
    let currentItems = [...items[dateKey]];
    const [removed] = currentItems.splice(index, 1);
    setItems({ ...items, dateKey: currentItems });
    //agendaCache.set(dateAsKey, currentItems);
    let currentRecentRemoved = [...recentRemoved[dateKey]];
    currentRecentRemoved.push(removed);
    setRecentRemoved({ ...recentRemoved, dateKey: currentRecentRemoved });
    //}
  };

  const handleUndo = function (dateKey, e) {
    const cloneRecentRemoved = [...recentRemoved[dateKey]];
    const lastRemoved = cloneRecentRemoved.pop();
    let newCurrentItems = [...items[dateKey], lastRemoved];
    setItems({ ...items, dateKey: newCurrentItems });
    setRecentRemoved({ ...recentRemoved, dateKey: cloneRecentRemoved });
    //agendaCache.set(dateAsKey, newCurrentItems);
  };

  const handleMarkDone = function (dateKey, index, e) {
    console.log(dateKey, index);
    const currentItems = [...items[dateKey]];
    currentItems[index].status = currentItems[index].status === "Done" ? "Pending" : "Done";
    setItems({ ...items, dateKey: currentItems });
    //agendaCache.set(dateAsKey, currentItems);
  };

  const handleNewAgendaItem = function (userInput) {
    console.log('adding new agenda currentdate:', date);
    let selectedDateAsKey = JustDate.toISOLikeDateString(date);
    let currentItems = [...items[selectedDateAsKey]];
    let newAgendaItem = convertUserInputToAgenda(date, userInput);
    if (newAgendaItem) {
      currentItems.push(newAgendaItem);
      setItems({ ...items, [selectedDateAsKey]: currentItems });
      handleAgendaUpdate(selectedDate, newAgendaItem);
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
    <div className="lg:block w-1/5 bg-base-100/90 border-l border-base-200 text-base-content max-h-full overflow-y-auto">
      <div className="text-xl p-2 border-b border-base-100">
        <h3 className="font-semibold text-base-content">{"Agenda: " + monthName + " " + selectedDate + ", " + year}</h3>
        {recentRemoved[dateAsKey] && recentRemoved[dateAsKey].length > 0 ?
          <button title="Undo remove"
            className="btn btn-ghost btn-xs rounded text-base-content/70 hover:text-base-content hover:bg-base-300"
            onClick={handleUndo}>
            <UndoIcon></UndoIcon>
          </button> : <></>}
      </div>
      <DayAgenda key={dateAsKey} selectedDateObj={dateObj} monthName={monthName} dayItems={items}
        onRemoveItem={handleRemove}
        onUndoRemove={handleUndo}
        onAgendaUpdate={handleAgendaUpdate}
        onMarkingItemDone={handleMarkDone} />
      {/* <div className="text-xl p-2 border-b border-base-100">
        <h3 className="font-semibold text-base-content">{"Agenda: " + monthName + " " + selectedDate + ", " + year}</h3>
        {recentRemoved.length > 0 ?
          <button title="Undo remove"
            className="btn btn-ghost btn-xs rounded text-base-content/70 hover:text-base-content hover:bg-base-300"
            onClick={handleUndo}>
            <UndoIcon></UndoIcon>
          </button> : <></>}
      </div> */}
      {/* {items.map((item, i) => (
        <AgendaCard
          key={year+month+selectedDate+i}
          keyId={year+month+selectedDate+i}
          index={i}
          title={item.title}
          status={item.status}
          description="I was saying to you multiple times, but you didn't listen."
          onCheckClick={handleMarkDone}
          onRemoveClick={handleRemove} />
      ))} */}
      <div className="p-2 space-y-4">
        {/* {items.map((item, index) => (
          <div key={index}
            className={
              "card bg-base-100 card-sm shadow-sm text-base-content " + (item.status === "Done" ? "opacity-50" : "")}>
            <div className="card-body p-1">
              <div className='flex'>
                <div className="basis-7/10 justify-left">
                </div>
                <div className="flex basis-3/10 justify-evenly">
                  <a className="link p-1 rounded hover:text-accent hover:bg-base-300">
                    <svg className="w-5 h-5" aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
                        d="M6 12h.01m6 0h.01m5.99 0h.01" />
                    </svg>
                  </a>

                  <a name="markDone" title={"Mark this as " + (isMarkDone(item) ? "undone." : "done.")}
                    className={"link p-1 rounded hover:text-accent hover:bg-base-300"}
                    onClick={(e) => handleMarkDone(index, e)}>
                    {isMarkDone(item) ?
                      <UndoIcon className="w-5 h-5"></UndoIcon>
                      : <CheckIcon className='w-5 h-5'></CheckIcon>}
                  </a>
                  <a name="removeItem" title="Remove this from agenda"
                    className={"link p-1 rounded hover:text-accent hover:bg-base-300" +
                      (item.status === "Done" ? " pointer-events-none opacity-50" : '')}
                    onClick={(e) => handleRemove(index, e)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <ContentEditable
                  key={index}
                  value={item.title}
                  onBlur={handleOnBlur}
                  onChange={handleOnInput}
                >
                  <h4 className={"card-title p-1 text-md " +
                    (item.status === "Done" ? "text-base-content/60" : "")}>
                    {item.title}
                  </h4>
                </ContentEditable>

              </div>
            </div>
          </div>
        ))} */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-2">
            <h4 className="card-title text-md">New Item:</h4>
            {/* <input type="text"
              className="input input-primary text-md input-md w-full max-w-xs bg-base-100 focus:outline-none focus:border-primary/70 focus:border-2"
              placeholder="Add new item for this day.."></input> */}
            <textarea className="textarea textarea-ghost textarea-lg textarea-primary focus:outline-none focus:border-primary/70 focus:border-2"
              placeholder="Add new item for this day.."
              onInput={handleOnInput}
              onBlur={handleOnBlur}
              onKeyDown={handleKeyDown}>
            </textarea>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSection;