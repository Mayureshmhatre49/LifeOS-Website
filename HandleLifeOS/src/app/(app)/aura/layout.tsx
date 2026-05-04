import { AuraLockGate } from '@/components/aura/AuraLockGate'
import { AuraAccessibilityWrapper } from '@/components/aura/AuraAccessibilityWrapper'

export default function AuraLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuraLockGate>
      <AuraAccessibilityWrapper>{children}</AuraAccessibilityWrapper>
    </AuraLockGate>
  )
}
