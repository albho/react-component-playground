import type { ReactNode } from 'react';
import './ComponentPreview.scss';

type ComponentPreviewProps = {
  children: ReactNode;
  theme: 'light' | 'dark';
};

export function ComponentPreview({ children, theme }: ComponentPreviewProps) {
  return (
    <section className="component-preview" data-theme={theme}>
      {children}
    </section>
  );
}
