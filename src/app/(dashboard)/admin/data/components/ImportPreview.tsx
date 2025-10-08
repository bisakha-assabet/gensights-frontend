import React from 'react';

interface ImportPreviewProps {
  data: any[];
  headers: string[];
  fileName: string;
  format: string;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({ 
  data, 
  headers, 
  fileName, 
  format, 
  onConfirm, 
  onBack,
  isLoading = false
}) => {
  const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return '';
    return text.toString().length > maxLength ? text.toString().substring(0, maxLength) + '...' : text.toString();
  };

  return (
    <div className="w-full p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">IMPORT</h1>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Below is a preview of data to be imported. If you are satisfied with results, click 'Confirm Import'
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : 'Confirm Import'}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={isLoading}
          >
            Back to Import
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
        <p className="text-sm text-gray-600">File: {fileName} ({format})</p>
      </div>

      {/* Table Container with horizontal scroll and fixed layout */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-blue-400">
            <tr>
              {headers.map((header, index) => {
                const isQuestionColumn = header.toLowerCase().includes('question');
                return (
                  <th 
                    key={index}
                    className={`px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                      isQuestionColumn ? 'w-80' : 'w-32'
                    }`}
                  >
                    <div className="truncate">
                      {header}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {headers.map((header, colIndex) => {
                  const isQuestionColumn = header.toLowerCase().includes('question');
                  return (
                    <td 
                      key={colIndex}
                      className={`px-4 py-4 text-sm text-gray-900 align-top ${
                        isQuestionColumn ? 'max-w-md' : 'max-w-xs'
                      }`}
                    >
                      <div className="break-words overflow-hidden">
                        {isQuestionColumn 
                          ? truncateText(row[header], 200)
                          : truncateText(row[header], 50)
                        }
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Summary */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Showing {Math.min(data.length, 10)} of {data.length} rows • {headers.length} columns</p>
        {data.length > 10 && (
          <p className="text-xs text-gray-500 mt-1">Only first 10 rows are shown in preview</p>
        )}
      </div>
    </div>
  );
};

export default ImportPreview;
