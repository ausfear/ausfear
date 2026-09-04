import Hero from "@/components/Hero";
import About from "@/components/About";
import Interests from "@/components/Interests";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <About />
      <Interests />
      <Footer />
    </main>
  );
}
