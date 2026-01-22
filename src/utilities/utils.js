export function parseReminder(sentence) {
    if (!sentence || typeof sentence !== "string") {
        return { isReminder: false, time: null };
    }

    const text = sentence.toLowerCase().trim();

    //Check if reminder
    const REMINDER_INTENT_REGEX =
        /\b(remind(?:\s+me)?|reminder|notify(?:\s+me)?|(set|add|put)\s+(a\s+)?reminder)\b/;

    const isReminder = REMINDER_INTENT_REGEX.test(text);
    if (!isReminder) {
        return { isReminder: false, time: null };
    }

    //Get time
    const TIME_REGEX =
        /\b(?:at|around|by)?\s*(?<hour>\d{1,2})(?::(?<minute>\d{2}))?\s*(?<meridiem>am|pm)?\b/;

    const match = text.match(TIME_REGEX);
    if (!match || !match.groups) {
        return { isReminder: true, time: null };
    }
    let hour = parseInt(match.groups.hour, 10);
    let minute = match.groups.minute
        ? parseInt(match.groups.minute, 10)
        : 0;
    let meridiem = match.groups.meridiem || null;

    /* ---------------- NORMALIZATION ---------------- */

    // Infer AM/PM using contextual words
    if (!meridiem) {
        if (/\b(evening|night)\b/.test(text)) meridiem = "pm";
        if (/\b(morning)\b/.test(text)) meridiem = "am";
    }

    // Convert 24h to 12h if needed
    if (!meridiem && hour >= 13) {
        hour -= 12;
        meridiem = "pm";
    }

    // Final validation
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return { isReminder: true, time: null };
    }
    let isoTime = toISOTimeString(hour, minute, 0, meridiem);
    return {
        isReminder: true,
        time: isoTime
    };
}
/*
* Locale hours, Locale Minutes, local seconds
*/
export function toISOTimeString(hours, minutes, seconds, meridiem) {
    // Create a new Date object. The specific date part doesn't matter;
    // we only set the time components.
    if(meridiem && meridiem.trim().toLowerCase() === "pm"){
        hours = hours < 12 ? hours+12: hours;
    }
    const dateObj = new Date();
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    dateObj.setSeconds(seconds);
    return dateObj.toISOString().split('T')[1];
}