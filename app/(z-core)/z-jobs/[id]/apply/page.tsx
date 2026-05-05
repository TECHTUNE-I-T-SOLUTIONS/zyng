import React from 'react';
import ApplyForm from './ApplyForm';
import { campusServiceAdmin } from '@/lib/services/campusService.server';

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const job = await campusServiceAdmin.getOpportunityById(id);
  if (!job) return <div className="p-6">Job not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Apply for {job.title}</h2>
      <p className="text-sm text-foreground/60 mb-6">{job.company}</p>
      <div className="bg-muted p-6 rounded-lg">
        <ApplyForm opportunity={job} />
      </div>
    </div>
  );
}
