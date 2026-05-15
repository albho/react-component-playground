import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import './ComponentPreview.scss';
import {
  DarkModeIcon,
  LaptopIcon,
  LightModeIcon,
  MobileIcon,
  TabletIcon,
} from './ComponentPreviewIcons';
import type { ThemePreference } from './usePreviewTheme';
import { usePreviewTheme } from './usePreviewTheme';

type ComponentPreviewProps = {
  children: ReactNode;
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
const themePreferences: ThemePreference[] = ['light', 'dark'];

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

const getThemeIcon = (theme: ThemePreference) =>
  theme === 'light' ? <LightModeIcon /> : <DarkModeIcon />;

export function ComponentPreview(props: ComponentPreviewProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const { themePreference, resolvedTheme, setThemePreference } =
    usePreviewTheme();
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
  const selectNextThemePreference = () => {
    const nextThemeIndex =
      (themePreferences.indexOf(themePreference) + 1) % themePreferences.length;

    setThemePreference(themePreferences[nextThemeIndex]);
  };

  return (
    <div className="component-preview__shell" ref={shellRef}>
      <section
        className="component-preview"
        data-is-resizing={resizeState !== undefined}
        data-theme={resolvedTheme}
        style={previewStyle}
      >
        <button
          className="component-preview__theme-toggle"
          type="button"
          aria-label={`Preview theme: ${themePreference}`}
          onClick={selectNextThemePreference}
        >
          {themePreferences.map(themeOption => (
            <span
              className="component-preview__theme-option"
              data-is-active={themePreference === themeOption}
              key={themeOption}
            >
              {getThemeIcon(themeOption)}
            </span>
          ))}
        </button>
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
