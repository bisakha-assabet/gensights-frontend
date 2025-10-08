'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, File, X, FileText, FileSpreadsheet, Image, Archive, Music, Video } from 'lucide-react';
import ImportPreview from './ImportPreview';
import { parseFile } from './parse';

interface DataImportProps {
  onImportSuccess: () => void;
  isLoading?: boolean;
  error?: string;
}

const DataImport: React.FC<DataImportProps> = ({ 
  onImportSuccess, 
  isLoading = false, 
  error = '' 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>('CSV');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    if (['csv', 'xlsx', 'xls'].includes(ext)) return FileSpreadsheet;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return Image;
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return Archive;
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return Music;
    if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return Video;
    return File;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const extension = getFileExtension(file.name);
      setFormat(extension);
      setImportError('');
      setShowPreview(false);
    }
  };

  const handleBrowseClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (): void => {
    setSelectedFile(null);
    setFormat('CSV');
    setShowPreview(false);
    setParsedData([]);
    setHeaders([]);
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedFile) {
      setImportError('Please select a file to import');
      return;
    }

    setIsProcessing(true);
    setImportError('');

    try {
      const fileContent = await readFile(selectedFile);
      const extension = getFileExtension(selectedFile.name).toLowerCase();

      const supportedFormats = ['csv', 'json', 'txt'];
      if (!supportedFormats.includes(extension)) {
        if (['xlsx', 'xls'].includes(extension)) {
          setImportError('Excel files require additional parsing. Please convert to CSV format.');
        } else {
          setImportError(`Unsupported file format: ${extension}. Supported formats: ${supportedFormats.join(', ')}`);
        }
        return;
      }

      const result = parseFile(fileContent, extension);

      if (result.data.length === 0) {
        setImportError('No data found in the file or file is empty');
        return;
      }

      const requiredFields = ['case_no', 'question', 'product', 'country_code'];
      const missingFields = requiredFields.filter(field => !result.headers.includes(field));
      
      if (missingFields.length > 0) {
        setImportError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      setHeaders(result.headers);
      setParsedData(result.data);
      setShowPreview(true);

    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse file');
      console.error('File parsing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToImport = (): void => {
    setShowPreview(false);
  };

  const handleConfirmImport = async (): Promise<void> => {
    setIsProcessing(true);
    setImportError('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/data/import/`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      
      // Log the response for debugging
      console.log('Import API Response:', responseData);

      // Check if the API returned an error (even with status 200)
      if (!response.ok || responseData.success === false || responseData.status_code >= 400) {
        let errorMessage = 'Failed to import data';
        
        if (responseData.message) {
          // Parse the detailed error message
          errorMessage = responseData.message;
          
          // Make the error message more user-friendly
          if (errorMessage.includes('question with this case no already exists')) {
            errorMessage = 'Import failed: Some case numbers already exist in the database. Please ensure all case numbers are unique.';
          }
          
          if (errorMessage.includes('Date has wrong format')) {
            errorMessage += '\n\nAdditionally, date format is incorrect. Please ensure dates are in YYYY-MM-DD format (e.g., 2024-01-15).';
          }
        }
        
        throw new Error(errorMessage);
      }

      // If we get here, the import was successful
      onImportSuccess();

    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import data');
      console.error('Import error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const IconComponent = selectedFile ? getFileIcon(getFileExtension(selectedFile.name)) : File;

  if (showPreview) {
    return (
      <ImportPreview
        data={parsedData}
        headers={headers}
        fileName={selectedFile?.name || ''}
        format={format}
        onConfirm={handleConfirmImport}
        onBack={handleBackToImport}
        isLoading={isProcessing}
      />
    );
  }

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">IMPORT</h1>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          The importer will import the following fields: questions_id, created_id, updated_id, index, case_no, groups, question, product, 
          country_code, case_created_date, product_class, clusters
        </p>
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Ensure that:
          </p>
          <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
            <li>All case numbers (case_no) are unique</li>
            <li>Dates are in YYYY-MM-DD format (e.g., 2024-01-15)</li>
            <li>Required fields are present: case_no, question, product, country_code</li>
          </ul>
        </div>
      </div>

      {(error || importError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 whitespace-pre-line">{error || importError}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            File to Import :
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".csv,.json,.txt,.xlsx,.xls"
            />
            <button
              onClick={handleBrowseClick}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors duration-200"
              type="button"
              disabled={isLoading || isProcessing}
            >
              Browse...
            </button>
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <IconComponent className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <button
                  onClick={handleRemoveFile}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  type="button"
                  disabled={isLoading || isProcessing}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Format :
          </label>
          <div className="relative">
            <select
              value={format}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value)}
              className="w-32 px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              disabled={isLoading || isProcessing}
            >
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
              <option value="TXT">TXT</option>
              <option value="XLSX">XLSX</option>
              <option value="XLS">XLS</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={!selectedFile || isLoading || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImport;