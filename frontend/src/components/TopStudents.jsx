import GradeBadge from "./GradeBadge.jsx";

export default function TopStudents({ course, students }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-semibold text-slate-800">Top performers{course ? ` · ${course}` : ""}</h2>
      {students.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No passing students yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {s.rank}
                </span>
                <span className="font-medium text-slate-700">{s.name}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-slate-600">{s.percentage}%</span>
                <GradeBadge grade={s.grade} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
