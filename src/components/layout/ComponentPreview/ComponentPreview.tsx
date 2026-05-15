import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import './ComponentPreview.scss';

type ComponentPreviewProps = {
  children: ReactNode;
  theme: 'light' | 'dark';
};

type ResizeSide = 'left' | 'right';
type PreviewPreset = 'mobile' | 'tablet' | 'desktop';

type ResizeState = {
  maxWidth: number;
  side: ResizeSide;
  startWidth: number;
  startX: number;
};

const MIN_PREVIEW_WIDTH = 320;
const MOBILE_PREVIEW_WIDTH = 375;
const TABLET_PREVIEW_WIDTH = 768;
const DESKTOP_PREVIEW_WIDTH = 1024;
const DESKTOP_MAX_WIDTH_CUSHION = 96;
const previewPresets: PreviewPreset[] = ['mobile', 'tablet', 'desktop'];

const MobileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M300.31-68q-26.62 0-45.47-18.84Q236-105.69 236-132.31v-695.38Q236-858 253-875q17-17 47.31-17h360.92q26.62 0 45.46 18.84 18.85 18.85 18.85 45.47v146.31q18.46-2.7 32.46 9.19 14 11.88 14 29.96v91.38q0 18.08-14 29.97-14 11.88-32.46 9.19v379.38q0 26.62-18.85 45.47Q687.85-68 661.23-68H300.31Zm0-52h360.92q5.38 0 8.85-3.46 3.46-3.46 3.46-8.85v-695.38q0-5.39-3.46-8.85-3.47-3.46-8.85-3.46H300.31q-5.39 0-8.85 3.46t-3.46 8.85v695.38q0 5.39 3.46 8.85t8.85 3.46ZM288-120v-720 720Zm105.69-63.39h174.16q11.07 0 18.53-7.4 7.47-7.41 7.47-18.38 0-10.98-7.47-18.6-7.46-7.61-18.53-7.61H393.69q-11.07 0-18.53 7.4-7.47 7.41-7.47 18.38 0 10.98 7.47 18.6 7.46 7.61 18.53 7.61Z" />
  </svg>
);

const TabletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M228.31-68q-26.62 0-45.47-18.84Q164-105.69 164-132.31v-695.38q0-26.62 18.84-45.47Q201.69-892 228.31-892h503.38q26.62 0 45.47 18.84Q796-854.31 796-827.69v695.38q0 26.62-18.84 45.47Q758.31-68 731.69-68H228.31ZM216-273.23v140.92q0 5.39 3.46 8.85t8.85 3.46h503.38q5.39 0 8.85-3.46t3.46-8.85v-140.92H216Zm218.31 98.31h91.38q8.83 0 15.26-6.23 6.43-6.24 6.43-15.47t-6.43-15.46q-6.43-6.23-15.26-6.23h-91.38q-8.83 0-15.26 6.23t-6.43 15.46q0 9.23 6.43 15.47 6.43 6.23 15.26 6.23ZM216-325.23h528V-730H216v404.77ZM216-782h528v-45.69q0-5.39-3.46-8.85t-8.85-3.46H228.31q-5.39 0-8.85 3.46t-3.46 8.85V-782Zm0 0v-58 58Zm0 508.77V-120v-153.23Z" />
  </svg>
);

const LaptopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M89.39-174.77q-11.07 0-18.54-7.41-7.46-7.4-7.46-18.38 0-10.98 7.46-18.59 7.47-7.62 18.54-7.62h781.22q11.07 0 18.54 7.4 7.46 7.41 7.46 18.39t-7.46 18.59q-7.47 7.62-18.54 7.62H89.39Zm90.92-100q-27.01 0-45.66-18.65Q116-312.07 116-339.08v-383.38q0-27.01 18.65-45.66 18.65-18.65 45.66-18.65h599.38q27.01 0 45.66 18.65Q844-749.47 844-722.46v383.38q0 27.01-18.65 45.66-18.65 18.65-45.66 18.65H180.31Zm0-52h599.38q4.62 0 8.46-3.84 3.85-3.85 3.85-8.47v-383.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H180.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v383.38q0 4.62 3.85 8.47 3.84 3.84 8.46 3.84Zm-12.31 0v-408 408Z" />
  </svg>
);

const getClampedWidth = (width: number, maxWidth: number) =>
  Math.min(Math.max(width, Math.min(MIN_PREVIEW_WIDTH, maxWidth)), maxWidth);

const getPresetIcon = (preset: PreviewPreset) => {
  if (preset === 'mobile') {
    return <MobileIcon />;
  }

  if (preset === 'tablet') {
    return <TabletIcon />;
  }

  return <LaptopIcon />;
};

export function ComponentPreview(props: ComponentPreviewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState<number>();
  const [previewWidth, setPreviewWidth] = useState<number>();
  const [resizeState, setResizeState] = useState<ResizeState>();

  useEffect(() => {
    const shellElement = shellRef.current;

    if (!shellElement) {
      return;
    }

    const updateMaxWidth = () => {
      const nextMaxWidth = shellElement.getBoundingClientRect().width;

      setMaxWidth(nextMaxWidth);
      setPreviewWidth(currentWidth =>
        currentWidth === undefined
          ? nextMaxWidth
          : getClampedWidth(currentWidth, nextMaxWidth),
      );
    };

    updateMaxWidth();

    const resizeObserver = new ResizeObserver(updateMaxWidth);
    resizeObserver.observe(shellElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!resizeState) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const pointerDelta = event.clientX - resizeState.startX;
      const widthDelta =
        resizeState.side === 'right' ? pointerDelta * 2 : pointerDelta * -2;

      setPreviewWidth(
        getClampedWidth(
          resizeState.startWidth + widthDelta,
          resizeState.maxWidth,
        ),
      );
    };

    const handlePointerUp = () => {
      setResizeState(undefined);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [resizeState]);

  const handleResizeStart =
    (side: ResizeSide) => (event: PointerEvent<HTMLButtonElement>) => {
      if (maxWidth === undefined) {
        return;
      }

      event.preventDefault();
      setResizeState({
        maxWidth,
        side,
        startWidth: previewWidth ?? maxWidth,
        startX: event.clientX,
      });
    };

  const setPreviewPreset = (width: number) => {
    if (maxWidth === undefined) {
      return;
    }

    setPreviewWidth(getClampedWidth(width, maxWidth));
  };

  const getPresetWidth = (preset: PreviewPreset) => {
    if (preset === 'mobile') {
      return MOBILE_PREVIEW_WIDTH;
    }

    if (preset === 'tablet') {
      return TABLET_PREVIEW_WIDTH;
    }

    return maxWidth;
  };

  const activePreset: PreviewPreset =
    maxWidth !== undefined && previewWidth !== undefined
      ? previewWidth >=
        (maxWidth >= DESKTOP_PREVIEW_WIDTH
          ? DESKTOP_PREVIEW_WIDTH
          : Math.max(
              TABLET_PREVIEW_WIDTH,
              maxWidth - DESKTOP_MAX_WIDTH_CUSHION,
            ))
        ? 'desktop'
        : previewWidth >= TABLET_PREVIEW_WIDTH
          ? 'tablet'
          : 'mobile'
      : 'desktop';

  const previewStyle =
    previewWidth === undefined
      ? undefined
      : ({
          '--component-preview-width': `${previewWidth}px`,
        } as CSSProperties);
  const presetStyle = {
    '--component-preview-active-preset': previewPresets.indexOf(activePreset),
  } as CSSProperties;

  return (
    <div className="component-preview__shell" ref={shellRef}>
      <section
        className="component-preview"
        data-is-resizing={resizeState !== undefined}
        data-theme={props.theme}
        style={previewStyle}
      >
        <button
          className="component-preview__resize-handle component-preview__resize-handle--left"
          type="button"
          aria-label="Resize preview from left"
          onPointerDown={handleResizeStart('left')}
        />
        {props.children}
        <button
          className="component-preview__resize-handle component-preview__resize-handle--right"
          type="button"
          aria-label="Resize preview from right"
          onPointerDown={handleResizeStart('right')}
        />
      </section>
      <div
        className="component-preview__presets"
        aria-label="Preview width"
        style={presetStyle}
      >
        {previewPresets.map(preset => (
          <button
            className="component-preview__preset-button"
            type="button"
            aria-label={`${preset} preview width`}
            aria-pressed={activePreset === preset}
            key={preset}
            onClick={() => {
              const presetWidth = getPresetWidth(preset);

              if (presetWidth !== undefined) {
                setPreviewPreset(presetWidth);
              }
            }}
          >
            {getPresetIcon(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
