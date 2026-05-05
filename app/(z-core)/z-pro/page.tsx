import React from 'react';
import { Briefcase, FileText, Plus, Settings, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ManageJobsServer from './ManageJobs.server';
import ProHubClient from './ProHubClient';

export default function ProfessionalHub() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* client header and overview controls */}
        <ProHubClient />

        {/* Server-rendered Manage section (hidden by client until toggled) */}
        <div id="manage-section" style={{ display: 'none' }}>
          <ManageJobsServer />
        </div>
      </div>
    </div>
  );
}
