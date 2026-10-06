function Card({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function StatsCards({ stats }) {
  if (!stats) return null;
  const g = stats.gradeDistribution;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card label="Students" value={stats.total} sub={stats.course} />
      <Card label="Pass rate" value={`${stats.passPercentage}%`} sub={`${stats.passed} passed, ${stats.failed} failed`} />
      <Card label="Average" value={`${stats.averagePercentage}%`} sub={`High ${stats.highest}% / Low ${stats.lowest}%`} />
      <Card label="Grades" value={`${g.A} / ${g.B} / ${g.C} / ${g.Fail}`} sub="A / B / C / Fail" />
    </div>
  );
}
