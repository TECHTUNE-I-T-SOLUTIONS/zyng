import React from 'react';
import ManageJobs from './ManageJobs';
import { getPostedJobsWithApplications } from '@/lib/services/managerService.server';
import { cookies } from 'next/headers';

export default async function ManageJobsServer() {
  let token: string | null = null;
  try {
    const cookieStore = await cookies();
    // cookies() is server-only; guard in case this module is ever evaluated client-side unexpectedly
    token = cookieStore?.get ? cookieStore.get('sb-access-token')?.value || null : null;
  } catch (err) {
    token = null;
  }
  const { userId, opportunities, total, applications, myApplications } = await getPostedJobsWithApplications({ token, page: 1, perPage: 50 });

  // group applications by opportunity id
  const applicationsMap: Record<string, any[]> = {};
  for (const a of applications || []) {
    const key = a.opportunity?.id || a.opportunity_id || '';
    if (!applicationsMap[key]) applicationsMap[key] = [];
    applicationsMap[key].push(a);
  }

  return (
    // pass server-fetched data as props to client component
    <ManageJobs
      initialJobs={opportunities}
      initialApplicationsMap={applicationsMap}
      initialMyApps={myApplications}
      initialUser={{ id: userId }}
    />
  );
}
