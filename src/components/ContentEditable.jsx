import { useEffect, useRef, useCallback, forwardRef } from "react"
import { Constants } from "../utilities/constants"
import { sanitizeHTML,  } from "../utilities/utils"
import { renderToStaticMarkup } from "react-dom/server"

export const ContentEditable = forwardRef(({
  children,
  initialHTML = "",
  placeholder = "",
  onChange,
  onBlur
}, externalRef) => {

  const ref = useRef(null);
  const editorRef = useRef();
  const isFocused = useRef(false);
  const lastHtml = useRef("");
  
  // Forward the internal ref to the parent
  useEffect(() => {
    if (externalRef) {
      if (typeof externalRef === 'function') {
        externalRef(ref.current);
      } else {
        externalRef.current = ref.current;
      }
    }
  }, [externalRef]);
  
  const decodeHTML = (html) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  useEffect(() => {
    if (!ref.current || isFocused.current) {
      return;
    }
    let htmlContent;
    
    // Prioritize initialHTML prop over children
    if (initialHTML) {
      const decodedHtml = decodeHTML(initialHTML);
      htmlContent = sanitizeHTML(decodedHtml);
    } else if (typeof children === 'string') {
      // If children is already an HTML string, decode it first, then sanitize
      const decodedHtml = decodeHTML(children);
      htmlContent = sanitizeHTML(decodedHtml);
    } else if (children) {
      // If children is a React element, convert to HTML first
      const rawHTML = renderToStaticMarkup(children);
      htmlContent = sanitizeHTML(rawHTML);
    }
    
    if (htmlContent && ref.current.innerHTML !== htmlContent) {
      ref.current.innerHTML = htmlContent;
    }
  }, [children, initialHTML])

  const emitChange = () => {
    const html = editorRef.current.innerHTML
    if (html !== lastHtml.current) {
      lastHtml.current = html
      onChange?.(html)
    }
  }
 const insertTextAtCursor = (text) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents(); // Clear any selected text

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const insertHtmlAtCursor = (html) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents(); // Clear any selected text

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    range.insertNode(fragment);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handlePaste = (e) => {
    e.preventDefault()
    const html = e.clipboardData.getData("text/html");
    const sanitizedHtml = sanitizeHTML(html);
    console.log('Sanitized HTML:', sanitizedHtml);
    insertHtmlAtCursor(sanitizedHtml);
  };

  const handleInput = (e) => {
    //debounce and then call parent
    //onChange.(sanitizeHTML(ref.current.innerHTML))}
  };

  const handleBlur = (e) => {
    console.log('in on blur', ref.current.innerText);
    isFocused.current = false;
    const sanitized = sanitizeHTML(
      ref.current.innerHTML
    )
    ref.current.innerHTML = sanitized
    //lastHtml.current = sanitized
    onBlur?.(sanitized)
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onPaste={handlePaste}
      onInput={() => onChange?.(sanitizeHTML(ref.current.innerHTML))}
      onFocus={() => {
        isFocused.current = true;
      }}
      onBlur={() => handleBlur()}
    />
  )
})

ContentEditable.displayName = 'ContentEditable'

/* not being used.
const Editable = ({
  key,
  value = "",
  placeholder,
  children,
  onChange,
  onBlur,
  onFocus,
  onKeyDown
}) => {
  // const [content, setContent] = useState("");
  console.log('children:', children);
  const editorRef = useRef(null);
  //const childrenRef = useRef(children);
  const lastHtml = useRef(value);
  const allowedTags = Constants.DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = Constants.DEFAULT_ALLOWED_ATTRS;
  

  // Initialize content
  useEffect(() => {
    if (
      editorRef.current &&
      value !== lastHtml.current
    ) {
      editorRef.current.innerHTML = value
      lastHtml.current = value
    }
  }, [value])

  const emitChange = () => {
    const html = editorRef.current.innerHTML
    if (html !== lastHtml.current) {
      lastHtml.current = html
      onChange?.(html)
    }
  }
 const insertTextAtCursor = (text) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents(); // Clear any selected text

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    //document.execCommand("insertText", false, text)
    insertTextAtCursor(text);
  }

  const handleBlur = () => {
    console.log('in on blur', editorRef.current.innerHTML);
    const sanitized = sanitizeHTML(
      editorRef.current.innerText,
      allowedTags,
      allowedAttributes
    )
    editorRef.current.innerText = sanitized
    lastHtml.current = sanitized
    onBlur?.(sanitized)
  }

  // const onContentBlur = useCallback(evt => setContent(evt.currentTarget.innerHTML));

  return (
    <div id={"editable-div-" + key} key={key}
      className="overflow-y-auto min-h-auto max-h-full no-scrollbar p-0 focus:outline-1 custom-editor"
      ref={editorRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      // onInput={handleInput}
      //onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      //onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </div>
  )
}

export default Editable;
*/