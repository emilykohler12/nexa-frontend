// ============================================================
// REDES SOCIALES — links del negocio
// ============================================================

export interface SocialLink {
  platform: string;
  label: string;
  url: string | null;
}

export const socialLinks: SocialLink[] = [
  { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/loren_estudio' },
  { platform: 'facebook',  label: 'Facebook',  url: null },
  { platform: 'whatsapp',  label: 'WhatsApp',  url: 'https://wa.me/5493765018665' },
];