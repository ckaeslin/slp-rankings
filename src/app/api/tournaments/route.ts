import { NextRequest, NextResponse } from 'next/server'
import { db, tournaments } from '@/db'
import { desc, eq } from 'drizzle-orm'

// Helper to get session from cookie
function getSession(request: NextRequest) {
  const cookie = request.cookies.get('admin-session')?.value
  if (!cookie) return null
  try {
    return JSON.parse(Buffer.from(cookie, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

// GET all tournaments
export async function GET() {
  try {
    const allTournaments = await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.date))

    return NextResponse.json(allTournaments)
  } catch (error) {
    console.error('Failed to fetch tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

// POST create new tournament - super_admin only
export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const newTournament = await db.insert(tournaments).values({
      name: body.name,
      date: new Date(body.date),
      location: body.location,
      type: body.type || 'national',
      status: body.status || 'upcoming',
      logoUrl: body.logoUrl,
      posterUrl: body.posterUrl,
    }).returning()

    return NextResponse.json(newTournament[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
