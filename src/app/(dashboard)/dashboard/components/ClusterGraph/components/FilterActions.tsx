import React from 'react';

interface FilterActionsProps {
  hasAppliedFilters: boolean;
  hasSelectedFilters: boolean;
  loading: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({
  hasAppliedFilters,
  hasSelectedFilters,
  loading,
  onApplyFilters,
  onResetFilters  
}) => {
  return (
    <div className="flex items-center gap-2 mt-5">
      {hasAppliedFilters ? (
        <>
          {/* Show Filter button when there are new selections to apply */}
          <button
            onClick={onApplyFilters}
            disabled={!hasSelectedFilters || loading}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Filtering...' : 'Filter'}
          </button>
          
          {/* Always show Reset button when filters are applied */}
          <button
            onClick={onResetFilters}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </>
      ) : (
        /* Show only Filter button when no filters are applied yet */
        <button
          onClick={onApplyFilters}
          disabled={!hasSelectedFilters || loading}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Filtering...' : 'Filter'}
        </button>
      )}
    </div>
  );
};

export default FilterActions;