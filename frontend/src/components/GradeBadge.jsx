const styles = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-sky-100 text-sky-700",
  C: "bg-amber-100 text-amber-700",
  Fail: "bg-red-100 text-red-700",
};

export default function GradeBadge({ grade }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[grade]}`}>
      {grade}
    </span>
  );
}
