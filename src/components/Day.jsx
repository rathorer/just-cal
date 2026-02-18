import { useState, useEffect, useRef, memo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Constants } from "../utilities/constants";
import CheckIcon from "./icons/check";
import { getReminder } from "../utilities/reminderUtils";

//import { DayPicker } from "react-day-picker";

function Day(props) {
  const [greetMsg, setGreetMsg] = useState("");
  let date = props.date;//JustDate object
  let index = props.index;
  const isToday = props.isToday;
  let selectedDate = props.selectedDate;
  let existingItems = props.items || [];
  let handleAgendaUpdateToParent = props.onAgendaUpdate;
  //const onDayItemUpdate = 

  const tasksRef = useRef(existingItems);
  const [isDirty, setIsDirty] = useState(false)
  const [currentDate, setCurrentDate] = useState(date);
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const skipFirstEnterSaveRef = useRef(false);

  useEffect(() => {
    setCurrentDate(date);
    setIsDirty(false);
  }, [date]);

  // useEffect(() => {
  //   // Set a timeout to update the debounced value after 500ms
  //   const delayInputTimeoutId = setTimeout(() => {
  //     setDebouncedInputValue(inputValue);
  //   }, 500); // 500 milliseconds delay

  //   // Cleanup function to clear the timeout if the input value changes
  //   // before the delay is complete. This resets the timer on every keystroke.
  //   return () => clearTimeout(delayInputTimeoutId);
  // }, [])

  function prepareItems(items) {
    //let selectedDateObj = new JustDate(currentDate);
    items = items.filter(x => x);
    return items.map((item, i) => {
      let extractedTimes = getReminder(item);
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
      return {
        id: i + 1,
        user_input: item,
        title: item,
        description: "",
        status: "Pending",
        time: eventDateTimeStr,
        reminder: reminderDateTimeStr
      }
    });
  }

  useEffect(() => {
    async function fetchDayItems(date) {
      try {
        if (date) {
          //const utcDateString = date.toISOString();
          //console.log('in day: ', date);
          //const dayItems = await invoke("get_items_for_date", { date });
          //console.log("Fetched date items:", dayItems);
          //setTasks(dayItems);
          //tasksRef.current = dayItems;
        }
      } catch (error) {
        console.error("Failed to fetch day items:", error);
      }
    }
    if (selectedDate && date) {
      fetchDayItems(date);
    }
  }, [selectedDate]);


  const handleDayClick = (event, t) => {
    //console.log(event);
    let h2 = event && event.target;//.children
    //console.log(h2.tagName);
    if (h2 && h2.tagName === 'H2' || h2.tagName === "DIV") {
      props.handleSelectedDate(date.getDate());
    }
  };

  function scheduleSave(ul) {
    try {
      clearTimeout(saveTimerRef.current);
    } catch (e) { }
    saveTimerRef.current = setTimeout(() => {
      handleSave(ul);
    }, Constants.DEBOUNCE_DURATION);
  }

  function getItemsFromUl(ul) {
    if (!ul) {
      return [];
    }
    return Array.from(ul.querySelectorAll('li'))
      .flatMap(li => {
        let text = li.innerText;
        text = text && text.trim();
        if (text && text.length > 0) {
          return [text];
        }
        return [];
      });
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleSave = async (ul) => {
    if (ul) {
      const items = getItemsFromUl(ul);
      console.log('items before saving:', items);
      if (dayItemsChanged(items, existingItems)) {
        setIsDirty(true);
        tasksRef.current = items;//update new item
        //todo:Lets save to localStorage first and fire a request to save at backend
        const backendItems = prepareItems(items);
        try {
          console.log('save_items_for_date', backendItems);
          const resp = await invoke("save_items_for_date", { date: date.toISOString(), items: backendItems });
          //Send event
          handleAgendaUpdateToParent(date, backendItems);
          setIsDirty(false);
        } catch (error) {
          console.error('Error while saving..', error);
        }
      }
    }
  };

  const dayItemsChanged = (items, oldItems) => {
    if (items) {
      if (oldItems.length === items.length) {
        //lets check each item.
        for (let i = 0; i < items.length; i++) {
          const currEl = items[i];
          const oldEl = oldItems[i];
          if (!currEl && !oldItems) {
            continue;
          }
          if (currEl !== oldEl) {
            return true;
          }
        }
        return false;
      } else {
        return true;
      }
    } else if (oldItems && oldItems.length > 0) {
      return true;
    }
    return true;
  };

  //Content editable handling
  const addFirstLiAndFocus = (ul) => {
    const li = document.createElement("li");
    ul.appendChild(li);
    li.innerHTML = '<br>';
    const range = document.createRange();
    range.selectNodeContents(li);
    range.setStart(li, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    li.focus();
  };
  //This is intentionally not being called. firstLi gets added onFocus, but if in future 
  // there is some case where onFocus doesn't get called, use beforeInput.
  const beforeInput = (e) => {
    //check if editor has ul and empty li, if not add
    let ul = e.currentTarget.querySelector('ul');
    if (!ul) {
      e.currentTarget.innerHTML = '<ul className="mt-2 flex flex-col p-1 gap-1 text-sm leading-none text-base-content"></ul>';
    }
    if (ul && ul.childElementCount === 0) {
      addFirstLiAndFocus(ul);
    }
  };

  const handleInput = (e) => {
    const ul = e.currentTarget.querySelector('ul') || (editorRef.current && editorRef.current.firstChild);
    if (ul) {
      const items = getItemsFromUl(ul);
      if (dayItemsChanged(items, existingItems)) {
        setIsDirty(true);
      }
      scheduleSave(ul);
    }
  };

  const handleKeyDown = (e) => {
    let ul = editorRef.current && editorRef.current.firstChild;
    if (e.key === 'Enter') {
      // Browsers often handle Enter in a <ul> by creating a new <li> automatically.
      // If you are outside a list, you can force it:
      if (!document.queryCommandState('insertUnorderedList')) {
        e.preventDefault();
        document.execCommand('insertUnorderedList');
      }
      //take the prev li and insert into our tasks
      if (skipFirstEnterSaveRef.current) {
        skipFirstEnterSaveRef.current = false;
        return;
      }
      if (ul) {
        const items = getItemsFromUl(ul);
        if (dayItemsChanged(items, existingItems)) {
          setIsDirty(true);
        }
      }
      handleSave(ul);
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const ul = editorRef.current && editorRef.current.firstChild;
      if (ul) {
        let isLast = ul.childElementCount === 1 &&
          (ul.firstChild.innerText === '' || ul.firstChild.innerText === '\n');
        if (isLast) {
          e.preventDefault();
        }
        const items = getItemsFromUl(ul);
        if (dayItemsChanged(items, existingItems)) {
          setIsDirty(true);
        }
        scheduleSave(ul);
      }
    }
  };

  const insertTextAtCursor = (text) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents(); // Clear any selected text

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  const handlePaste = (e) => {
    e.preventDefault();
    // Get text without formatting to prevent XSS and layout breakage
    const text = e.clipboardData.getData('text/plain');
    insertTextAtCursor(text);
    const ul = editorRef.current && editorRef.current.firstChild;
    if (ul) {
      const items = getItemsFromUl(ul);
      if (dayItemsChanged(items, existingItems)) {
        setIsDirty(true);
      }
      scheduleSave(ul);
    }
  };

  const handleFocus = (e) => {
    const ul = editorRef.current.querySelector("ul");
    //If somehow ul got removed, add it back
    if (!ul) {
      e.currentTarget.innerHTML = '<ul className="mt-2 flex flex-col p-1 gap-1 text-sm leading-none text-base-content"></ul>';
    }
    //If no li inside ul, add first one and focus on it, edit range so user types inside li.
    if (ul && ul.children.length === 0) {
      addFirstLiAndFocus(ul);
    }
    if (ul && ul.children.length > 0 && existingItems.length > 0) {
      skipFirstEnterSaveRef.current = true;
    }
    handleDayClick(e);
  };

  //TODO: needs to be fixed to take the ul of prev not the current.
  const handleBlur = (e) => {
    //remove li if it is last one
    //const ul = e.currentTarget.querySelector('ul');
    const ul = editorRef.current.querySelector('ul');
    if (ul && ul.childElementCount === 1) {
      let li = ul.firstChild;
      if (li.innerText === '' || li.innerText === '\n') {
        ul.removeChild(li);
      }
    }
    //Get all items and update;
    if (ul) {
      if (isDirty) {
        handleSave(ul);
      }
    }
  };

  return (
    <div key={index}
      className={"p-0 flex flex-col hover:cursor-text h-full"
        + (date && date.getDate() === selectedDate ? " border-1 !border-info/80" : "")
        + (index >= 28 ? "border-1 border-r border-base-content/20" : "")}//this is to avoid right border
    //  missing in last div, 28 index tells the last line has items.
    >
      {date && (<>
        <a className={"link inline-block p-0 bg-base-200/90 rounded hover:text-accent hover:bg-base-300 " +
          (date && date.getDayName() === "Sunday" ? 'text-error/80' : '')}>
          <h2 className={"text-xl pt-1 pr-2 font-bold flex justify-end " + (isToday ? "bg-info/20": "") +
            (date && date.getDate() === selectedDate ?
              "text-info-content/90 bg-info/80 hover:text-info-content hover:bg-info " : "")}
            onClick={handleDayClick}>
            {date.getDate()}
            {isDirty ? <span className="ml-1 text-base-content">*</span> : null}
          </h2></a>
        {/* <div className="card bg-base-100">*/}
        <div id={"editable-div-" + index} key={index}
          className="overflow-y-auto min-h-auto max-h-full no-scrollbar p-0 text-xxs focus:ring-0 outline-none custom-editor"
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <ul className="mt-1 flex flex-col p-1 gap-1 text-sm leading-none text-base-content">
            {existingItems && existingItems.length > 0 && existingItems.map((task, index) => (
              <li key={index}>
                {/* <CheckIcon className="w-4 h-4" /> */}
                {task}
              </li>
            ))}
          </ul>
        </div>
        {/* </div> */}
      </>)}
    </div>
  );
}

function areEqual(prevProps, nextProps) {
  const prevDate = prevProps.date;
  const nextDate = nextProps.date;
  const prevDateTime = prevDate ? prevDate.getTime() : null;
  const nextDateTime = nextDate ? nextDate.getTime() : null;

  if (prevDateTime !== nextDateTime) {
    return false;
  }
  const prevSelected = prevProps.date?.getDate() === prevProps.selectedDate;
  const nextSelected = nextProps.date?.getDate() === nextProps.selectedDate;

  if (prevSelected !== nextSelected) {
    return false;
  }

  const prevItems = prevProps.items || [];
  const nextItems = nextProps.items || [];
  if (prevItems.length !== nextItems.length) {
    return false;
  }
  for (let i = 0; i < prevItems.length; i++) {
    if (prevItems[i] !== nextItems[i]) {
      return false;
    }
  }

  return true;
}

export default memo(Day, areEqual);
