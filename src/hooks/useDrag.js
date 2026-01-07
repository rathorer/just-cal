import { useRef, useState, useEffect, useCallback } from "react";

function useDrag(onDrag, onDrop) {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const draggableKey = useRef("");

  const onPointerDown = (e) => {
    const target = e.target;
    const draggableElement =
      target.closest("[data-draggable]") || target.hasAttribute("data-draggable")
        ? target
        : null;

    if (!draggableElement) return;

    draggableKey.current = draggableElement.getAttribute("data-draggable") || "";
    setIsDragging(true);
    lastPosition.current = { x: e.clientX, y: e.clientY };
    target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;
      onDrag({
        delta: { x: dx, y: dy },
        target: draggableKey.current,
      });
      lastPosition.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging, onDrag]
  );

  const onPointerUp = useCallback(
    (e) => {
      if (!isDragging || !e.target) return;
      setIsDragging(false);
      e.target.releasePointerCapture(e.pointerId);
      const dx = e.clientX - lastPosition.current.x;
      const dy = e.clientY - lastPosition.current.y;
      if (onDrop) {
        onDrop({
          delta: { x: dx, y: dy },
          target: draggableKey.current,
        });
      }
    },
    [isDragging, onDrop]
  );

  useEffect(() => {
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  return { isDragging };
}

export default useDrag;