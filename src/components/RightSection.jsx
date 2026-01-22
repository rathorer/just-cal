import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import CheckIcon from './icons/check';
import UndoIcon from './icons/Undo';

function RightSection(props) {
  const month = props.month;
  const monthName = props.monthName;
  const year = props.year;
  let selectedDate = props.selectedDate;
  console.log(selectedDate);
  let dateObj = new Date(year, month, selectedDate);
  //const [currentDate, setCurrentDate] = useState(selectedDate);
  const [date, setDate] = useState(dateObj);
  const [items, setItems] = useState([]);
  const [recentRemoved, setRecentRemoved] = useState([]);

  useEffect(() => {
    async function fetchDayItems() {
      try {
        if (date) {
          let date = new Date(year, month, selectedDate);
          console.log('calling get_items_for_date.', date);
          const dayItems = await invoke("get_items_for_date", { date });
          console.log("Fetched selected day items:", dayItems);
          setItems(dayItems);
        }
      } catch (error) {
        console.error("Failed to fetch selected day items:", error);
      }
    }
    fetchDayItems();
  }, [date, selectedDate]);

  const handleRemove = function (index, e) {
    const target = e.currentTarget;
    console.log(target);
    if (target && target.attributes.name.value === 'removeItem') {
      let currentItems = [...items];
      const [removed] = currentItems.splice(index, 1);
      setItems(currentItems);
      setRecentRemoved([...recentRemoved, removed]);
    }
  };

  const handleUndo = function (e) {
    const cloneRecentRemoved = [...recentRemoved];
    const lastRemoved = cloneRecentRemoved.pop();
    setItems([...items, lastRemoved]);
    setRecentRemoved(cloneRecentRemoved);
  };

  const handleMarkDone = function (index, e) {
    console.log(index);
    const currentItems = [...items];
    currentItems[index].status = currentItems[index].status === "Done" ? "Pending" : "Done";
    setItems(currentItems);
    console.log(currentItems);
    // setItems(prevItems => prevItems.map((item, idx) =>
    //   idx === index ? { ...item, status: "Done" } : item
    // ));
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
    <div className="hidden lg:block w-1/5 bg-base-100/90 border-l border-base-200 text-base-content">
      <div className="text-xl p-2 border-b border-base-100">
        <h3 className="font-semibold text-base-content">{"Agenda: " + monthName + " " + selectedDate + ", " + year}</h3>
        {recentRemoved.length > 0 ?
          <a title="Undo remove"
            className="link rounded hover:text-accent hover:bg-base-300"
            onClick={handleUndo}>
            <UndoIcon></UndoIcon>
          </a> : <></>}
      </div>

      <div className="p-2 space-y-4 overflow-y-auto h-full">
        {items.map((item, index) => (
          <div key={index}
            className={
              "card bg-base-100 card-sm shadow-sm text-base-content " + (item.status === "Done" ? "opacity-50" : "")}>
            <div className="card-body p-2">
              <div className='flex'>
                <div className="basis-7/10">
                  <span className="text-sm">{utcDateStringToLocaleTime(item.reminder)}</span>
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
                <h4 className={"card-title text-md " +
                  (item.status === "Done" ? "text-base-content/60" : "")}>
                  {item.title}
                </h4>
              </div>
              {/* <textarea className="textarea input-primary textarea-bordered min-h-20 focus:outline-none focus:border-primary/70 focus:border-2" placeholder='Add more details..' defaultValue={item.description}></textarea> */}
              {/* <p className="text-sm">{item.status}</p> */}
            </div>
          </div>
        ))}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-2">
            <h4 className="card-title text-md">New Item:</h4>
            <input type="text"
              className="input input-primary text-md input-md w-full max-w-xs bg-base-100 focus:outline-none focus:border-primary/70 focus:border-2"
              placeholder="Add new item for this day.."></input>
          </div>
        </div>
        {/* Add more sidebar items as needed */}
      </div>
    </div>
  )
}

export default RightSection;