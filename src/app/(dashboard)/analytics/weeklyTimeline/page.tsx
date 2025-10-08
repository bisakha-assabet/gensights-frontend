"use client";

import React from 'react';
import { AnalyticsLayout } from '../AnalyticsLayout';
import { ReusableChart } from '../ReusableChart';

const WeeklyTimeline = () => {
  return (
    <AnalyticsLayout 
      title="WEEKLY TIMELINE"
      showFilters={true}
    >
      <ReusableChart
        apiEndpoint="/admin/analytics/weekly/"
        title="Analytics for topics by week"
        description="Distribution of inquiry topics across different weeks"
        chartHeight={400}
        showSummary={true}
      />
    </AnalyticsLayout>
  );
};

export default WeeklyTimeline;