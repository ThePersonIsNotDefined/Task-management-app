import type { TaskStatistics } from '../domain/statistics';
interface Props { statistics: TaskStatistics; }
export function StatisticsDashboard({ statistics }: Props) {
  return <section className="statistics" aria-label="Task statistics"><div><strong>{statistics.completionPercent}%</strong><span>completed</span></div><div><strong>{statistics.overdue.length}</strong><span>overdue</span></div><div><strong>{statistics.averageCompletionDays?.toFixed(1) ?? '-'}</strong><span>avg. days</span></div><div><strong>{statistics.byStatus.todo + statistics.byStatus['in-progress']}</strong><span>open</span></div></section>;
}