import { useRef, useCallback } from 'react';
import Box from '@mui/material/Box';

interface ResizableImageProps {
  src?: string;
  alt?: string;
  width?: string | number;
  'data-attachment-id'?: string;
  onResize?: (attachmentId: string, width: number) => void;
}

function ResizableImage({
  src,
  alt,
  width,
  'data-attachment-id': attachmentId,
  onResize,
  ...rest
}: ResizableImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!attachmentId || !onResize || !imgRef.current) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = imgRef.current.offsetWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!imgRef.current) return;
        const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
        imgRef.current.style.width = `${newWidth}px`;
      };

      const onMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        const finalWidth = Math.max(50, startWidth + (upEvent.clientX - startX));
        onResize(attachmentId, finalWidth);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [attachmentId, onResize]
  );

  // No attachment ID means this is a regular external image — render plain img
  if (!attachmentId || !onResize) {
    return <img src={src} alt={alt} width={width} {...rest} />;
  }

  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        '&:hover .resize-handle': { opacity: 1 },
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          ...(width ? { width: `${width}px` } : {}),
        }}
        {...rest}
      />
      <Box
        component="span"
        className="resize-handle"
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 14,
          height: 14,
          bgcolor: 'rgba(0,0,0,0.35)',
          borderRadius: '2px',
          cursor: 'nwse-resize',
          opacity: 0,
          transition: 'opacity 0.15s',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 3,
            right: 3,
            width: 6,
            height: 6,
            borderRight: '2px solid rgba(255,255,255,0.8)',
            borderBottom: '2px solid rgba(255,255,255,0.8)',
          },
        }}
      />
    </Box>
  );
}

export default ResizableImage;
