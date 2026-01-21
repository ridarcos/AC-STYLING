import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Catalogs from "@/components/Catalogs";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <div id="about" className="w-full"><About /></div>
      <div id="services" className="w-full"><Services /></div>
      <Catalogs />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
