import { NextRequest, NextResponse } from 'next/server'
import { db, members } from '@/db'
import { eq } from 'drizzle-orm'

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await db
      .update(members)
      .set({
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        clubId: body.clubId || null,
        imageUrl: body.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error('Failed to update member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await db
      .delete(members)
      .where(eq(members.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
