import { NextResponse } from 'next/server';

import { isAdminAuthenticated } from '@/lib/auth';
import { getDB, leads, consents } from '@/lib/db';
import { desc, inArray } from 'drizzle-orm';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDB();
  const leadRows = await db
    .select({
      id: leads.id,
      createdAt: leads.createdAt,
      firstName: leads.firstName,
      phone: leads.phone,
      email: leads.email,
      budget: leads.budget,
      propertyType: leads.propertyType,
      areas: leads.areas,
      timing: leads.timing,
      callPreference: leads.callPreference,
      timezone: leads.timezone,
      locale: leads.locale
    })
    .from(leads)
    .orderBy(desc(leads.createdAt));

  const consentsRows =
    leadRows.length === 0
      ? []
      : await db
          .select({
            leadId: consents.leadId,
            textVersion: consents.textVersion
          })
          .from(consents)
          .where(inArray(consents.leadId, leadRows.map((lead) => lead.id)));

  const headers = [
    'id',
    'createdAt',
    'firstName',
    'phone',
    'email',
    'budget',
    'propertyType',
    'areas',
    'timing',
    'callPreference',
    'timezone',
    'consentVersion'
  ];

  const lines = leadRows.map((lead) => {
    const consent = consentsRows.find((row) => row.leadId === lead.id);
    const createdAt =
      lead.createdAt instanceof Date ? lead.createdAt : new Date(Number(lead.createdAt) * 1000);

    return [
      lead.id,
      createdAt.toISOString(),
      lead.firstName,
      lead.phone,
      lead.email ?? '',
      lead.budget ?? '',
      lead.propertyType ?? '',
      (lead.areas ?? []).join('|'),
      lead.timing ?? '',
      lead.callPreference ?? '',
      lead.timezone ?? '',
      consent?.textVersion ?? ''
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
  });

  const csv = [headers.join(','), ...lines].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-export-${Date.now()}.csv"`
    }
  });
}
