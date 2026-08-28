import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { LoanTypes } from "@/components/landing/LoanTypes";
import { EmiCalculator } from "@/components/landing/EmiCalculator";
import { Stats } from "@/components/landing/Stats";
import { About } from "@/components/landing/About";
import { Testimonials } from "@/components/landing/Testimonials";
import { ApplyForm } from "@/components/landing/ApplyForm";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { LoanApplicationProvider } from "@/components/landing/application/LoanApplicationContext";

const Index = () => {
  return (
    <LoanApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <LoanTypes />
          <EmiCalculator />
          <Stats />
          <About />
          <Testimonials />
          <ApplyForm />
          <Faq />
        </main>
        <Footer />
      </div>
    </LoanApplicationProvider>
  );
};

export default Index;
