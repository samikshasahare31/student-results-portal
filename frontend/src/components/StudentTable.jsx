import GradeBadge from "./GradeBadge.jsx";

export default function StudentTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return <p className="p-6 text-center text-sm text-slate-500">No students found.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Roll No</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Percentage</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs">{s.rollNo}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
              <td className="px-4 py-3">{s.course}</td>
              <td className="px-4 py-3">{s.totalMarks}/{s.maxMarks}</td>
              <td className="px-4 py-3">{s.percentage}%</td>
              <td className="px-4 py-3"><GradeBadge grade={s.grade} /></td>
              <td className={`px-4 py-3 font-medium ${s.status === "Pass" ? "text-emerald-600" : "text-red-600"}`}>
                {s.status}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button onClick={() => onEdit(s)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                <button onClick={() => onDelete(s)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
