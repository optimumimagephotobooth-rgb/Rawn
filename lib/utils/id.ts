/**
 * Generate a unique ID in the format used by the system
 * Examples: CH_abc12345, PR_xyz67890
 */
export function generateId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 10)
  return `${prefix}_${random}`
}

export function generateChurchId(): string {
  return generateId('CH')
}

export function generatePrayerId(): string {
  return generateId('PR')
}

export function generateSermonId(): string {
  return generateId('SM')
}

export function generateEventId(): string {
  return generateId('EV')
}

export function generateBlogPostId(): string {
  return generateId('BP')
}

export function generateDonationId(): string {
  return generateId('DN')
}

export function generateVolunteerId(): string {
  return generateId('VL')
}

export function generateMembershipId(): string {
  return generateId('MB')
}

