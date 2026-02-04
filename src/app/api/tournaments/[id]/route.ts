import { NextRequest, NextResponse } from 'next/server'
import { db, tournaments, tournamentOrganizers, clubs } from '@/db'
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

// Helper to check if user is an organizer of the tournament
async function isOrganizer(tournamentId: string, clubId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(tournamentOrganizers)
    .where(eq(tournamentOrganizers.tournamentId, tournamentId))

  return result.some(o => o.clubId === clubId)
}

// GET single tournament with organizers
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

    // Get organizers
    const organizers = await db
      .select({
        clubId: tournamentOrganizers.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(tournamentOrganizers)
      .leftJoin(clubs, eq(tournamentOrganizers.clubId, clubs.id))
      .where(eq(tournamentOrganizers.tournamentId, id))

    return NextResponse.json({
      ...tournament[0],
      organizers: organizers.map(o => ({
        clubId: o.clubId,
        clubName: o.clubName,
        clubShortName: o.clubShortName,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

// PUT update tournament
// - super_admin: can update everything including organizers
// - club admin organizer: can only update logoUrl and posterUrl
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if user is super_admin or an organizer
    const isSuperAdmin = session.role === 'super_admin'
    const userIsOrganizer = session.clubId ? await isOrganizer(id, session.clubId) : false

    if (!isSuperAdmin && !userIsOrganizer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Club admin organizers can only update logo and poster
    let updateData: Record<string, unknown>
    if (isSuperAdmin) {
      updateData = {
        name: body.name,
        date: body.date ? new Date(body.date) : undefined,
        location: body.location,
        type: body.type,
        status: body.status,
        logoUrl: body.logoUrl,
        posterUrl: body.posterUrl,
        participantCount: body.participantCount,
        updatedAt: new Date(),
      }
    } else {
      // Club admin organizer - only logo and poster
      updateData = {
        logoUrl: body.logoUrl,
        posterUrl: body.posterUrl,
        updatedAt: new Date(),
      }
    }

    const updated = await db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Handle organizers update (super_admin only)
    if (isSuperAdmin && body.organizerClubIds !== undefined) {
      // Remove existing organizers
      await db
        .delete(tournamentOrganizers)
        .where(eq(tournamentOrganizers.tournamentId, id))

      // Add new organizers
      if (body.organizerClubIds.length > 0) {
        await db.insert(tournamentOrganizers).values(
          body.organizerClubIds.map((clubId: string) => ({
            tournamentId: id,
            clubId,
          }))
        )
      }
    }

    // Fetch organizers to return
    const organizers = await db
      .select({
        clubId: tournamentOrganizers.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(tournamentOrganizers)
      .leftJoin(clubs, eq(tournamentOrganizers.clubId, clubs.id))
      .where(eq(tournamentOrganizers.tournamentId, id))

    return NextResponse.json({
      ...updated[0],
      organizers: organizers.map(o => ({
        clubId: o.clubId,
        clubName: o.clubName,
        clubShortName: o.clubShortName,
      })),
    })
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
