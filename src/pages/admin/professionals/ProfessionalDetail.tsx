import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProfileTab } from './tabs/ProfileTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import type { AdminProfessional } from './types';
import './professionals.css';

interface Props {
  professional: AdminProfessional;
  onBack: () => void;
  onSave: (updated: AdminProfessional) => void;
}

type Tab = 'profile' | 'performance';

export function ProfessionalDetail({ professional, onBack, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const initials = professional.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      <button type="button" className="prof-detail-back" onClick={onBack}>
        <ArrowLeft size={16} />
        Volver a la lista
      </button>

      <div className="prof-detail-header">
        <div className="prof-detail-avatar">
          {professional.photo ? <img src={professional.photo} alt={professional.name} /> : initials}
        </div>
        <div className="prof-detail-body">
          <h2 className="prof-detail-name">{professional.name}</h2>
          <p className="prof-detail-sub">{professional.specialty}</p>
          <div className="prof-detail-info">
            <span className="prof-detail-info-item">📞 {professional.phone}</span>
            <span className="prof-detail-info-item">✉️ {professional.email}</span>
            {professional.socials.instagram && (
              <a href={professional.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#069494' }}>
                Instagram
              </a>
            )}
            {professional.socials.facebook && (
              <a href={professional.socials.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#069494' }}>
                Facebook
              </a>
            )}
            {professional.socials.tiktok && (
              <a href={professional.socials.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#069494' }}>
                TikTok
              </a>
            )}
            {professional.socials.twitter && (
              <a href={professional.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#069494' }}>
                Twitter
              </a>
            )}
            <span className="prof-detail-info-item">
              Comisión: {professional.commissionPct}% ({professional.commissionType === 'earned' ? 'se queda el profesional' : 'al negocio'})
            </span>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn ${activeTab === 'profile' ? 'active' : 'inactive'}`}
          onClick={() => setActiveTab('profile')}>
          Perfil
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'performance' ? 'active' : 'inactive'}`}
          onClick={() => setActiveTab('performance')}>
          Rendimiento
        </button>
      </div>

      {activeTab === 'profile'
        ? <ProfileTab professional={professional} onSave={onSave} onBack={onBack} />
        : <PerformanceTab professional={professional} />}
    </div>
  );
}