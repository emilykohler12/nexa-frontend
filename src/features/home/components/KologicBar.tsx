//src/features/home/components/KologicBar.tsx

import { useTenant } from '@/features/tenant/TenantContext';
import { kologicBranding } from '@/app/data/shared/kologic.data';
import './KologicBar.css';

export function KologicBar() {
  const { business } = useTenant();
  if (!business) return null;

  return (
    <section className="kologic-bar" style={{ backgroundColor: kologicBranding.primaryColor }}>
      <div className="kologic-bar__inner">
        <div className="kologic-bar__brand">
          <img src={business.kologic.logo} alt={kologicBranding.name} className="kologic-bar__logo" />
          <span className="kologic-bar__name" style={{ color: kologicBranding.accentColor }}>
            {kologicBranding.name}
          </span>
        </div>
        <p className="kologic-bar__tagline">{kologicBranding.tagline}</p>
        <p className="kologic-bar__email" style={{ color: kologicBranding.accentColor }}>
          {business.kologic.email}
        </p>
      </div>
    </section>
  );
}
