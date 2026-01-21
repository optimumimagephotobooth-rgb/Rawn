export type SermonCategory = 'Prophetic' | 'Prayer' | 'Discipleship' | 'Healing' | 'Leadership'

export interface Sermon {
  id: string
  sermon_id: string
  church_id: string | null
  title: string
  speaker: string | null
  category: SermonCategory | null
  description: string | null
  video_url: string | null
  audio_url: string | null
  notes_url: string | null
  scripture_references: string[] | null
  date: string | null
  created_at: string
  updated_at: string
}

export interface SermonFormData {
  title: string
  speaker?: string
  category?: SermonCategory
  description?: string
  videoUrl?: string
  audioUrl?: string
  notesUrl?: string
  scriptureReferences?: string[]
  date?: string
}

