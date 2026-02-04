import { v4 as uuidv4 } from 'uuid'

let counter = 0

function getNextId() {
  return uuidv4()
}

function getNextCounter() {
  counter++
  return counter
}

// Club factory
export interface ClubData {
  id: string
  name: string
  shortName: string | null
  location: string | null
  logoUrl: string | null
  presidentId: string | null
  createdAt: Date
  updatedAt: Date
}

export function createClubData(overrides: Partial<ClubData> = {}): ClubData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    name: `Test Club ${num}`,
    shortName: `TC${num}`,
    location: 'Test Location',
    logoUrl: null,
    presidentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Member factory
export interface MemberData {
  id: string
  firstName: string
  lastName: string
  gender: 'men' | 'women'
  birthDate: Date | null
  country: string
  clubId: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function createMemberData(overrides: Partial<MemberData> = {}): MemberData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    firstName: `Test${num}`,
    lastName: `Member${num}`,
    gender: 'men',
    birthDate: new Date('1990-01-01'),
    country: 'Switzerland',
    clubId: null,
    imageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// User factory
export interface UserData {
  id: string
  email: string
  passwordHash: string
  role: 'super_admin' | 'admin'
  clubId: string | null
  createdAt: Date
  updatedAt: Date
}

export function createUserData(overrides: Partial<UserData> = {}): UserData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    email: `test${num}@example.com`,
    passwordHash: '$2b$10$hashedpassword', // bcrypt hash placeholder
    role: 'admin',
    clubId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Tournament factory
export interface TournamentData {
  id: string
  name: string
  date: Date
  location: string
  type: 'national' | 'international' | 'em' | 'wm'
  status: 'upcoming' | 'completed'
  participantCount: number | null
  logoUrl: string | null
  posterUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export function createTournamentData(overrides: Partial<TournamentData> = {}): TournamentData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    name: `Test Tournament ${num}`,
    date: new Date(),
    location: 'Test Location',
    type: 'national',
    status: 'upcoming',
    participantCount: null,
    logoUrl: null,
    posterUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Tournament Category factory
export interface TournamentCategoryData {
  id: string
  tournamentId: string
  name: string
  gender: 'men' | 'women'
  arm: 'left' | 'right'
  type: 'senior' | 'junior' | 'master' | 'amateur'
  weightClass: string | null
}

export function createTournamentCategoryData(overrides: Partial<TournamentCategoryData> = {}): TournamentCategoryData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    tournamentId: getNextId(),
    name: `Category ${num}`,
    gender: 'men',
    arm: 'right',
    type: 'senior',
    weightClass: '80kg',
    ...overrides,
  }
}

// Tournament Result factory
export interface TournamentResultData {
  id: string
  categoryId: string
  memberId: string | null
  athleteName: string
  country: string
  position: number
  basePoints: number
  bonusPoints: number
  totalPoints: number
}

export function createTournamentResultData(overrides: Partial<TournamentResultData> = {}): TournamentResultData {
  const num = getNextCounter()
  return {
    id: getNextId(),
    categoryId: getNextId(),
    memberId: null,
    athleteName: `Athlete ${num}`,
    country: 'Switzerland',
    position: 1,
    basePoints: 15,
    bonusPoints: 2,
    totalPoints: 17,
    ...overrides,
  }
}

// Reset counter for test isolation
export function resetFactoryCounter() {
  counter = 0
}
