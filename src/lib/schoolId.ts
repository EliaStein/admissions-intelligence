// Schools can live in the CRM's catalog, admissions-intelligence's own
// (legacy) table, or both under different UUIDs. The composite id keeps
// both references alive through the wizard's string-based school id props
// without changing every component's signature.
export function encodeSchoolId(crmId?: string | null, localId?: string | null): string {
  if (crmId && localId) return `both:${crmId}:${localId}`;
  if (crmId) return `crm:${crmId}`;
  if (localId) return `local:${localId}`;
  throw new Error('encodeSchoolId requires at least one id');
}

export interface DecodedSchoolId {
  crmId?: string;
  localId?: string;
}

export function decodeSchoolId(id: string): DecodedSchoolId {
  const [tag, a, b] = id.split(':');
  if (tag === 'both') return { crmId: a, localId: b };
  if (tag === 'crm') return { crmId: a };
  if (tag === 'local') return { localId: a };
  return {};
}
