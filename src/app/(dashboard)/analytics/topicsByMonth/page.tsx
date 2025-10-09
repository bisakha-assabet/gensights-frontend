"use client";

import React from 'react';
import { AnalyticsLayout } from '../AnalyticsLayout';
import { ReusableChart } from '../ReusableChart';

const TopicsByMonthPage = () => {
  return (
    <AnalyticsLayout 
      title="INQUIRY TOPICS BY MONTH"
      showFilters={true}
    >
      <ReusableChart
        apiEndpoint="/analytics/month/"
        title="Analytics for topics by month"
        description="Distribution of inquiry topics across different months"
        chartHeight={400}
        showSummary={true}
      />
    </AnalyticsLayout>
  );
};

export default TopicsByMonthPage;