import React, { useState, useMemo } from 'react';
import { Constants } from '../utilities/constants';

const TimePicker = ({ onTimeChange, selectedTime }) => {
    console.log(selectedTime);
    const timeObj = new Date(selectedTime);
    // Function to format time as "HH:mm" (24-hour format)
    const formatTime = (hour, minute) => {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };
    let inputTime = formatTime(timeObj.getHours(), timeObj.getMinutes());

    // Generate time options in 5-minute increments
    const timeOptions = useMemo(() => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += Constants.REMINDER_TIME_PRECISION) {
                options.push(formatTime(h, m));
            }
        }
        return options;
    }, []);

    const handleChange = (val) => {
        //const target = event.target;
        if (val) {
            const selectedTime = val;
            let inputTimeArr = selectedTime.split(':');
            const hours = parseInt(inputTimeArr[0], 10);
            const minutes = parseInt(inputTimeArr[1], 10);
            timeObj.setHours(hours);
            timeObj.setMinutes(minutes);
            onTimeChange(timeObj);
        }
    };

    return (
        // <select className="select select-xs w-auto min-w-20" value={inputTime} onChange={handleChange}>
        //     {timeOptions.map((timeOption) => (
        //         <option key={timeOption} value={timeOption}>
        //             {timeOption}
        //         </option>
        //     ))}
        // </select>

        <SearchableSelect selectedTime={selectedTime} selectedValue={inputTime} onChange={handleChange} />
    );
};

export default TimePicker;

//import { useState } from 'react';

export function SearchableSelect(props) {
    const selectedTimeObj = new Date(props.selectedTime);
    const [value, setValue] = useState(props.selectedValue);

    const formatTime = (hour, minute) => {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    const timeOptions = useMemo(() => {
        const options = [];
        const selectedTime = new Date(props.selectedTime);
        let inputTimeArr = props.selectedValue.split(':');
        const hours = parseInt(inputTimeArr[0], 10);
        const minutes = parseInt(inputTimeArr[1], 10);

        //show only 5 hours before and after times;
        selectedTime.setHours(hours - Constants.TIME_SELECTER_RANGE_H);
        selectedTime.setMinutes(minutes);
        const startH = selectedTime.getHours();
        selectedTime.setHours(hours + Constants.TIME_SELECTER_RANGE_H);
        const endH = selectedTime.getHours();
        for (let h = startH; h < endH; h++) {
            for (let m = 0; m < 60; m += Constants.REMINDER_TIME_PRECISION) {
                options.push(formatTime(h, m));
            }
        }
        return options;
    }, []);


    const handleChange = function (e, val) {
        const target = e.target;
        if (target) {
            if (target.tagName === "BUTTON") {
                val = target.textContent;
            } else {
                val = target.value;
                // Only allow numbers and colons
                val = val.replace(/[^0-9:]/g, '');
                // Limit to HH:mm format (5 characters max)
                if (val.length > 5) {
                    val = val.slice(0, 5);
                }
            }
        }
        setValue(val);
        if (!e.target) {
            e.target = { value: val };
        }
        //props.onChange(val);
    };
    const handleBlur = function () {
        props.onChange(value);
    };
    const handleTimeSelect = function (e, selectedVal) {
        props.onChange(selectedVal);
        setValue(selectedVal);
    };

    return (
        <div className="dropdown dropdown-xs w-auto">
            {/* The visible text input */}
            <input
                type="text"
                placeholder="Type or select..."
                className="input input-xs max-w-16"
                value={value}
                onChange={(e) => handleChange(e)}
                onBlur={handleBlur}
            />

            {/* The dropdown list that appears when typing/focused */}
            {timeOptions.length > 0 && (
                <div className="dropdown-content p-2 shadow bg-base-100 rounded-box mt-1 z-[1] overflow-auto max-h-280 w-52">
                    <div className="grid grid-cols-2 gap-1">
                        {timeOptions.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                className="btn btn-xs p-0 m-0"
                                onMouseDown={(e) => handleTimeSelect(e, opt)}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}