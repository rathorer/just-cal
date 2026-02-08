import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import CheckIcon from './icons/check';
import UndoIcon from './icons/Undo';
import Editable, { ContentEditable } from './ContentEditable';
import AgendaCard from './AgendaCard';
import useCache from '../hooks/useCache';
import DayAgenda from './DayAgenda';

function RightSection(props) {
  const cacheTTL = 30*1000;//30 seconds;
  const year = props.year;
  const month = props.month;
  const monthName = props.monthName;
  let selectedDate = props.selectedDate;
  console.log(selectedDate);
  const dateAsKey = `${year}-${month}-${selectedDate}`;
  let dateObj = new Date(year, month, selectedDate);
  console.log('dateasKey:', dateAsKey);
  //const [currentDate, setCurrentDate] = useState(selectedDate);
  const [date, setDate] = useState(dateObj);
  const [items, setItems] = useState({[dateAsKey]:[]});
  const [recentRemoved, setRecentRemoved] = useState({dateAsKey:[]});
  const agendaCache = useCache(cacheTTL);

  useEffect(() => {
    setDate(dateObj);
    console.log('items in rs: ', items);
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
            const dayItems = await invoke("get_items_for_date", { date:jsonDate });
            console.log("Fetched selected day items:", dayItems);
            
            setItems({...items, [dateAsKey]: dayItems});
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

  const handleRemove = function (dateKey, index, e) {
    //const target = e.currentTarget;
    //console.log(target);
    //if (target && target.attributes.name.value === 'removeItem') {
      let currentItems = [...items[dateKey]];
      const [removed] = currentItems.splice(index, 1);
      setItems({...items, dateKey:currentItems});
      //agendaCache.set(dateAsKey, currentItems);
      let currentRecentRemoved = [...recentRemoved[dateKey]];
      currentRecentRemoved.push(removed);
      setRecentRemoved({...recentRemoved, dateKey:currentRecentRemoved});
    //}
  };

  const handleUndo = function (dateKey, e) {
    const cloneRecentRemoved = [...recentRemoved[dateKey]];
    const lastRemoved = cloneRecentRemoved.pop();
    let newCurrentItems = [...items[dateKey], lastRemoved];
    setItems({...items, dateKey:newCurrentItems});
    setRecentRemoved({...recentRemoved, dateKey:cloneRecentRemoved});
    //agendaCache.set(dateAsKey, newCurrentItems);
  };

  const handleMarkDone = function (dateKey, index, e) {
    console.log(dateKey, index);
    const currentItems = [...items[dateKey]];
    currentItems[index].status = currentItems[index].status === "Done" ? "Pending" : "Done";
    setItems({...items, dateKey:currentItems});
    //agendaCache.set(dateAsKey, currentItems);
  };

  const handleOnInput = function (target) {
    console.log('in on input', target);
  };
  const handleOnBlur = function (target) {
    console.log('in on blur', target);
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
            <input type="text"
              className="input input-primary text-md input-md w-full max-w-xs bg-base-100 focus:outline-none focus:border-primary/70 focus:border-2"
              placeholder="Add new item for this day.."></input>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSection;