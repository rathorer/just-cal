import Day from './Day';
import JustDate from './../utilities/justDate';
import { invoke } from "@tauri-apps/api/core";
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTheme } from './../hooks/useTheme';
import { event } from '@tauri-apps/api';
import useWindowWidth from './../hooks/useWindowWidth';
import RightSection from './RightSection';


function Month(props) {
  const [monthDays, setMonthDays] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [monthStart, setMonthStart] = useState(0);
  const [monthName, setMonthName] = useState();
  const [selectedDate, setSelectedDate] = useState(props.date);
  const [monthItems, setMonthItems] = useState([]);
  const [updatedAgendas, setUpdatedAgendas] = useState([]);
  const [lastAgendaUpdate, setLastAgendaUpdate] = useState(null);
  const width = useWindowWidth();

  const month = JustDate.getMonthIndex(props.month);
  const year = props.year;
  //setSelectedDate(props.date);


  // const handleSelectedDate = (date) => {
  //   // console.log(date);
  //   if (Number.isInteger(date)) {
  //     setSelectedDate(date);
  //   } else {
  //     console.error('Not a valid date selected.');
  //   }
  // };
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
    const justDate = new JustDate(currentViewDate, 'en-US');
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
      let utcDateStr = date.toISOString();
      let items = await invoke("get_items_for_month", { date: utcDateStr });
      if (items && items.length) {
        let itemsAsObj = Object.fromEntries(items);
        console.log('get_items_for_month', itemsAsObj);
        setMonthItems(itemsAsObj);
      } else {
        setMonthItems({});
      }
    }
    let date = new Date(year, month, selectedDate);
    fetchMonthItems(date);
  }, [year, month]);

  const handleAddAgendaByRightSection = useCallback((day, agenda) => {
    //This will be called via right section, when user updates Day using right section.
    let dateAsKey = JustDate.toISOLikeDateString(new Date(year, month, day));

    setMonthItems((currItems) => {
      const prevItems = currItems[dateAsKey] || [];
      const newItems = [...prevItems, agenda.user_input];
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
    // let newUpdatedAgendas = [...updatedAgendas];
    // let possibleItem = newUpdatedAgendas[day - 1];
    // possibleItem[day] = agenda;
    // setUpdatedAgendas(newUpdatedAgendas);
    // let dateAsKey = new JustDate(new Date(year, month, day)).toDateString();
    // setMonthItems([...monthItems, { dateAsKey: agenda.map(ag => ag.user_input) }]);
    let updateDateKey = JustDate.toISOLikeDateString(date);
    setLastAgendaUpdate({ dateKey: updateDateKey, agenda });
    //Additional check
    // if(possibleItem && possibleItem[day]){
    //   possibleItem ==
    // }
  }, []);

  const isSunday = function (day, index) {
    let isSun = (day.toLowerCase() === "sunday"
      || day.toLowerCase() === "sun"
      || (day.toLowerCase === "s" && index === weekDays.indexOf('s')));
    //console.log(isSun);
    return isSun;

  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-1 overflow-hidden">
      {/* 2. Bottom Left Section - 80% width */}
      <div className="w-full lg:w-4/5 bg-base-100 flex flex-col">
        {/* Optional: Inner header or toolbar */}
        <div className="pl-3 bg-base-100/90 p-2 border-b border-base-100 text-base-content">
          <div className="grid grid-cols-7 flex-row">
            {weekDays.map((day, idx) => (
              <div key={monthName + day} className={"pl-0 p-2 h-8 text-xl text-center font-semibold"}>{day}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-2 pt-0 overflow-y-auto">
          <div className="prose max-w-none">
            <div className="grid grid-cols-7 divide-x divide-y divide-base-content/30 text-base-content/90 border border-base-content/30">
              {monthDates.map((date, idx) => {
                if (date) {
                  let dateKey = JustDate.toISOLikeDateString(date);
                  let items = monthItems[dateKey];
                  const isSelected = date.getDate() === selectedDate;
                  return <Day key={dateKey}
                    date={date}
                    index={idx}
                    selectedDate={selectedDate}
                    handleSelectedDate={handleSelectedDate}
                    onAgendaUpdate={handleAgendaUpdateByDay}
                    items={items}
                    isSelected={isSelected} />
                } else {
                  return <div key={idx} className="p-0 h-42 flex flex-col"></div>
                }
              })}
            </div>
          </div>
        </div>
      </div>
      <RightSection
        year={year}
        month={month}
        monthName={monthName}
        onAgendaAdd={handleAddAgendaByRightSection}
        onAgendaEdit={handleEditAgendaByRightSection}
        selectedDate={selectedDate}
        lastAgendaUpdate={lastAgendaUpdate} />
    </div >
  )
}

export default Month;