import { useRef, useCallback } from 'react';

export function useImageDragResize(
  attachmentId: string | undefined,
  onResize: ((attachmentId: string, width: number) => void) | undefined
) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!attachmentId || !onResize || !imgRef.current) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = imgRef.current.offsetWidth;

      const snap = (w: number) => Math.max(50, Math.round(w / 10) * 10);

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!imgRef.current) return;
        const newWidth = snap(startWidth + (moveEvent.clientX - startX));
        imgRef.current.style.width = `${newWidth}px`;
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        const finalWidth = snap(startWidth + (upEvent.clientX - startX));
        onResize(attachmentId, finalWidth);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [attachmentId, onResize]
  );

  return { imgRef, handleMouseDown };
}
