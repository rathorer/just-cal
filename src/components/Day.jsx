import { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getReminder } from "../services/reminderDetectionService";
import { useUserSettings } from "../contexts/UserSettingsContext";
import { convertUserInputToAgendaItem } from "../services/userInputDetectionsService";

/**
 * Day component of Just calendar app. 
 * Its editable, let user enter their tasks/items/agendas in the form of list. 
 * Everything edited/rendered inside a Day goes to a unordered list, and inside a li element.
 * @param {*} props object contains, selected date as JustDate object, isToday, existingItems, onAgendaUpdate callback 
 * @returns Day component.
 */
function Day(props) {

  let date = props.date;//JustDate object
  let index = props.index;
  const isToday = props.isToday;
  let selectedDate = props.selectedDate;
  let handleAgendaUpdateToParent = props.onAgendaUpdate;

  const { settings } = useUserSettings();
  const settingsRef = useRef(settings);
  const existingItemsRef = useRef(props.items || []);
  const isDirtyRef = useRef(false);
  const [currentDate, setCurrentDate] = useState(date);
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const skipFirstEnterSaveRef = useRef(false);
  const h2Ref = useRef(null);
  const mutationObserverRef = useRef(null);
  const isObservingRef = useRef(false);
  const pendingBrowserInsertedLiCountRef = useRef(0);

  // Keep ref in sync with props for logic comparisons
  useEffect(() => {
    existingItemsRef.current = props.items || [];
  }, [props.items]);

  useEffect(() => {
    // Keep settings ref in sync
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    setCurrentDate(date);
    isDirtyRef.current = false;
  }, [date]);
  // function convertUserInputToItem(userInput, id, status = "Pending", description = "") {
  //   let extractedTimes = getReminder(userInput);
  //   let reminderTime = extractedTimes.reminder;
  //   currentDate.setHours(reminderTime.hour);
  //   currentDate.setMinutes(reminderTime.minute);
  //   let reminderDateTimeStr = currentDate.toISOString();
  //   let eventDateTimeStr = null;
  //   if (extractedTimes.event) {
  //     currentDate.setHours(extractedTimes.event.hour);
  //     currentDate.setMinutes(extractedTimes.event.minute);
  //     eventDateTimeStr = currentDate.toISOString();
  //   }
  //   return {
  //     id: id,
  //     user_input: userInput,
  //     title: userInput,
  //     description: description,
  //     status: status,
  //     time: eventDateTimeStr,
  //     reminder: reminderDateTimeStr
  //   }
  // }

  function prepareAgendaItems(items) {
    items = items.filter(x => x);//Filtering undefined ones
    //Our newItems (edited by user) has old items and new ones, new ones will have id as undefined.
    const oldItemsMap = new Map(existingItemsRef.current.map(item => [item.id, item]));
    let lastId = existingItemsRef.current.length > 0 ? Math.max(...oldItemsMap.keys()) : 0;

    const preparedItems = items.map((newItem, i) => {
      if (newItem.id === undefined) {//This means it is new item
        return convertUserInputToAgendaItem(currentDate, newItem.user_input, ++lastId);
      } else {
        const oldItem = oldItemsMap.get(newItem.id);
        if (oldItem && oldItem.user_input !== newItem.user_input) {
          // Edited item
          //Anything update here, will update the title.
          let title = newItem.user_input;
          return convertUserInputToAgendaItem(currentDate, newItem.user_input, oldItem.id, title, oldItem.status, oldItem.description);
        } else if (oldItem) {
          // Unchanged item
          return oldItem;
        } else {//TODO: remove this before release.
          console.error("It shouldn't be here, we already filtered undefined ones.");
          return null;
        }
      }
    });
    return preparedItems;
  }

  // useEffect(() => {
  //   async function fetchDayItems(date) {
  //     try {
  //       if (date) {
  //         //const utcDateString = date.toISOString();
  //         //console.log('in day: ', date);
  //         //const dayItems = await invoke("get_items_for_date", { date });
  //         //console.log("Fetched date items:", dayItems);
  //         //setTasks(dayItems);
  //         //tasksRef.current = dayItems;
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch day items:", error);
  //     }
  //   }
  //   if (selectedDate && date) {
  //     fetchDayItems(date);
  //   }
  // }, [selectedDate]);

  function disconnectMutationObserver() {
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }
    isObservingRef.current = false;
    pendingBrowserInsertedLiCountRef.current = 0;
  }

  function stripGeneratedLiAttributes(li) {
    let id = li.getAttribute("data-id");
    console.log('browser inserted remove data-id', id);
    li.removeAttribute("data-id");
    li.removeAttribute("data-index");
  }

  function getAddedLiNodes(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    const liNodes = [];
    if (node.nodeName === "LI") {
      liNodes.push(node);
    }
    node.querySelectorAll('li').forEach((li) => liNodes.push(li));
    return liNodes;
  }

  function connectMutationObserver() {
    if (isObservingRef.current) {
      return;
    }

    const root = editorRef.current;
    if (!root) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      console.log('in mutation observer', mutations);
      if (!pendingBrowserInsertedLiCountRef.current) {
        return;
      }

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          const liNodes = getAddedLiNodes(node);
          for (const li of liNodes) {
            if (!pendingBrowserInsertedLiCountRef.current) {
              return;
            }
            stripGeneratedLiAttributes(li);
            pendingBrowserInsertedLiCountRef.current -= 1;
          }
        }
      }
    });

    mutationObserverRef.current = observer;
    observer.observe(root, { childList: true, subtree: true });
    isObservingRef.current = true;
  }

  useEffect(() => {
    return () => {
      disconnectMutationObserver();
    };
  }, []);

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
    const debounceTime = settingsRef.current?.debounceDuration || 500; // fallback to 500ms
    saveTimerRef.current = setTimeout(() => {
      handleSave(ul);
    }, debounceTime);
  }

  function getItemsFromUl(ul) {
    if (!ul) {
      return [];
    }
    return Array.from(ul.querySelectorAll('li'))
      .flatMap((li, idx) => {

        let text = li.innerText;
        text = text && text.trim();
        if (text && text.length > 0) {
          // Extract id from data attribute, or use undefined for new items
          const itemId = li.getAttribute('data-id');
          return [{
            id: itemId ? parseInt(itemId) : undefined,
            index: parseInt(li.getAttribute('data-index') || idx) || undefined,
            user_input: text
          }];
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
      if (dayItemsChanged(items, existingItemsRef.current)) {
        isDirtyRef.current = true;
        //existingItemsRef.current = items;//update new item
        const backendItems = prepareAgendaItems(items);
        try {
          disconnectMutationObserver();
          console.log('save_items_for_date', backendItems);
          const resp = await invoke("save_items_for_date", { date: date.toISOString(), items: backendItems });
          //Send event
          handleAgendaUpdateToParent(date, backendItems);
          isDirtyRef.current = false;
          // Update asterisk indicator in DOM without re-rendering
          if (h2Ref.current) {
            updateAsteriskIndicator(h2Ref.current, false);
          }
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
          if (!currEl && !oldEl) {
            continue;
          }
          // oldEl is now an Item object with user_input property
          const oldElText = oldEl && oldEl.user_input ? oldEl.user_input : oldEl;
          const currText = currEl.user_input;
          if (currText !== oldElText) {
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

  const handleInput = useCallback((e) => {
    const ul = e.currentTarget.querySelector('ul') || (editorRef.current && editorRef.current.firstChild);
    if (ul) {
      const items = getItemsFromUl(ul);
      const hasChanged = dayItemsChanged(items, existingItemsRef.current);
      const wasDirty = isDirtyRef.current;

      // Update dirty state and DOM asterisk directly - NO setState
      isDirtyRef.current = hasChanged;
      if (wasDirty !== hasChanged && h2Ref.current) {
        updateAsteriskIndicator(h2Ref.current, hasChanged);
      }
      if(isDirtyRef.current){
        scheduleSave(ul);
      }
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    let ul = editorRef.current && editorRef.current.firstChild;
    if (e.key === 'Enter') {
      // Browsers often handle Enter in a <ul> by creating a new <li> automatically.
      // If you are outside a list, you can force it:
      if (!document.queryCommandState('insertUnorderedList')) {
        e.preventDefault();
        document.execCommand('insertUnorderedList');
      }

      /* Start ToBeTested: Below code is overriding the browser's default behaviour and inserting Li
       manually. This is working fine for now. When prev LI was not empty, browser creates LI,
       When prev LI was empty, we create LI here manually.
       This solves user hit Enter on empty LI (2 times Enter) takes user outside of ul
       */
      const selection = window.getSelection();
      const selectionNode = selection.anchorNode;
      const currentLi =
        selectionNode && selectionNode.closest && selectionNode.closest('li');

      if (currentLi && (currentLi.innerText === '' || currentLi.innerText === '\n')) {
        // If in an empty li, don't let browser remove it. Instead, create a new li.
        e.preventDefault();
        const newLi = document.createElement('li');
        newLi.innerHTML = '<br>';
        currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
        console.log('adding new li');
        // Move cursor to the new li
        const range = document.createRange();
        range.selectNodeContents(newLi);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      /* End ToBeTested*/

      //connectMutationObserver();
      //pendingBrowserInsertedLiCountRef.current += 1;

      if (skipFirstEnterSaveRef.current) {
        skipFirstEnterSaveRef.current = false;
        return;
      }
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
        const hasChanged = dayItemsChanged(items, existingItemsRef.current);
        const wasDirty = isDirtyRef.current;

        isDirtyRef.current = hasChanged;

        if (wasDirty !== hasChanged && h2Ref.current) {
          updateAsteriskIndicator(h2Ref.current, hasChanged);
        }
        scheduleSave(ul);
      }
    }
  }, []);

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

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    // Get text without formatting to prevent XSS and layout breakage
    const text = e.clipboardData.getData('text/plain');
    insertTextAtCursor(text);
    const ul = editorRef.current && editorRef.current.firstChild;
    if (ul) {
      const items = getItemsFromUl(ul);
      const hasChanged = dayItemsChanged(items, existingItemsRef.current);
      if (hasChanged) {
        const wasDirty = isDirtyRef.current;
        isDirtyRef.current = true;
        if (!wasDirty && h2Ref.current) {
          updateAsteriskIndicator(h2Ref.current, true);
        }
        scheduleSave(ul);
      }
    }
  }, []);

  const handleFocus = useCallback((e) => {
    const ul = editorRef.current.querySelector("ul");
    //If somehow ul got removed, add it back
    if (!ul) {
      e.currentTarget.innerHTML = '<ul className="mt-2 flex flex-col p-1 gap-1 text-sm leading-none text-base-content"></ul>';
    }
    //If no li inside ul, add first one and focus on it, edit range so user types inside li.
    if (ul && ul.children.length === 0) {
      addFirstLiAndFocus(ul);
    }
    if (ul && ul.children.length > 0 && existingItemsRef.current.length > 0) {
      skipFirstEnterSaveRef.current = true;
    }
    handleDayClick(e);
  }, []);

  //Update asterisk indicator in the DOM without re-rendering
  const updateAsteriskIndicator = (h2, isDirty) => {
    const existingAsterisk = h2.querySelector('span.ml-1');
    if (isDirty && !existingAsterisk) {
      const span = document.createElement('span');
      span.className = 'ml-1 text-base-content';
      span.textContent = '*';
      h2.appendChild(span);
    } else if (!isDirty && existingAsterisk) {
      existingAsterisk.remove();
    }
  };

//TODO: needs to be fixed to take the ul of prev not the current.
  const handleBlur = useCallback((e) => {
    disconnectMutationObserver();
    //remove li if it is the only one and no text inside it.
    const ul = editorRef.current.querySelector('ul');
    if (ul && ul.childElementCount === 1) {
      let li = ul.firstChild;
      if (li.innerText === '' || li.innerText === '\n') {
        ul.removeChild(li);
      }
    }
    //Get all items and update;
    if (ul) {
      if (isDirtyRef.current) {
        handleSave(ul);
      }
    }
  }, []);

  const itemsRenderKey = useMemo(() => {
    const items = props.items || [];
    const payload = items.map(item => `${item.id}:${item.user_input}`).join('|');
    return `${date?.getTime() ?? 'nodate'}-${items.length}-${payload}`;
  }, [date, props.items]);

  return (
    <div key={index}
      className={"p-0 flex flex-col hover:cursor-text h-full"
        + (date && date.getDate() === selectedDate ? " border-1 !border-info/80" : "")
        + (index >= 28 ? "border-1 border-r border-base-content/20" : "")}//this is to avoid right border
    //  missing in last div, 28 index tells the last line has items.
    >
      {date && (<>
        <a className={"link inline-block p-0 bg-base-100/20 rounded hover:text-accent hover:bg-base-300 " +
          (date && date.getDayName() === "Sunday" ? 'text-error/80' : '')}>
          <h2 ref={h2Ref} className={"text-xl pt-1 pr-2 font-bold flex justify-end " + (isToday ? "bg-info/20" : "") +
            (date && date.getDate() === selectedDate ?
              "text-info-content/90 bg-info/80 hover:text-info-content hover:bg-info " : "")}
            onClick={handleDayClick}>
            {date.getDate()}
          </h2></a>
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
          <ul key={itemsRenderKey} className="mt-1 flex flex-col p-1 gap-1 text-sm leading-none text-base-content">
            {console.log('rendering.. ', props.items)}
            {(props.items || []).length > 0 && (props.items || []).map((task, index) => (

              <li key={task.id} data-id={task.id} data-index={index}>
                {/* <CheckIcon className="w-4 h-4" /> */}
                {task.user_input}
              </li>
            ))}
          </ul>
        </div>
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
  
  // Deep compare items - check actual content, not reference
  if (prevItems.length !== nextItems.length) {
    return false;
  }
  for (let i = 0; i < prevItems.length; i++) {
    // Compare user_input field since items are now Item objects
    const prevUserInput = prevItems[i] && prevItems[i].user_input ? prevItems[i].user_input : prevItems[i];
    const nextUserInput = nextItems[i] && nextItems[i].user_input ? nextItems[i].user_input : nextItems[i];
    if (prevUserInput !== nextUserInput) {
      return false;
    }
  }

  return true;
}

export default memo(Day, areEqual);
