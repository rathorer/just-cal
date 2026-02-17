import { useState, useMemo, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Month from "./components/Month";
import { useTheme } from './hooks/useTheme';
import "./App.css";
import ThemeLightIcon from "./components/icons/ThemeLight";
import ThemeDarkIcon from "./components/icons/ThemeDark";
import BarsIcon from "./components/icons/Bars";
import JustDate from "./utilities/justDate";
import PrevIcon from "./components/icons/Prev";
import NextIcon from "./components/icons/Next";
import JumpNextIcon from "./components/icons/JumpNext";
import JumpPrevIcon from "./components/icons/JumpPrev";
import { arch, hostname, locale } from '@tauri-apps/plugin-os';
import Year from "./components/Year";
import Header from "./components/Header";

const VIEW_TYPE = Object.freeze({ Year: 0, Month: 1, Week: 2 });
function App() {
  const LASTMONTH_INDEX = 11; // December; TODO:This could be diff in diff locale
  const { theme, toggleTheme } = useTheme();
  const [monthIndex, setMonthIndex] = useState(-1);
  const [year, setYear] = useState(1970);
  const [monthName, setMonthName] = useState("");
  const [dayDate, setDayDate] = useState();
  const [userLocale, setUserLocale] = useState("en-US");
  const [currentView, setCurrentView] = useState(VIEW_TYPE.Month);
  const [nextPrevText, setNextPrevText] = useState("month");

  useEffect(() => {
    async function getLocale() {
      const userLocale = await locale();
      if (userLocale) {
        console.log("User's locale:", userLocale);
        // Use the locale string for your internationalization (i18n) logic
        setUserLocale(userLocale);
      } else {
        console.log("Could not detect locale.");
      }
    }
    getLocale();
  }, []);

  useEffect(() => {

    async function updateBackendStore(date) {
      let utcDateStr = date.toISOString();
      try {
        await invoke("update_store", { date: utcDateStr });
      } catch (error) {
        console.error('Error while updating store at backend..', error);
      }
    }
    let date = new Date(year, monthIndex, dayDate);
    updateBackendStore(date);
  }, [year, monthIndex]);

  useMemo(() => {
    let currentDate;
    if (monthIndex < 0 || year < 1970) {
      currentDate = new Date();
      setMonthIndex(currentDate.getMonth());
      setYear(currentDate.getFullYear());
      setDayDate(currentDate.getDate());
    } else {
      currentDate = new Date(year, monthIndex, dayDate);
    }
    let justDate = new JustDate(currentDate, userLocale);
    setMonthName(justDate.getMonthName());
    setDayDate(currentDate.getDate());
  }, [monthIndex, year]);

  const openMenu = () => {
    console.log("Menu Open");
  }

  const handleMonthSelection = (monthIndex) => {
    setMonthIndex(monthIndex);
    let currentDate = new Date(year, monthIndex, dayDate);
    let justDate = new JustDate(currentDate, userLocale);
    setMonthName(justDate.getMonthName());
    setCurrentView(VIEW_TYPE.Month);
    setNextPrevText("month");
  };

  const handleNext = () => {
    if (currentView === VIEW_TYPE.Month) {
      handleNextMonth();
    } else {
      handleNextYear();
    }
  };
  const handlePrev = () => {
    if (currentView === VIEW_TYPE.Month) {
      handlePrevMonth();
    } else {
      handlePrevYear();
    }
  }

  const handlePrevMonth = () => {
    // Ensure the index doesn't go below zero
    if (year === 1970 && monthIndex === 0) {
      return;
    }
    if (monthIndex === 0) {
      setYear(year - 1);
      setMonthIndex(LASTMONTH_INDEX);
    } else {
      setMonthIndex(monthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    // Ensure the index doesn't exceed the array length
    if (monthIndex === LASTMONTH_INDEX) {
      setYear(year + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex(monthIndex + 1);
    }
  };
  const handleView = (e) => {
    console.log(e.target);
    if (currentView === VIEW_TYPE.Month) {
      setCurrentView(VIEW_TYPE.Year);
      setNextPrevText("year");
    } else {
      setCurrentView(VIEW_TYPE.Month);
      setNextPrevText("month");
    }
  };

  const handlePrevYear = () => {
    if (year === 1970) {
      return;
    }
    setYear(year - 1);
  };
  const handleNextYear = () => {
    setYear(year + 1);
  };

  const handleWheelScroll = (event) => {
    console.log("trying to scroll");
    if (containerRef.current) {
      // Prevent default vertical scrolling behavior if needed
      event.preventDefault();
      const scrollAmount = event.deltaY; // Use deltaY for vertical wheel movement
      containerRef.current.scrollTo({
        left: containerRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth' // Optional: adds smooth scrolling animation
      });
    }
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;

      if (scrollLeft !== prevScrollLeft) {
        console.log('Horizontal scroll detected! New position:', scrollLeft);
        // You can add your specific logic here (e.g., fetch more data, trigger animation)
      }

      setPrevScrollLeft(scrollLeft);
    }
  };

  return (
    <main>
      <Header
        monthName={monthName}
        year={year}
        currentView={currentView}
        nextPrevText={nextPrevText}
        handlePrev={handlePrev}
        handleNext={handleNext}
        handleView={handleView}
        toggleTheme={toggleTheme}
        theme={theme}
        openMenu={openMenu}
      />
      <div className="flex flex-1 overflow-hidden">
        {
          currentView == VIEW_TYPE.Month ?
            <Month date={dayDate} month={monthIndex} year={year} />
            :
            <Year key={`${year}`} year={year} month={monthIndex} locale={userLocale} onMonthClick={handleMonthSelection} />
        }
      </div>
      
    </main>
  );
}

export default App;
