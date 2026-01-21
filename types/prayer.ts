export type PrayerStatus = 'received' | 'prayed' | 'followed up'

export interface Prayer {
  id: string
  prayerId: string
  churchId: string | null
  title: string | null
  content: string
  name: string | null
  email: string | null
  status: PrayerStatus
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  updatedBy: string | null
}

export interface PrayerSubmission {
  name?: string
  email?: string
  content: string
  title?: string
  isAnonymous?: boolean
}

