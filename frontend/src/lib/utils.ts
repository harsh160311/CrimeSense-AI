export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#94a3b8';
  }
}

export function getRiskColor(score: number): string {
  if (score >= 60) return '#ef4444';
  if (score >= 30) return '#f97316';
  return '#22c55e';
}

export function getRiskLabel(score: number): string {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function getAlertIcon(type: string): string {
  switch (type) {
    case 'spike': return 'zap';
    case 'prediction': return 'eye';
    case 'time_risk': return 'clock';
    case 'pattern': return 'alert-triangle';
    default: return 'info';
  }
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
