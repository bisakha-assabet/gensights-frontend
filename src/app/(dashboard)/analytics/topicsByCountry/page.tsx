"use client";

import React from 'react';
import { AnalyticsLayout } from '../AnalyticsLayout';
import { ReusableChart } from '../ReusableChart';

const TopicsByCountryPage = () => {
  return (
    <AnalyticsLayout 
      title="INQUIRY TOPICS BY COUNTRY"
      showFilters={true}
    >
      <ReusableChart
        apiEndpoint="/admin/analytics/country/"
        title="Analytics for topics by country"
        description="Distribution of inquiry topics across different countries"
        chartHeight={400}
        showSummary={true}
      />
    </AnalyticsLayout>
  );
};

export default TopicsByCountryPage;