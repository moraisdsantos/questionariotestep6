import type { ReactNode } from 'react';

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StepCard({ title, subtitle, children }: StepCardProps) {
  return (
    <section className="step-card">
      <div className="step-header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="step-body">{children}</div>
    </section>
  );
}
