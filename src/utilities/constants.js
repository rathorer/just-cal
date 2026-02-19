import { ExtractedTime } from "./entities";

export const Constants = Object.freeze({
    DEFAULT_REMIND_TIME: new ExtractedTime(10, 0, false),
    DEBOUNCE_DURATION: 2000,//2 secs
    SMALL_SCREEN_WIDTH: 300,
    MEDIUM_SCREEN_WIDTH: 700,
    MAX_CHARS_FOR_TITLE: 80,
    LEFT_SECTION_DEFAULT_WIDTH: 80, //%
    LEFT_SECTION_MIN_WIDTH: 50, //%
    LEFT_SECTION_MAX_WIDTH: 90, //%
    UNDO_DURATION_MS: 20000,//in milliseconds
    REMINDER_TIME_PRECISION: 15,//in minutes
    SENTENCE_DETECTION: /^[^.?!]+[.?!]/,
    TIME_FORMAT: "short",//"full", "long", "medium", "short"
    TIME_SELECTER_RANGE_H: 5,//in hours, this will show different times within +-5 hours window
    MY_DAY_START_H: 7,
    REMINDER_INTENT_REGEX:
        /\b(remind(?:\s+me)?|reminder|notify(?:\s+me)?|alert(?:\s+me)?|let\s+me\s+know|ping|buzz\s+me|give\s+me\s+(?:a\s+)?heads?\s+up|drop\s+me\s+(?:a\s+)?reminder|send\s+me\s+(?:a\s+)?notification|(?:set|add|put|keep)\s+(?:a|an|the)?\s*(?:note|reminder|alarm|notification))\b/,
    TIME_BARE_NUMBER_REGEX: /\b([1-9]|1[0-9]|2[0-3])\b/,
    TIME_PREP_APPROX_REGEX: /\b(at|around|by|before|after|near|past|to|about|roughly|approximately|almost|nearly)\b/i,
    TIME_ACTION_REGEX: /\b(remind|notify|alert|schedule|set|start|begin|end|finish|meet|call|join|arrive|leave|depart|interview)\b/i,
    TIME_NATURAL_REGEX: /\b(noon|midday|midnight)\b/i,
    TIME_EXPLICIT_REGEX: /\b(?:(?:[01]?\d|2[0-3]):[0-5]\d|(?:1[0-2]|0?\d)\s?(?:am|pm)|(?:1[0-2]|0?\d)\s?o'?clock|(?:\d{3,4})\s?hours)\b/i,

    NOTIFY_MINUTES_BEFORE_EVENT: 15,
    DEFAULT_ALLOWED_TAGS: [
        "p", "a", "b", "strong", "i", "em",
        "li", "ul",
        "small", "span", "label",
        "h1", "h2", "h3", "h4", "h5", "h6"
    ],
    DEFAULT_ALLOWED_ATTRS: {
        default: ["class", "className"],
        a: ["href", "target", "rel"],
        span: ["style"],
        p: ["style"]
    }
});