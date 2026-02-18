import Day from './Day';
import JustDate from './../utilities/justDate';
import { invoke } from "@tauri-apps/api/core";
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from './../hooks/useTheme';
import { event } from '@tauri-apps/api';
import useWindowWidth from './../hooks/useWindowWidth';
import RightSection from './RightSection';
import { Constants } from '../utilities/constants';


function Month(props) {
  const locale = props.locale;
  const [monthDays, setMonthDays] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [monthStart, setMonthStart] = useState(0);
  const [monthName, setMonthName] = useState();
  const [selectedDate, setSelectedDate] = useState(props.date);
  const [monthItems, setMonthItems] = useState({});
  const [updatedAgendas, setUpdatedAgendas] = useState([]);
  const [lastAgendaUpdate, setLastAgendaUpdate] = useState(null);
  const [leftWidth, setLeftWidth] = useState(Constants.LEFT_SECTION_DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const containerRef = useRef(null);
  const width = useWindowWidth();

  const todaysDate = new Date();
  const month = JustDate.getMonthIndex(props.month);
  console.log('month', month, 'prop-month', props.month);
  const year = props.year;


  const handleSelectedDate = useCallback((date) => {
    if (Number.isInteger(date)) {
      setSelectedDate(date);
    } else {
      console.error("Not a valid date selected.");
    }
  }, []);

  const monthDates = useMemo(() => {
    // If we have month and year defined, initialize with the 1st of the month.
    const currentViewDate = (month > -1) && year ? new Date(year, month, 1) : new Date();
    const justDate = new JustDate(currentViewDate, locale);
    const rawMonthDates = justDate.getMonthDates();

    const weekInfo = justDate.getLocaleWeekInfo();//This gives firstDay 1 based, Monday is 1, ..
    const firstDay = weekInfo.firstDay % 7; //To convert into 0 based. Monday is 1, Sunday is 0;
    const firstDayOfMonth = rawMonthDates[0].getDay();

    //Month 1st could be any day of week, calculate the offset from sunday (0 index) 
    // and add undefined dates for offset
    const monthStartOffset = firstDayOfMonth - firstDay;
    const emptyDates = Array.from({ length: monthStartOffset }, () => undefined);

    return [...emptyDates, ...rawMonthDates];
  }, [month, year, width]); // Dependency array

  useEffect(() => {
    const currentViewDate = (month > -1) && year ? new Date(year, month, 1) : new Date();
    const justDate = new JustDate(currentViewDate, 'en-US');

    const monthDays = justDate.getDayNumbersInMonth();
    const dayNameFormat = width > 700 ? 'long' : width > 300 ? 'short' : 'narrow';
    const weekDays = justDate.getLocalizedWeekdays(dayNameFormat);
    const localeMonth = justDate.getMonthName();

    const weekInfo = justDate.getLocaleWeekInfo();//This gives firstDay 1 based, Monday is 1, ..
    const firstDay = weekInfo.firstDay % 7; //To convert into 0 based. Monday is 1, Sunday is 0;
    const firstDayOfMonth = justDate.getMonthDates()[0].getDay();
    const monthStartOffset = firstDayOfMonth - firstDay;

    setMonthStart(monthStartOffset);
    setMonthDays(monthDays);
    setWeekDays(weekDays);
    setMonthName(localeMonth);
    setUpdatedAgendas(monthDays.map(day => ({ [day]: [] })));
  }, [month, year, width]);


  useEffect(() => {
    async function fetchMonthItems(date) {
      setIsLoadingItems(true);
      let utcDateStr = date.toISOString();
      try {
        console.log('fetching items for month', utcDateStr);
        let items = await invoke("get_items_for_month", { date: utcDateStr });
        if (items && items.length) {
          let itemsAsObj = Object.fromEntries(items);
          console.log('get_items_for_month', itemsAsObj);
          setMonthItems(itemsAsObj);
        } else {
          setMonthItems({});
        }
      } finally {
        setIsLoadingItems(false);
      }
    }
    let date = new Date(year, month, selectedDate);
    fetchMonthItems(date);
  }, [year, month]);

  const handleRemoveAgendaByRightSection = useCallback((dateKey, index) => {
    //This will be called via right section, when user updates Day using right section.
    //let dateAsKey = JustDate.toISOLikeDateString(new Date(year, month, day));

    setMonthItems((currItems) => {
      const prevItems = currItems[dateKey] || [];
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return { ...currItems, [dateKey]: newItems };
    });
  }, [year, month]);
  const handleAddAgendaByRightSection = useCallback((day, agenda, index = undefined) => {
    //This will be called via right section, when user updates Day using right section.
    let dateAsKey = JustDate.toISOLikeDateString(new Date(year, month, day));

    setMonthItems((currItems) => {
      const prevItems = currItems[dateAsKey] || [];
      let newItems; 
      if(index === undefined){
        newItems = [...prevItems, agenda.user_input];
      } else{
        newItems = [...prevItems];
        newItems.splice(index, 0, agenda.user_input);
      }
      return { ...currItems, [dateAsKey]: newItems };
    });
  }, [year, month]);

  const handleEditAgendaByRightSection = useCallback((dateKey, index, updatedAgenda) => {
    //This will be called via right section, when user updates Day using right section.
    setMonthItems((currItems) => {
      const prevItems = currItems[dateKey] || [];
      const newItems = [...prevItems];
      newItems[index] = updatedAgenda.user_input;
      return { ...currItems, [dateKey]: newItems };
    });
  }, [year, month]);

  const handleAgendaUpdateByDay = useCallback((date, agenda) => {
    let updateDateKey = JustDate.toISOLikeDateString(date);
    setLastAgendaUpdate({ dateKey: updateDateKey, agenda });
  }, []);

  const isSunday = function (day, index) {
    let isSun = (day.toLowerCase() === "sunday"
      || day.toLowerCase() === "sun"
      || (day.toLowerCase === "s" && index === weekDays.indexOf('s')));
    return isSun;
  };

  //Dragging events:
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const newLeftWidth = ((e.clientX - container.getBoundingClientRect().left) / containerWidth) * 100;

      // Enforce min and max widths
      if (newLeftWidth >= Constants.LEFT_SECTION_MIN_WIDTH
        && newLeftWidth <= Constants.LEFT_SECTION_MAX_WIDTH) {
        setLeftWidth(newLeftWidth);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div ref={containerRef} className="h-[calc(100vh-3rem)] flex flex-1 overflow-hidden">
      <div style={{ width: `${leftWidth}%` }} className="bg-base-100 flex flex-col">
        {/* Optional: Inner header or toolbar */}
        <div className="pl-3 bg-base-100/90 p-2 border-b border-base-100 text-base-content">
          <div className="grid grid-cols-7 flex-row">
            {weekDays.map((day, idx) => (
              <div key={`${monthName}-${idx}`} className={"pl-0 p-2 h-8 text-xl text-center font-semibold " + (isSunday(day, idx) ? "text-base-content/70":"")}>{day}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-2 pt-0 overflow-y-auto">
          <div className="prose max-w-none h-full">
            <div className={`grid grid-cols-7 auto-rows-fr divide-x divide-y divide-base-content/30 text-base-content/90 border border-base-content/30 month-grid h-full ${isLoadingItems ? 'loading' : ''}`}>
              {monthDates.map((date, idx) => {
                if (date) {
                  let dateKey = JustDate.toISOLikeDateString(date);
                  let items = monthItems[dateKey];
                  const isSelected = date.getDate() === selectedDate;
                  let isToday = date.getDate() === todaysDate.getDate();
                  return <Day key={dateKey}
                    date={date}
                    index={idx}
                    selectedDate={selectedDate}
                    handleSelectedDate={handleSelectedDate}
                    onAgendaUpdate={handleAgendaUpdateByDay}
                    items={items}
                    isSelected={isSelected}
                    isToday={isToday} />
                } else {
                  return <div key={idx} className="p-0 h-42 flex flex-col"></div>
                }
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Draggable Divider */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className={"w-1 bg-base-content/10 hover:bg-base-content/30 transition-colors cursor-col-resize flex-shrink-0 " + (isDragging ? "bg-primary/50" : "")}
      />
      {/* Right Section - Dynamic width */}
      <div style={{ width: `${100 - leftWidth}%` }} className="lg:flex lg:flex-col bg-base-200 border-l border-base-200 p-1">
        <RightSection
          year={year}
          month={month}
          monthName={monthName}
          onAgendaAdd={handleAddAgendaByRightSection}
          onAgendaEdit={handleEditAgendaByRightSection}
          onAgendaRemove={handleRemoveAgendaByRightSection}
          selectedDate={selectedDate}
          lastAgendaUpdate={lastAgendaUpdate} />
      </div>
    </div >
  )
}

export default Month;