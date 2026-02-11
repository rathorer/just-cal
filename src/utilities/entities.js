export class ExtractedTime{
    constructor(hour, minute, isApprox, confidence = 0.8, source = ""){
        this.hour = hour;
        this.minute = minute;
        this.isApprox = isApprox;
        this.confidence = confidence;
        this.source = source;
    }
};

export class AgendaItem{
    constructor(id, user_input, title, description, status, time, reminder){
        this.id = id,
        this.user_input = user_input,
        this.title = title,
        this.description = description || "",
        this.status = status,
        this.time = time,
        this.reminder = reminder
    }
}
export class AgendaHelper{

  static convertUserInputToAgenda(currentDate, userInput, existingItemsLength) {
    if (!userInput || userInput.trim() === "") {
      return null;
    }
    //let currentDateAsKey = JustDate.toISOLikeDateString(currentDate);
    //console.log('converting user input to agenda:', currentDate);
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
    let multipleSentences = userInput.match(Constants.SENTENCE_DETECTION);
    let title = multipleSentences ? multipleSentences[0] : userInput;
    let description = userInput;
    if (title.length > Constants.MAX_CHARS_FOR_TITLE) {
      title = title.substring(0, Constants.MAX_CHARS_FOR_TITLE);
    }
    return {
      id: existingItemsLength + 1,
      user_input: userInput,
      title: title,
      description: description,
      status: "Pending",
      time: eventDateTimeStr,
      reminder: reminderDateTimeStr
    }
  }
}