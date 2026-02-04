import { NextRequest, NextResponse } from 'next/server'
import { db, tournaments } from '@/db'
import { eq } from 'drizzle-orm'

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

// GET single tournament
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1)

    if (tournament.length === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tournament[0])
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

// PUT update tournament - super_admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const updated = await db
      .update(tournaments)
      .set({
        name: body.name,
        date: body.date ? new Date(body.date) : undefined,
        location: body.location,
        type: body.type,
        status: body.status,
        logoUrl: body.logoUrl,
        posterUrl: body.posterUrl,
        participantCount: body.participantCount,
        updatedAt: new Date(),
      })
      .where(eq(tournaments.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Failed to update tournament:', error)
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    )
  }
}

// DELETE tournament - super_admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const deleted = await db
      .delete(tournaments)
      .where(eq(tournaments.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tournament:', error)
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    )
  }
}
