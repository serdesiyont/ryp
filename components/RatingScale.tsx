"use client";

const ratingColor = (value: number) => {
  if (value <= 1) return "#dc2626";
  if (value <= 2) return "#f2994a";
  if (value <= 3) return "#facc15";
  if (value <= 4) return "#8ecf6f";
  return "#16a34a";
};

// Compact single-row rating: label + range on one line, 5 bars below.
export function RatingScale({
  label,
  value,
  onChange,
  required = false,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </h3>
        {(lowLabel || highLabel) && (
          <span className="shrink-0 text-xs text-gray-400">
            {lowLabel} – {highLabel}
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-label={`${label} ${v}`}
            onClick={() => onChange(v)}
            style={{
              backgroundColor:
                v <= value && value > 0 ? ratingColor(value) : "#e5e7eb",
            }}
            className="h-9 flex-1 rounded-md transition hover:opacity-80"
          />
        ))}
      </div>
    </div>
  );
}
