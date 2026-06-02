import { getReminder } from "./reminderDetectionService";

const DEFAULT_STATUS = "Pending";
function convertUserInputToAgendaItem(currentDate, userInput, id, title = "", status = DEFAULT_STATUS, description = "") {
    userInput = userInput.trim();
    let extractedTimes = getReminder(userInput);
    let reminderTime = extractedTimes.reminder;
    currentDate.setHours(reminderTime.hour);
    currentDate.setMinutes(reminderTime.minute);
    let reminderDateTimeStr = currentDate.toISOString();
    let eventDateTimeStr = null;
    if (extractedTimes.event) {
        currentDate.setHours(extractedTimes.event.hour);
        currentDate.setMinutes(extractedTimes.event.minute);
        eventDateTimeStr = currentDate.toISOString();
    }
    
    return {
        id: id,
        user_input: userInput,
        title: title || userInput,
        description: description,
        status: status,
        time: eventDateTimeStr,
        reminder: reminderDateTimeStr
    }

};

export { convertUserInputToAgendaItem }
