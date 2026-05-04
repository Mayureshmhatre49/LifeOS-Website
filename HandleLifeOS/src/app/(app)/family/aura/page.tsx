import { redirect } from 'next/navigation'

// AURA has been promoted to a top-level Life Area. This page exists only to
// preserve old links — they redirect to the new location at /aura.
export default function FamilyAuraRedirect() {
  redirect('/aura')
}
