// src/pages/professional/ProfessionalPanelPage.tsx
import { useAuth }          from '@/features/auth/AuthContext'
import { Statistics }       from '@/features/professional/statistics/Statistics'
import { OnboardingWizard } from '@/features/professional/onboarding/OnboardingWizard'

export function ProfessionalPanelPage() {
  const { user, refreshUser } = useAuth()

  if (user && !user.profileComplete) {
    return (
      <OnboardingWizard
        onComplete={async () => {
          await refreshUser()
        }}
      />
    )
  }

  return <Statistics />
}