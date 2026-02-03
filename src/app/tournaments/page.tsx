'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage, type Language } from '@/hooks/useLanguage'
import { t } from '@/lib/translations/tournaments'

interface Tournament {
  id: string
  name: string
  date: string
  location: string
  type: string
  status: 'upcoming' | 'completed'
  participantCount?: number | null
}

function TournamentCard({ tournament, lang }: { tournament: Tournament; lang: Language }) {
  const isUpcoming = tournament.status === 'upcoming'
  const date = new Date(tournament.date)
  const dateLocale = lang === 'de' ? 'de-CH' : lang === 'fr' ? 'fr-CH' : lang === 'it' ? 'it-CH' : 'en-GB'
  const formattedDate = date.toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
        isUpcoming
          ? 'bg-dark-700/50 border-primary/30 hover:border-primary/60'
          : 'bg-dark-800/50 border-dark-600'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{tournament.name}</h3>
          <p className="text-gray-400">{tournament.location}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isUpcoming
              ? 'bg-primary/20 text-primary'
              : 'bg-dark-600 text-gray-400'
          }`}
        >
          {isUpcoming ? t(lang, 'upcoming') : t(lang, 'completed')}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-gray-300">
          <span className="text-sm text-gray-500">{t(lang, 'date')}:</span>
          <br />
          {formattedDate}
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">{t(lang, 'type')}:</span>
          <br />
          <span className="capitalize">{tournament.type}</span>
        </div>
      </div>

      {tournament.participantCount && (
        <div className="mt-3 pt-3 border-t border-dark-600">
          <span className="text-sm text-gray-500">{t(lang, 'participants')}: </span>
          <span className="text-primary font-semibold">{tournament.participantCount}</span>
        </div>
      )}

      {!isUpcoming && (
        <Link
          href={`/rankings`}
          className="mt-4 inline-block text-primary hover:text-primary-light text-sm"
        >
          {t(lang, 'viewRankings')} →
        </Link>
      )}
    </div>
  )
}

export default function TournamentsPage() {
  const lang = useLanguage()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments')
        if (!response.ok) throw new Error('Failed to fetch tournaments')
        const data = await response.json()
        setTournaments(data.map((tournament: { id: string; name: string; date: string; location: string; type: string; status: string; participantCount: number | null }) => ({
          ...tournament,
          date: tournament.date.split('T')[0],
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tournaments')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  // Sort upcoming by date ascending (next one first), past by date descending (most recent first)
  const upcomingTournaments = tournaments
    .filter(tournament => tournament.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pastTournaments = tournaments
    .filter(tournament => tournament.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {t(lang, 'title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t(lang, 'subtitle')}
          </p>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400 py-12">
            {t(lang, 'loading')}
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Upcoming Tournaments */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                {t(lang, 'upcomingTournaments')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} lang={lang} />
                ))}
              </div>
              {upcomingTournaments.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {t(lang, 'noUpcoming')}
                </p>
              )}
            </section>

            {/* Past Tournaments */}
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t(lang, 'pastTournaments')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} lang={lang} />
                ))}
              </div>
              {pastTournaments.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {t(lang, 'noPast')}
                </p>
              )}
            </section>
          </>
        )}

        {/* SLP Info */}
        <div className="mt-12 p-6 bg-dark-700/50 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-lg mb-2">{t(lang, 'tournamentTypes')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-dark-600/50 p-3 rounded">
              <div className="font-semibold">{t(lang, 'national')}</div>
              <div className="text-gray-400">+0 {t(lang, 'pointsBonus')}</div>
            </div>
            <div className="bg-dark-600/50 p-3 rounded">
              <div className="font-semibold">{t(lang, 'international')}</div>
              <div className="text-gray-400">+7 {t(lang, 'pointsBonus')}</div>
            </div>
            <div className="bg-dark-600/50 p-3 rounded">
              <div className="font-semibold">{t(lang, 'ec')}</div>
              <div className="text-gray-400">+9 {t(lang, 'pointsBonus')}</div>
            </div>
            <div className="bg-dark-600/50 p-3 rounded">
              <div className="font-semibold">{t(lang, 'wc')}</div>
              <div className="text-gray-400">+10 {t(lang, 'pointsBonus')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
