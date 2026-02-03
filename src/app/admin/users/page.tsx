'use client'

import { useState, useEffect } from 'react'
import type { SLPStandings } from '@/lib/types'

interface User {
  id: string
  email: string
  role: 'super_admin' | 'club_admin'
  club?: string
  invitedAt: string
  lastLogin?: string
}

const mockUsers: User[] = [
  { id: '1', email: 'admin@test.ch', role: 'super_admin', invitedAt: '2026-01-01', lastLogin: '2026-02-03' },
]

// Mock user - in production, this will come from Auth.js session
const mockCurrentUser = {
  email: 'admin@test.ch',
  role: 'super_admin' as 'super_admin' | 'club_admin',
}

export default function UsersPage() {
  const isSuperAdmin = mockCurrentUser.role === 'super_admin'

  // Redirect or show access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
          <p className="text-gray-400">
            Nur Super Admins haben Zugriff auf die Benutzerverwaltung.
          </p>
        </div>
      </div>
    )
  }
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [standings, setStandings] = useState<SLPStandings | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', role: 'club_admin' as const, club: '' })
  const [sortField, setSortField] = useState<'email' | 'role' | 'club' | 'invitedAt' | 'lastLogin'>('email')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDirection === 'asc' ? '↑' : '↓'
      ) : (
        <span className="text-gray-600">↕</span>
      )}
    </span>
  )

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'email':
        comparison = a.email.localeCompare(b.email)
        break
      case 'role':
        comparison = a.role.localeCompare(b.role)
        break
      case 'club':
        comparison = (a.club || '').localeCompare(b.club || '')
        break
      case 'invitedAt':
        comparison = new Date(a.invitedAt).getTime() - new Date(b.invitedAt).getTime()
        break
      case 'lastLogin':
        comparison = new Date(a.lastLogin || 0).getTime() - new Date(b.lastLogin || 0).getTime()
        break
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  useEffect(() => {
    fetch('/slp_2026_standings.json')
      .then(res => res.json())
      .then(setStandings)
      .catch(console.error)
  }, [])

  const clubs = standings?.clubs.map(c => c.club) || []

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      role: newUser.role,
      club: newUser.role === 'club_admin' ? newUser.club : undefined,
      invitedAt: new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setShowInviteModal(false)
    setNewUser({ email: '', role: 'club_admin', club: '' })
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Benutzer</h1>
          <p className="text-gray-400">Verwalte Admin-Zugänge und lade neue Benutzer ein</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Benutzer einladen
        </button>
      </div>

      {/* Roles Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-dark-700/50 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">Super Admin</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Kann alle Vereine und Mitglieder verwalten</li>
            <li>• Kann Turniere erstellen und Resultate hochladen</li>
            <li>• Kann neue Benutzer einladen</li>
          </ul>
        </div>
        <div className="p-4 bg-dark-700/50 rounded-xl border border-dark-500">
          <h3 className="font-semibold mb-2">Club Admin</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Kann nur eigene Vereinsmitglieder verwalten</li>
            <li>• Kann Mitglieder hinzufügen und bearbeiten</li>
            <li>• Kein Zugriff auf andere Vereine</li>
          </ul>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-700/50 rounded-xl border border-primary/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-600/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                E-Mail<SortIcon field="email" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('role')}>
                Rolle<SortIcon field="role" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('club')}>
                Verein<SortIcon field="club" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('invitedAt')}>
                Eingeladen<SortIcon field="invitedAt" />
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('lastLogin')}>
                Letzter Login<SortIcon field="lastLogin" />
              </th>
              <th className="py-3 px-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id} className="border-t border-dark-600 hover:bg-dark-600/30">
                <td className="py-3 px-4 font-medium">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'super_admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-dark-500 text-gray-300'
                  }`}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Club Admin'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {user.club || '-'}
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(user.invitedAt).toLocaleDateString('de-CH')}
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('de-CH') : 'Nie'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {user.role !== 'super_admin' && (
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl border border-primary/20 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Benutzer einladen</h2>
            <form onSubmit={handleInvite}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">E-Mail Adresse</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="benutzer@email.ch"
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rolle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="club_admin">Club Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {newUser.role === 'club_admin' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Verein</label>
                    <select
                      required
                      value={newUser.club}
                      onChange={(e) => setNewUser({ ...newUser, club: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">Verein auswählen...</option>
                      {clubs.map(club => (
                        <option key={club} value={club}>{club}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Der Benutzer erhält eine E-Mail mit einem Magic Link zum Einloggen.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
                >
                  Einladen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
