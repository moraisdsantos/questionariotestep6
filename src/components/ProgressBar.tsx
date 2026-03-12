interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((current / total) * 100)));

  return (
    <div className="progress-shell" aria-label="Progresso do quiz">
      <div className="progress-meta">
        <span>Etapa {current} de {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
