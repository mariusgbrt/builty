import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Workflow } from '../components/Workflow';
import { Challenges } from '../components/Challenges';
import { Features } from '../components/Features';
import { Pricing } from '../components/Pricing';
import { FAQ } from '../components/FAQ';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Workflow />
      <Challenges />
      <Features />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
