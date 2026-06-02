import { getTitle } from "../capabilities/titleDetection";
import { memoize } from "../utilities/utils";

/**
 * 
 * @param {string} text
 * @returns {Date} datetime object 
 */
function getTitleOfATextPlain(text) {
    return getTitle(text);
}
const getTitleOfAText = memoize(getTitleOfATextPlain);

export { getTitleOfAText }