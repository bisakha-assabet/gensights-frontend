import React from 'react';

interface FilterStatusProps {
  loading: boolean;
}

const FilterStatus: React.FC<FilterStatusProps> = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="mb-4 text-sm text-blue-600 dark:text-blue-400">
          <span>Applying filters...</span>
        </div>
      )}
    </>
  );
};

export default FilterStatus;