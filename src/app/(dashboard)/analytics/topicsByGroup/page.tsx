"use client";

import React from 'react';
import { AnalyticsLayout } from '../AnalyticsLayout';
import { ReusableChart } from '../ReusableChart';

const TopicsByGroupPage = () => {
  return (
    <AnalyticsLayout 
      title="INQUIRY TOPICS BY GROUP"
      showFilters={true}
    >
      <ReusableChart
        apiEndpoint="/analytics/group/"
        title="Analytics for topics by group"
        description="Distribution of inquiry topics across different groups"
        chartHeight={400}
        showSummary={true}
      />
    </AnalyticsLayout>
  );
};

export default TopicsByGroupPage;