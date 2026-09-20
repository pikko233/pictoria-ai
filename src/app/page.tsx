import { Faqs } from "@/components/landing-page/faqs";
import { Features } from "@/components/landing-page/features";
import { Footer } from "@/components/landing-page/footer";
import { HeroSection } from "@/components/landing-page/hero-section";
import { Navigation } from "@/components/landing-page/navigation";
import { Pricing } from "@/components/landing-page/pricing";
import { Testimonials } from "@/components/landing-page/testimonials";
import { getProducts, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient(await cookies());

  const [user, products] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
  ]);

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center">
      <Navigation />
      <HeroSection />
      <Features />
      <Testimonials />
      <Pricing products={products || []} />
      <Faqs />

      <Footer />
    </main>
  );
}
