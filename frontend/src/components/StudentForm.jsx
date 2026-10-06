import { useState } from "react";

const emptySubject = () => ({ name: "", marks: "" });

export default function StudentForm({ initial, courses, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [rollNo, setRollNo] = useState(initial?.rollNo || "");
  const [course, setCourse] = useState(initial?.course || "");
  const [subjects, setSubjects] = useState(
    initial?.subjects?.map((s) => ({ name: s.name, marks: String(s.marks) })) || [emptySubject()]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setSubject = (i, field, value) =>
    setSubjects((list) => list.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  // Mirrors the server rules so users get instant feedback
  const validate = () => {
    if (!name.trim() || !rollNo.trim() || !course.trim()) return "Name, roll number and course are required";
    if (subjects.length === 0) return "Add at least one subject";
    for (const [i, s] of subjects.entries()) {
      if (!s.name.trim()) return `Subject ${i + 1}: name is required`;
      if (s.marks === "" || Number.isNaN(Number(s.marks))) return `Subject ${i + 1}: enter marks`;
      if (Number(s.marks) < 0 || Number(s.marks) > 100) return `Subject ${i + 1}: marks must be between 0 and 100`;
    }
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        rollNo: rollNo.trim(),
        course: course.trim(),
        subjects: subjects.map((s) => ({ name: s.name.trim(), marks: Number(s.marks) })),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4">
      <form onSubmit={submit} className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">{initial ? "Edit student" : "Add student"}</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-600">Name
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm text-slate-600">Roll number
            <input className={input} value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
          </label>
          <label className="text-sm text-slate-600 sm:col-span-2">Course / department
            <input className={input} list="course-list" value={course} onChange={(e) => setCourse(e.target.value)} />
            <datalist id="course-list">{courses.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Subjects (marks out of 100)</span>
            <button type="button" onClick={() => setSubjects((l) => [...l, emptySubject()])} className="text-sm text-blue-600 hover:underline">
              + Add subject
            </button>
          </div>
          <div className="space-y-2">
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} placeholder="Subject" value={s.name} onChange={(e) => setSubject(i, "name", e.target.value)} />
                <input className={`${input} w-24`} type="number" min="0" max="100" placeholder="Marks" value={s.marks} onChange={(e) => setSubject(i, "marks", e.target.value)} />
                <button type="button" disabled={subjects.length === 1} onClick={() => setSubjects((l) => l.filter((_, idx) => idx !== i))} className="px-2 text-red-500 disabled:opacity-30" aria-label="Remove subject">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
