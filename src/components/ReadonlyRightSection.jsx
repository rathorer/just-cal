import { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useCache from '../hooks/useCache';
import AgendaCard from './AgendaCard';
import { getReminder } from '../services/reminderDetectionService';
import { Constants } from '../utilities/constants';
import JustDate from './../utilities/justDate';
import { useUserSettings } from "../contexts/UserSettingsContext";
import { convertUserInputToAgendaItem } from '../services/userInputDetectionsService';
import { getTitleOfAText } from '../services/titleDetectionService';
import ReadonlyAgendaCard from './ReadonlyAgendaCard';

function ReadonlyRightSection(props) {
    const year = props.year;
    const month = props.month;
    const monthName = props.monthName;
    const lastAgendaUpdate = props.lastAgendaUpdate;
    let selectedDate = props.selectedDate;
    let dateObj = new Date(year, month, selectedDate);
    let dateAsKey = JustDate.toISOLikeDateString(dateObj);
    const [isLoadingItems, setIsLoadingItems] = useState(false);


    const { settings } = useUserSettings();
    const [date, setDate] = useState(dateObj);
    const [items, setItems] = useState({ [dateAsKey]: undefined });

    useEffect(() => {
        let dateObj = new Date(year, month, selectedDate);
        dateAsKey = JustDate.toISOLikeDateString(dateObj);
        setDate(dateObj);
    }, [year, month, selectedDate]);

    useEffect(() => {
        async function fetchMonthItems(date) {
            setIsLoadingItems(true);
            let utcDateStr = date.toISOString();
            try {
                let items = await invoke("get_items_for_month", { date: utcDateStr });
                if (items && items.length) {
                    setItems(items);
                    console.log('get_items_for_month', items);
                    //setMonthItems(itemsAsObj);
                } else {
                    setItems([]);
                    //setMonthItems({});
                }
            } finally {
                setIsLoadingItems(false);
            }
        }
        fetchMonthItems(date);
    }, [date, selectedDate]);

    //Handle Agenda update from parent
    useEffect(() => {
        if (!lastAgendaUpdate || !date) {
            return;
        }
        const selectedDateKey = JustDate.toISOLikeDateString(date);
        if (lastAgendaUpdate.dateKey !== selectedDateKey) {
            return;
        }
        setItems((prevItems) => {
            return {
                ...prevItems,
                [selectedDateKey]: lastAgendaUpdate.agenda
            };
        });
    }, [lastAgendaUpdate, date]);

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

    // No-op functions for read-only mode
    const noOpFunction = () => { };

    //const dayItems = items[dateAsKey] || [];

    return (
        <div className={`lg:block bg-base-100/90 border-l border-base-200 text-base-content max flex flex-col h-full overflow-y-auto bg-gradient-to-tl from-${settings && settings.backgroundShade}/10 to-base-100`}>
            <div className="text-xl p-2 border-1 rounded-sm border-dark-teal bg-gradient-to-r from-dark-teal/20 via-blue/30 to-dark-teal/20">
                <h3 className="font-semibold text-base-content">{monthName + ", " + year + " Items"}</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 p-2">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        <ReadonlyAgendaCard
                            key={item.date +"-"+ item.id}
                            keyId={item.date +"-"+ item.id}
                            index={index}
                            agendaItem={item}
                            status={item.status}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-base-content/60">
                        No items for this day
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReadonlyRightSection;