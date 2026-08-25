const SOCIAL_DOMAINS: Record<string, string[]> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook:  ['facebook.com', 'www.facebook.com', 'fb.com'],
  tiktok:    ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
  twitter:   ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
};

export function validateSocialUrl(network: keyof typeof SOCIAL_DOMAINS, url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const allowed = SOCIAL_DOMAINS[network];
    if (!allowed.includes(parsed.hostname)) {
      return `La URL no parece ser de ${network}. Ejemplo: https://${allowed[0]}/usuario`;
    }
    return null;
  } catch {
    return 'La URL no es válida';
  }
}

export function validateAllSocials(socials: Record<string, string | null>) {
  const errors: Record<string, string> = {};
  for (const [network, url] of Object.entries(socials)) {
    if (url && SOCIAL_DOMAINS[network]) {
      const error = validateSocialUrl(network as keyof typeof SOCIAL_DOMAINS, url);
      if (error) errors[network] = error;
    }
  }
  return errors;
}