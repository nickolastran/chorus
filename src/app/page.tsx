import Navbar from "@/components/landing-page/navbar";
import Hero from "@/components/landing-page/hero";
import SocialProof from "@/components/landing-page/socialproof";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <SocialProof />
    </main>
  );
}
