export default function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-0.5 text-sm"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-black" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}
