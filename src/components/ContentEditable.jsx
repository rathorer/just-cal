import { useEffect, useRef, useCallback } from "react"
import { Constants } from "../utilities/constants"
import { sanitizeHTML } from "../utilities/utils"
import { renderToStaticMarkup } from "react-dom/server"

export const ContentEditable = ({
  children,
  initialHTML = "",
  onChange,
  onBlur
}) => {

  const ref = useRef(null)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current && ref.current) {
      const rawHTML = renderToStaticMarkup(children);

      ref.current.innerHTML = sanitizeHTML(rawHTML);
      mounted.current = true
    }
  }, [children])

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

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    //document.execCommand("insertText", false, text)
    insertTextAtCursor(text);
  }

  const handleBlur = () => {
    console.log('in on blur', editorRef.current.innerHTML);
    const sanitized = sanitizeHTML(
      editorRef.current.innerHTML,
      allowedTags,
      allowedAttributes
    )
    editorRef.current.innerHTML = sanitized
    lastHtml.current = sanitized
    onBlur?.(sanitized)
  }


  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onPaste={handlePaste}
      onInput={() => onChange?.(sanitizeHTML(ref.current.innerHTML))}
      onBlur={() => {
        ref.current.innerHTML = sanitizeHTML(ref.current.innerHTML)
        onBlur?.(ref.current.innerHTML)
      }}
    />
  )
}





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
      editorRef.current.innerHTML,
      allowedTags,
      allowedAttributes
    )
    editorRef.current.innerHTML = sanitized
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