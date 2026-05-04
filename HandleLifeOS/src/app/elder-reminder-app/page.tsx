import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Elder Reminder App — Medicine & Appointment Reminders for Family',
  description: 'Help your elderly family members stay on top of medicines, doctor appointments, and family check-ins. Simple, caring, and family-connected.',
  keywords: ['elder reminder app', 'medicine reminder for elderly', 'senior care app', 'elderly appointment reminder', 'family elder care app india', 'dawai reminder app', 'medicine reminder india'],
  path: '/elder-reminder-app',
})

export default function ElderReminderAppPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-6">
            💛 Elder Care
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Care for your elders<br />as a family
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Track medicines, doctor appointments, emergency contacts, and health conditions for your elderly family members. The whole family stays informed.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Set up elder care free
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { emoji: '💊', title: 'Medicine tracker', desc: 'List all medicines with dosage. Never miss a refill reminder.' },
            { emoji: '🏥', title: 'Doctor details', desc: 'Doctor name, contact, and speciality — always at hand.' },
            { emoji: '🆘', title: 'Emergency contacts', desc: 'One-tap access to emergency numbers for the whole family.' },
            { emoji: '📋', title: 'Health notes', desc: 'Keep track of conditions, allergies, and special instructions.' },
            { emoji: '👨‍👩‍👧', title: 'Family visibility', desc: 'All adult family members can see and update elder profiles.' },
            { emoji: '📞', title: 'Check-in reminders', desc: 'AI reminds the family to check in on elders regularly.' },
          ].map(f => (
            <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <span className="text-2xl shrink-0">{f.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center rounded-3xl bg-orange-500 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">Care should be a team effort</h2>
          <p className="text-orange-100 mb-6">Life OS makes it easy for the whole family to support your elders together.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-orange-700 hover:bg-orange-50 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </main>
  )
}
