import { NextRequest, NextResponse } from 'next/server'
import { db, clubs } from '@/db'

// GET all clubs
export async function GET() {
  try {
    const allClubs = await db
      .select()
      .from(clubs)
      .orderBy(clubs.name)

    return NextResponse.json(allClubs)
  } catch (error) {
    console.error('Failed to fetch clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

// POST create new club
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newClub = await db.insert(clubs).values({
      name: body.name,
      shortName: body.shortName,
      location: body.location,
      logoUrl: body.logoUrl,
      presidentId: body.presidentId || null,
    }).returning()

    return NextResponse.json(newClub[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
