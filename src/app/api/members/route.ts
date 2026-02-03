import { NextRequest, NextResponse } from 'next/server'
import { db, members, clubs } from '@/db'
import { eq } from 'drizzle-orm'

// GET all members with their club info
export async function GET() {
  try {
    const allMembers = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        gender: members.gender,
        country: members.country,
        isActive: members.isActive,
        imageUrl: members.imageUrl,
        clubId: members.clubId,
        clubName: clubs.name,
        clubShortName: clubs.shortName,
      })
      .from(members)
      .leftJoin(clubs, eq(members.clubId, clubs.id))
      .orderBy(members.lastName, members.firstName)

    return NextResponse.json(allMembers)
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newMember = await db.insert(members).values({
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      clubId: body.clubId || null,
      country: body.country || 'Switzerland',
      isActive: body.isActive ?? true,
    }).returning()

    return NextResponse.json(newMember[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
