import { MindLockGate } from '@/components/mind/MindLockGate'

export default function MindLayout({ children }: { children: React.ReactNode }) {
  return <MindLockGate>{children}</MindLockGate>
}
