export type UserRole = 'Admin' | 'Editor' | 'Media Team' | 'Teacher' | 'Student'
export type UserStatus = 'Active' | 'Inactive' | 'Suspended'

export interface User {
  id: string
  email: string
  role: UserRole
  churchId: string | null
  status: UserStatus
  joinedAt: string
  createdAt: string
  updatedAt: string
}

export interface UserContext extends User {
  church?: {
    id: string
    churchId: string
    name: string
    plan: string
    status: string
  }
}

