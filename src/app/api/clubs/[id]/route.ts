import { NextRequest, NextResponse } from 'next/server'
import { db, clubs } from '@/db'
import { eq } from 'drizzle-orm'

// PUT update club
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await db
      .update(clubs)
      .set({
        name: body.name,
        shortName: body.shortName || null,
        location: body.location || null,
        presidentId: body.presidentId || null,
        updatedAt: new Date(),
      })
      .where(eq(clubs.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Failed to update club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}

// DELETE club
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await db
      .delete(clubs)
      .where(eq(clubs.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete club:', error)
    return NextResponse.json(
      { error: 'Failed to delete club' },
      { status: 500 }
    )
  }
}
