import JustDate from './../utilities/justDate';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Constants } from '../utilities/constants';


function Year(props) {
    const year = props.year;
    const prevSelectedMonth = props.month;
    const locale = props.locale;
    const handleMonthSelection = props.onMonthClick;
    const [leftWidth, setLeftWidth] = useState(Constants.LEFT_SECTION_DEFAULT_WIDTH);
    const [isDragging, setIsDragging] = useState(false);
    const [months, setMonths] = useState([]);

    const containerRef = useRef(null);

    const monthList = useMemo(() => {
        //let justDate = new JustDate(date);
        let MAX_NUMBER_OF_MONTHS = 13;
        const monthList = [];
        const justDate = new JustDate(new Date(year, 0, 1), locale);
        for (let monthIndex = 0; monthIndex < MAX_NUMBER_OF_MONTHS; monthIndex++) {
            justDate.setMonth(monthIndex);
            const monthName = justDate.getMonthName('long');
            if (!monthList.includes(monthName)) {
                monthList.push(monthName);
            }
        }
        return monthList;
    }, [year]);

    useEffect(() => {
        setMonths(monthList);
    }, [monthList]);

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;

            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const newLeftWidth = ((e.clientX - container.getBoundingClientRect().left) / containerWidth) * 100;

            // Enforce min (65%) and max (90%) widths
            if (newLeftWidth >= 65 && newLeftWidth <= 90) {
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

    const handleMonthClick = (monthIndex) => {
        if (handleMonthSelection) {
            handleMonthSelection(monthIndex);
        }
    };

    return (
        <div ref={containerRef} className="h-[calc(100vh-3rem)] flex flex-1 overflow-hidden">
            {/* Left Section - Dynamic width */}
            <div style={{ width: `${leftWidth}%` }} className="bg-base-100 flex flex-col">
                <div className="flex-1 p-2 pt-0 overflow-y-auto">
                    <div
                        style={{ height: '100%', gridAutoRows: '1fr' }}
                        className="grid grid-cols-3 divide-x divide-y divide-base-content/30 text-base-content/90 border border-base-content/30"
                    >
                        {months.map((month, idx) => {
                            return <div 
                                key={idx}
                                onClick={() => handleMonthClick(idx)}
                                className=
                                {"p-4 flex items-center justify-center font-semibold text-center hover:bg-base-200 hover:cursor-pointer transition-colors" + (idx == prevSelectedMonth? " border-1 !border-info/80": "")}
                            >{month}</div>
                        })}
                    </div>
                </div>
            </div>
            {/* Draggable Divider */}
            <div
                onMouseDown={() => setIsDragging(true)}
                className={"w-1 bg-base-content/10 hover:bg-base-content/30 transition-colors cursor-col-resize flex-shrink-0 " + (isDragging ? "bg-primary/50" : "")}
            />
            {/* Right Section - Dynamic width */}
            <div style={{ width: `${100 - leftWidth}%` }} className="hidden lg:flex lg:flex-col bg-base-200 border-l border-base-200">
            </div>
        </div >
    )
}

export default Year;