const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.errors?.join(", ") || data.error || "Request failed");
  }
  return data;
}

const query = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
};

export const api = {
  list: (params) => request(`/students${query(params)}`),
  courses: () => request("/students/courses"),
  stats: (course) => request(`/students/stats${query({ course })}`),
  top: (course, limit = 5) => request(`/students/top${query({ course, limit })}`),
  create: (student) => request("/students", { method: "POST", body: JSON.stringify(student) }),
  update: (id, student) =>
    request(`/students/${id}`, { method: "PUT", body: JSON.stringify(student) }),
  remove: (id) => request(`/students/${id}`, { method: "DELETE" }),
};
