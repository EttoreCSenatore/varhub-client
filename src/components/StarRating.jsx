import { Star, StarFill } from 'react-bootstrap-icons';

// Read-only when no onChange is given.
export default function StarRating({ value, onChange, size = 28 }) {
  return (
    <span role={onChange ? 'radiogroup' : 'img'} aria-label={`Rating: ${value} out of 5`} className="d-inline-flex gap-1 align-middle">
      {[1, 2, 3, 4, 5].map((n) => {
        const Icon = n <= Math.round(value) ? StarFill : Star;
        const icon = <Icon size={size} className={n <= Math.round(value) ? 'text-warning' : 'text-secondary'} aria-hidden />;
        return onChange ? (
          <button
            key={n}
            type="button"
            className="btn btn-link p-0 border-0"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </span>
  );
}
