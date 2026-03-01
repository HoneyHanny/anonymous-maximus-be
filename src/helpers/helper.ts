// Typesafe GUID (UUID v4) brand
export type Guid = string & { __brand: 'Guid' }

export function isGuid(id: string): id is Guid {
  // UUID v4 regex
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}
