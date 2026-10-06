import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client.js";
import StatsCards from "./components/StatsCards.jsx";
import TopStudents from "./components/TopStudents.jsx";
import StudentTable from "./components/StudentTable.jsx";
import StudentForm from "./components/StudentForm.jsx";

export default function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [top, setTop] = useState([]);
  const [filters, setFilters] = useState({ course: "", status: "", q: "" });
  const [editing, setEditing] = useState(null); // null | "new" | student
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const topCourse = filters.course || courses[0] || "";

  const load = useCallback(async () => {
    try {
      setError("");
      const [list, courseData, statData] = await Promise.all([
        api.list(filters),
        api.courses(),
        api.stats(filters.course),
      ]);
      setStudents(list.students);
      setCourses(courseData.courses);
      setStats(statData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250); 
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!topCourse) return setTop([]);
    api.top(topCourse, 5).then((d) => setTop(d.students)).catch(() => setTop([]));
  }, [topCourse, students]);

  const save = async (payload) => {
    if (editing === "new") await api.create(payload);
    else await api.update(editing.id, payload);
    setEditing(null);
    await load();
  };

  const remove = async (student) => {
    if (!window.confirm(`Delete ${student.name} (${student.rollNo})?`)) return;
    try {
      await api.remove(student.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const select = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Results Portal</h1>
          <p className="text-sm text-slate-500">Store, view and analyze exam results</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Add student
        </button>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
            <input
              className={`${select} min-w-40 flex-1`}
              placeholder="Search name or roll no"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
            <select className={select} value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className={select} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Pass + Fail</option>
              <option>Pass</option>
              <option>Fail</option>
            </select>
          </div>
          {loading ? (
            <p className="p-6 text-center text-sm text-slate-500">Loading...</p>
          ) : (
            <StudentTable students={students} onEdit={setEditing} onDelete={remove} />
          )}
        </section>

        <TopStudents course={topCourse} students={top} />
      </div>

      {editing && (
        <StudentForm
          initial={editing === "new" ? null : editing}
          courses={courses}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
