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

    const handleChange = (event) => {
        const target = event.target;
        if (target) {
            const selectedTime = target.value;
            console.log('change time', selectedTime);
            let inputTimeArr = selectedTime.split(':');
            const hours = parseInt(inputTimeArr[0], 10);
            const minutes = parseInt(inputTimeArr[1], 10);
            timeObj.setHours(hours);
            timeObj.setMinutes(minutes);
            onTimeChange(timeObj);
        }
    };

    return (
        <select value={inputTime} onChange={handleChange}>
            {timeOptions.map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                    {timeOption}
                </option>
            ))}
        </select>
    );
};

export default TimePicker;
// Example Usage in an App component
// const App = () => {
//   const [time, setTime] = useState('10:00'); // Default time

//   return (
//     <div>
//       <label htmlFor="time-picker">Select Time (5 min precision): </label>
//       <TimePickerDropdown onTimeChange={setTime} selectedTime={time} />
//       <p>Selected Time: {time}</p>
//     </div>
//   );
// };

// export default App;