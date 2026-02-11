import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import CheckIcon from './icons/check';
import UndoIcon from './icons/Undo';
import Editable, { ContentEditable } from './ContentEditable';
import AgendaCard from './AgendaCard';
import useCache from '../hooks/useCache';
import JustDate from '../utilities/justDate';

function DayAgenda(props) {
  let selectedDateObj = props.selectedDateObj;
  let dayAgendaItems = props.dayItems;
  let monthName = props.monthName;
  const onRemoveItem = props.onRemoveItem;
  const onMarkingItemDone = props.onMarkingItemDone;
  const onUndoRemove = props.onUndoRemove;

  let year = selectedDateObj.getFullYear(),
    month = selectedDateObj.getMonth(),
    selectedDate = selectedDateObj.getDate();
  const dateAsKey = JustDate.toISOLikeDateString(selectedDateObj);
  //const items = dayAgendaItems?.[dateAsKey] ?? [];
  //const [currentDate, setCurrentDate] = useState(selectedDate);

  const [date, setDate] = useState(selectedDateObj);
  const [items, setItems] = useState(dayAgendaItems[dateAsKey]);
  //const [recentRemoved, setRecentRemoved] = useState({});

  useEffect(()=> {
    console.log('dayitems: ', dayAgendaItems[dateAsKey]);
    setItems(dayAgendaItems[dateAsKey]);
  },[dayAgendaItems]);

  const handleRemove = function (index, e) {
    const target = e.currentTarget;
    console.log(target);
    if (target && target.attributes.name.value === 'removeItem') {
      let currentItems = [...items];
      const [removed] = currentItems.splice(index, 1);
      setItems(currentItems);
      //agendaCache.set(dateAsKey, currentItems);
      setRecentRemoved({dateAsKey: [...recentRemoved[dateAsKey], removed]});
      onRemoveItem(dateAsKey, index);
    }
  };

  const handleUndo = function (e) {
    const cloneRecentRemoved = [...recentRemoved[dateAsKey]];
    const lastRemoved = cloneRecentRemoved.pop();
    let newCurrentItems = [...items, lastRemoved];
    setItems(newCurrentItems);
    setRecentRemoved({dateAsKey: cloneRecentRemoved});
  };

  const handleMarkDone = function (index, e) {
    console.log(index);
    const currentItems = [...items];
    currentItems[index].status = currentItems[index].status === "Done" ? "Pending" : "Done";
    setItems(currentItems);
    //agendaCache.set(dateAsKey, currentItems);
    onMarkingItemDone(dateAsKey, index);
  };

  const handleOnInput = function (target) {
    console.log('in on input', target);
  };
  const handleOnBlur = function (target) {
    console.log('in on blur', target);
  };

  const isMarkDone = function (item) {
    return item.status && item.status.toLowerCase() === "done";
  };

  return (
    <div className="">
      {/* <div className="text-xl p-2 border-b border-base-100">
        <h3 className="font-semibold text-base-content">{"Agenda: " + monthName + " " + selectedDate + ", " + year}</h3>
        {recentRemoved[dateAsKey] && recentRemoved[dateAsKey].length > 0 ?
          <button title="Undo remove"
            className="btn btn-ghost btn-xs rounded text-base-content/70 hover:text-base-content hover:bg-base-300"
            onClick={handleUndo}>
            <UndoIcon></UndoIcon>
          </button> : <></>}
      </div> */}
      {console.log(items)}
      {items && items.map((item, i) => (
        <AgendaCard
          key={dateAsKey+i}
          keyId={dateAsKey+i}
          index={i}
          title={item.title}
          status={item.status}
          description={item.description}
          onCheckClick={handleMarkDone}
          onRemoveClick={handleRemove} />
      ))}
    </div>
  )
}

export default DayAgenda;