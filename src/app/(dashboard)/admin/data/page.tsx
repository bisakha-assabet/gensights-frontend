"use client";
import React from 'react';
import  { useState, useEffect } from 'react';
import DataView from './components/DataView';
import DataImport from './components/DataImport';

interface DataItem {
  question_id: number;
  index: string;
  case_no: string;
  question: string;
  product: string;
  country_code: string;
  case_created_date: string;
  product_class: string;
  clusters: number[];
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DataItem[];
}

const DataPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'import' | 'view'>('import');
  const [importedData, setImportedData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/data/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug: Log the actual response structure
      console.log('Fetch API Response:', data);
      
      // Check if the response indicates an error (even with status 200)
      if (data.success === false || data.status_code >= 400) {
        throw new Error(data.message || 'API returned an error');
      }
      
      // Handle different possible response structures
      let results: DataItem[] = [];
      
      if (Array.isArray(data)) {
        // If the response is directly an array
        results = data;
      } else if (data && Array.isArray(data.results)) {
        // If the response has a results property that's an array
        results = data.results;
      } else if (data && Array.isArray(data.data)) {
        // If the response has a data property that's an array
        results = data.data;
      } else if (data && data.data === null) {
        // If the response has data: null (empty state)
        results = [];
      } else if (data && typeof data === 'object') {
        // If the response is an object but doesn't have expected structure
        console.warn('Unexpected API response structure:', data);
        results = [];
      } else {
        // If the response is neither an array nor an object with expected properties
        console.warn('Unexpected API response:', data);
        results = [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleImportSuccess = () => {
    // Refresh data after successful import
    fetchData();
    setCurrentView('view');
  };

  const handleBackToImport = () => {
    setCurrentView('import');
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (currentView === 'view' && importedData.length > 0) {
    return (
      <DataView
        data={importedData}
        onBackToImport={handleBackToImport}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
    );
  }

  return (
    <DataImport 
      onImportSuccess={handleImportSuccess}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default DataPage;