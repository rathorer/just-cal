import { Constants } from "../utilities/constants";

const SUBSENTENCE_DETECTION = /([,;:!?\n]+\s*)/g;
export function getTitle(userInput) {
    let multipleSentences = userInput.match(Constants.SENTENCE_DETECTION);
    let title = multipleSentences ? multipleSentences[0] : userInput;
    if (title.length > Constants.MAX_CHARS_FOR_TITLE) {
        let subsentences = title.split(SUBSENTENCE_DETECTION);
        title = title.substring(0, Constants.MAX_CHARS_FOR_TITLE);
        let charCount = 0;
        let subsentenceIndex = 0;
        let overallIndex = 0;
        for (let i = 0; i < subsentences.length; i++) {
            charCount += subsentences[i].length + 1;
            if (charCount > Constants.MAX_CHARS_FOR_TITLE) {
                subsentenceIndex = i;
                break;
            } else{
                overallIndex += charCount;
            }
        }
        return title.substring(0, overallIndex);
    }
    return title;
}