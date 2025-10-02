import NavBar from "../src/components/NavBar";
import HeroSection from "../src/components/HeroSection";
import AboutSection from "../src/components/AboutSection";
import TestimonialsSection from "../src/components/TestimonialsSection";
import CTASection from "../src/components/CTASection";
import LocationSection from "../src/components/LocationSection";
import Footer from "../src/components/Footer";

function App() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to bottom, 
            rgba(0, 0, 0, 1), 
            rgba(30, 58, 130, 1), 
            rgba(0, 0, 0, 1)
          ),
          url('/background.jpeg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <div className="pt-20 md:pt-24">
        <HeroSection />
        <AboutSection />
        <TestimonialsSection />
        <CTASection />
        <LocationSection />
        <Footer />
      </div>
    </div>
  );
}

export default App;
