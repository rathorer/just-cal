import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import CheckIcon from "./icons/check";

//import { DayPicker } from "react-day-picker";

export default function Day(props) {
  const [greetMsg, setGreetMsg] = useState("");
  let date = props.date;
  let index = props.index;
  let selectedDate = props.selectedDate;

  // const [date, setDate] = useState(currentDate);
  const [tasks, setTasks] = useState([]);
  const tasksRef = useRef([]);
  const [isDirty, setIsDirty] = useState(false)
  const editorRef = useRef(null);
  const [debounced, setDebounced] = useState('')

  // useEffect(() => {
  //   // Set a timeout to update the debounced value after 500ms
  //   const delayInputTimeoutId = setTimeout(() => {
  //     setDebouncedInputValue(inputValue);
  //   }, 500); // 500 milliseconds delay

  //   // Cleanup function to clear the timeout if the input value changes
  //   // before the delay is complete. This resets the timer on every keystroke.
  //   return () => clearTimeout(delayInputTimeoutId);
  // }, [])

  useEffect(() => {
    async function fetchDayItems() {
      try {
        if (date) {
          const dayItems = await invoke("fetch_day_items", { date });
          //console.log("Fetched day items:", dayItems);
          setTasks(dayItems);
          tasksRef.current = dayItems;
        }
      } catch (error) {
        console.error("Failed to fetch day items:", error);
      }
    }
    fetchDayItems();
  }, []);

  const handleDayClick = (event, t) => {
    console.log(event);
    let h2 = event && event.target;//.children
    console.log(h2.tagName);
    if (h2 && h2.tagName === 'H2') {
      alert(date + ' ' + h2.innerText);
    }
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      // Clear the previous timeout if the function is called again
      clearTimeout(timeout);
      // Set a new timeout
      timeout = setTimeout(() => {
        // Execute the original function after the wait period
        func.apply(context, args);
      }, wait);
    };
  }

  const handleSave = (ul) => {
    if (ul) {
      const items = Array.from(ul.querySelectorAll('li'))
        .flatMap(li => {
          let text = li.innerText;
          text = text && text.trim();
          if(text && text.length > 0){
            return [text];
          }
          return [];
        });
      if (dayItemsChanged(items)) {
        setIsDirty(true);
        tasksRef.current = items;//update new item
        //todo:Save
        let d = new Date();
        console.log('Saving data...', items, d.getMinutes() + ":" + d.getSeconds());
      }
    }
  };
  const delayedSave = debounce(handleSave, 1500);

  const dayItemsChanged = (items) => {
    let oldItems = tasksRef.current;
    if (items) {
      if (oldItems.length === items.length) {
        //lets check each item.
        for (let i = 0; i < items.length; i++) {
          const currEl = items[i];
          const oldEl = oldItems[i];
          if(!currEl && !oldItems){
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
        delayedSave(ul);
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
  };

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
      handleSave(ul);
    }
  };

  return (
    <div key={index}
      className={"p-0 h-42 flex flex-col " + (date && date.getDate() === selectedDate ? " " : "")}
    >
      {date && (<>
        <a className={"link inline-block p-0 bg-base-200 rounded hover:text-accent hover:bg-base-300 " + (date && date.getDayName() === "Sunday" ? 'link-secondary' : '')}>
          <h2 className={"text-2xl pt-1 pr-2 font-bold flex justify-end " + (date && date.getDate() === selectedDate ? "text-info-content bg-info" : "")}
            onClick={handleDayClick}>{date.getDate()}</h2></a>
        {/* <div className="card bg-base-100">*/}
        <div id={"editable-div-" + index} key={index} className="overflow-y-auto min-h-10 max-h-30 no-scrollbar p-0 text-xxs focus:outline-1 custom-editor"
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          // onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <ul className="mt-2 flex flex-col p-1 gap-1 text-sm leading-none text-base-content">
            {tasks && tasks.length > 0 && tasks.map((task, index) => (
              <li key={index}>
                {/* <CheckIcon className="w-4 h-4" /> */}
                {task.item}
              </li>
            ))}
          </ul>
        </div>
        {/* </div> */}
      </>)}
    </div>
  );
}
