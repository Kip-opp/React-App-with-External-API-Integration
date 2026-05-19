import './style/Pagination.css';

const Pagination = ({
  page = 1,
  totalPages = 1,
  hasNext = false,
  hasPrevious = false,
  onNext,
  onPrevious,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).slice(Math.max(page - 3, 0), page + 2);

  return (
    <div className="pagination">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        ← Previous
      </button>

      <div className="pagination-pages">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={pageNumber === page ? 'active' : ''}
            onClick={() => onPageChange?.(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;