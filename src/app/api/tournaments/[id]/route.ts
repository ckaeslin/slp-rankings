import { NextRequest, NextResponse } from 'next/server'
import { db, tournaments, tournamentCategories, tournamentResults, tournamentOrganizers, clubs, members } from '@/db'
import { eq } from 'drizzle-orm'

// GET a single tournament with categories and results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get tournament
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1)

    if (!tournament.length) {
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
        clubLogoUrl: clubs.logoUrl,
      })
      .from(tournamentOrganizers)
      .leftJoin(clubs, eq(tournamentOrganizers.clubId, clubs.id))
      .where(eq(tournamentOrganizers.tournamentId, id))

    // Get categories with results
    const categories = await db
      .select()
      .from(tournamentCategories)
      .where(eq(tournamentCategories.tournamentId, id))

    // Get all results for this tournament's categories
    const categoryIds = categories.map(c => c.id)

    let results: {
      id: string
      categoryId: string
      memberId: string | null
      athleteName: string
      country: string
      position: number
      basePoints: number | null
      bonusPoints: number | null
      totalPoints: number | null
      memberFirstName: string | null
      memberLastName: string | null
      memberImageUrl: string | null
      clubName: string | null
      clubShortName: string | null
      clubLogoUrl: string | null
    }[] = []

    if (categoryIds.length > 0) {
      // Get results with member and club info
      const allResults = await Promise.all(
        categoryIds.map(async (categoryId) => {
          return db
            .select({
              id: tournamentResults.id,
              categoryId: tournamentResults.categoryId,
              memberId: tournamentResults.memberId,
              athleteName: tournamentResults.athleteName,
              country: tournamentResults.country,
              position: tournamentResults.position,
              basePoints: tournamentResults.basePoints,
              bonusPoints: tournamentResults.bonusPoints,
              totalPoints: tournamentResults.totalPoints,
              memberFirstName: members.firstName,
              memberLastName: members.lastName,
              memberImageUrl: members.imageUrl,
              clubName: clubs.name,
              clubShortName: clubs.shortName,
              clubLogoUrl: clubs.logoUrl,
            })
            .from(tournamentResults)
            .leftJoin(members, eq(tournamentResults.memberId, members.id))
            .leftJoin(clubs, eq(members.clubId, clubs.id))
            .where(eq(tournamentResults.categoryId, categoryId))
            .orderBy(tournamentResults.position)
        })
      )
      results = allResults.flat()
    }

    // Group results by category
    const categoriesWithResults = categories.map(category => ({
      ...category,
      results: results
        .filter(r => r.categoryId === category.id)
        .sort((a, b) => a.position - b.position),
    }))

    return NextResponse.json({
      ...tournament[0],
      organizers: organizers.map(o => ({
        clubId: o.clubId,
        clubName: o.clubName,
        clubShortName: o.clubShortName,
        clubLogoUrl: o.clubLogoUrl,
      })),
      categories: categoriesWithResults,
    })
  } catch (error) {
    console.error('Failed to fetch tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

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

// PUT update tournament (logoUrl, posterUrl, etc.)
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

    // Check if tournament exists
    const existing = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id))
      .limit(1)

    if (!existing.length) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // For club admins (not super_admin), check if they organize this tournament
    if (session.role !== 'super_admin' && session.clubId) {
      const organizer = await db
        .select()
        .from(tournamentOrganizers)
        .where(eq(tournamentOrganizers.tournamentId, id))

      const isOrganizer = organizer.some(o => o.clubId === session.clubId)
      if (!isOrganizer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Build update object with only allowed fields
    const updateData: {
      logoUrl?: string | null
      posterUrl?: string | null
      name?: string
      date?: Date
      location?: string
      type?: 'national' | 'international' | 'em' | 'wm'
      status?: 'upcoming' | 'completed'
      participantCount?: number | null
      updatedAt: Date
    } = {
      updatedAt: new Date(),
    }

    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl || null
    if (body.posterUrl !== undefined) updateData.posterUrl = body.posterUrl || null
    if (body.name !== undefined) updateData.name = body.name
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.location !== undefined) updateData.location = body.location
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    if (body.participantCount !== undefined) updateData.participantCount = body.participantCount

    const updated = await db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, id))
      .returning()

    // Get organizers for response
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
