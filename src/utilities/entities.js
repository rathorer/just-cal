export class ExtractedTime{
    constructor(hour, minute, isApprox, confidence = 0.8, source = ""){
        this.hour = hour;
        this.minute = minute;
        this.isApprox = isApprox;
        this.confidence = confidence;
        this.source = source;
    }
};

export class DayItem{
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