//src/pages/public/HomePage.tsx

import { useState, useRef } from 'react';
import { HeroSection }        from '@/features/home/components/HeroSection';
import { StatsSection }       from '@/features/home/components/StatsSection';
import { TestimonialsSection }from '@/features/home/components/TestimonialsSection';
import { GallerySection }     from '@/features/home/components/GallerySection';
import { Footer }             from '@/features/home/components/Footer';
import { KologicBar }         from '@/features/home/components/KologicBar';
import { WhatsAppButton }     from '@/shared/ui/atoms/WhatsAppButton';
import { ServicesSection }    from '@/features/home/components/ServicesSection';
import { ProfessionalsSection }from '@/features/home/components/ProfessionalsSection';
import { StoreSection }       from '@/features/home/components/StoreSection';
import { AboutSection }       from '@/features/home/components/AboutSection';

type SectionId = 'servicios' | 'profesionales' | 'tienda' | 'nosotros';

export function HomePage() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const navigateTo = (section: SectionId | null) => {
    setActiveSection(section);
    if (section === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'servicios':     return <ServicesSection />;
      case 'profesionales': return <ProfessionalsSection />;
      case 'tienda':        return <StoreSection />;
      case 'nosotros':      return <AboutSection />;
      default:              return null;
    }
  };

  return (
    <main className="min-h-screen">
      <HeroSection onNavigate={navigateTo} />

      {activeSection && (
        <div ref={contentRef}>
          {renderSection()}
        </div>
      )}

      <StatsSection />
      <TestimonialsSection />
      <GallerySection />
      <Footer onNavigate={navigateTo} />
      <KologicBar />
      <WhatsAppButton />
    </main>
  );
}