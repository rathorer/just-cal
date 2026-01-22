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

function App() {
  const LASTMONTH_INDEX = 11; // December;
  const { theme, toggleTheme } = useTheme();
  const [monthIndex, setMonthIndex] = useState(-1);
  const [year, setYear] = useState(1969);
  const [monthName, setMonthName] = useState("");
  const [dayDate, setDayDate] = useState();

  useEffect(() => {
    async function getLocale() {
      const userLocale = await locale();
      if (userLocale) {
        console.log("User's locale:", userLocale);
        // Use the locale string for your internationalization (i18n) logic
      } else {
        console.log("Could not detect locale.");
      }
    }
    getLocale();
  }, []);


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
    let justDate = new JustDate(currentDate, "en-US");
    setMonthName(justDate.getMonthName());
    setDayDate(currentDate.getDate());
  }, [monthIndex, year]);

  const openMenu = () => {
    console.log("Menu Open");
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

      // Update the previous position
      setPrevScrollLeft(scrollLeft);
    }
  };

  return (
    <main>
      <div className="flex flex-col bg-header-base1">
        <div className="h-12 shadow-md flex flex-row items-center px-2 border-b border-base-content/20">
          <div className="flex justify-start basis-4/5">
            <div className="flex justify-start basis-1/5 gap-6">
              <a className="link text-header-base1-content inline-block p-2 rounded hover:text-accent hover:bg-base-200/50"
                onClick={handlePrevYear}
                disabled={monthIndex === 0 && year === 1970}
                style={{ opacity: monthIndex === 0 && year === 1970 ? 0.5 : 1 }}
                title="Previous year">
                <JumpPrevIcon title="Previous year" />
              </a>
              <a className="link text-header-base1-content inline-block p-2 rounded hover:text-accent hover:bg-base-200/50"
                onClick={handlePrevMonth}
                disabled={monthIndex === 0 && year === 1970}
                style={{ opacity: monthIndex === 0 && year === 1970 ? 0.5 : 1 }}
                title="Previous month">
                <PrevIcon title="Previous month" />
              </a>
            </div>
            <div className="flex justify-center basis-3/5">
              <h1 className="text-xl font-bold p-2 inline-block text-header-base1-content">{monthName} {year}</h1>
            </div>
            <div className="flex justify-end basis-1/5 gap-6">
              <a className="link text-header-base1-content inline-block p-2 rounded hover:text-accent hover:bg-base-200/50"
                onClick={handleNextMonth}
                title="Next month">
                <NextIcon title="Next month" />
              </a>
              <a className="link text-header-base1-content inline-block p-2 rounded hover:text-accent hover:bg-base-200/50"
                onClick={handleNextYear}
                title="Next year">
                <JumpNextIcon title="Next year" />
              </a>
            </div>
          </div>
          <div className="basis-1/5 flex justify-end gap-2">
            <a className="link text-header-base1-content hover:text-primary inline-block p-2 rounded hover:bg-base-200/50 cursor-pointer"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              {theme === 'light' ? <ThemeLightIcon /> : <ThemeDarkIcon />}
            </a>
            <a className="link text-header-base1-content hover:text-primary inline-block p-2 rounded hover:bg-base-200/50 cursor-pointer"
              onClick={openMenu}>
              <BarsIcon></BarsIcon>
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Month date={dayDate} month={monthIndex} year={year} />
      </div>

    </main>
  );
}

export default App;
