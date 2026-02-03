import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const [clubsResult, membersResult] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM clubs`),
      db.execute(sql`SELECT COUNT(*) as count FROM members`),
    ])

    const clubsCount = Number(clubsResult.rows[0]?.count ?? 0)
    const membersCount = Number(membersResult.rows[0]?.count ?? 0)

    return NextResponse.json({
      clubs: clubsCount,
      members: membersCount,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ clubs: 0, members: 0 }, { status: 500 })
  }
}
