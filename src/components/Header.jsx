import React from "react";
import ThemeLightIcon from "./icons/ThemeLight";
import ThemeDarkIcon from "./icons/ThemeDark";
import BarsIcon from "./icons/Bars";
import PrevIcon from "./icons/Prev";
import NextIcon from "./icons/Next";

export default function Header(props) {
  const {
    monthName,
    year,
    currentView,
    nextPrevText,
    handlePrev,
    handleNext,
    handleView,
    toggleTheme,
    theme,
    openMenu,
  } = props;

  return (
    <div className="flex flex-col">
      <div className="h-10 shadow-md flex items-center px-3 bg-gradient-to-r from-dark-teal via-blue/90 to-dark-teal/90 bg- text-header-teal-content border-b border-teal-700/30">
      {/* <div className="h-10 shadow-md flex items-center px-3 bg-gradient-to-r from-teal-900 via-teal-700 to-teal-800 text-base-content dark:text-white border-b border-orange-700/30"> */}
        <div className="flex justify-start basis-4/5 w-full">
          <div className="flex items-center gap-4">
            {/* <a
              className="inline-block p-1 rounded hover:bg-blue-600/40 cursor-pointer"
              onClick={handlePrev}
              title={"Previous " + nextPrevText}
            > */}
            <button
              name="previous"
              title={"Previous " + nextPrevText}
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={handlePrev}
              aria-label="Previous"
            ><PrevIcon /></button>
              
            {/* </a> */}
          </div>
          <div className="flex justify-center flex-1">
             <button
              title={currentView === 1 ? "Change to year view" : "Change to month view"}
              className="btn btn-ghost btn-sm p-2 min-w-0"
              onClick={handleView}
              aria-label="Next"
            >
                <h1 className="text-lg font-bold m-0 leading-none">
                  {currentView === 1 ? `${monthName} ${year}` : year}
                </h1>
            {/* <a className="hover:opacity-90 cursor-pointer" onClick={handleView}>
              
            </a> */}
            </button>
          </div>
          <div className="flex items-center justify-end gap-4">
            {/* <a
              className="inline-block p-1 rounded hover:bg-blue-600/40 cursor-pointer"
              onClick={handleNext}
              title={"Next " + nextPrevText}
            > */}
            <button
              name="next"
              title={"Next " + nextPrevText}
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={handleNext}
              aria-label="Next"
            >
              <NextIcon />
              </button>
            {/* </a> */}
          </div>
        </div>
        <div className="basis-1/5 flex justify-end gap-2">
          {/* <a
            className="inline-block p-2 rounded hover:bg-orange-600/30 cursor-pointer"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          > */}
          <div className="flex items-center justify-end gap-4"></div>
          <button
              name="themeChange"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={toggleTheme}
              aria-label="Change theme"
            >
            {theme === "light" ? <ThemeLightIcon /> : <ThemeDarkIcon />}
          </button>
          {/* <a
            className="inline-block p-2 rounded hover:bg-orange-600/30 cursor-pointer"
            onClick={openMenu}
            title="Menu"
          > */}
          <button
              name="removeItem"
              title="Remove this from agenda"
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={openMenu}
              aria-label="Remove"
            >
            <BarsIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
