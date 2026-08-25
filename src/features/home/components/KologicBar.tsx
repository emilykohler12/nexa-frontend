//src/features/home/components/KologicBar.tsx

import { useTenant } from '@/features/tenant/TenantContext';
import { kologicBranding } from '@/app/data/shared/kologic.data';

export function KologicBar() {
  const { business } = useTenant();
  if (!business) return null;

  return (
    <section
      className="text-white py-1 px-6 pr-6 md:pr-28"
      style={{ backgroundColor: kologicBranding.primaryColor, fontFamily: "'Sora', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src={business.kologic.logo} alt={kologicBranding.name} className="w-20 h-11 object-contain" />
          <span className="font-light text-base" style={{ color: kologicBranding.accentColor }}>
            {kologicBranding.name}
          </span>
        </div>
        <div className="text-white text-xs text-center font-light whitespace-nowrap">
          <p>{kologicBranding.tagline}</p>
        </div>
        <p className="text-xs font-light whitespace-nowrap" style={{ color: kologicBranding.accentColor }}>
          {business.kologic.email}
        </p>
      </div>
    </section>
  );
}