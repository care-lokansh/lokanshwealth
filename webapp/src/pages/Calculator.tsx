import { Calculator as CalcIcon, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LoanApplicationProvider } from "@/components/landing/application/LoanApplicationContext";
import { EmiTool } from "@/components/calculator/EmiTool";
import { EligibilityTool } from "@/components/calculator/EligibilityTool";

const Calculator = () => {
  return (
    <LoanApplicationProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 pb-20 sm:pt-32 sm:pb-28">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Your Goals, Backed by Expert Guidance
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Loan <span className="text-gradient-gold">calculators</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Work out your exact monthly EMI, or find out how much you can borrow —
                instantly, with no sign-up and no impact on your credit score.
              </p>
            </div>

            <Tabs defaultValue="emi" className="mt-10">
              <TabsList className="mx-auto grid h-auto w-full max-w-md grid-cols-2 rounded-full bg-secondary p-1.5">
                <TabsTrigger
                  value="emi"
                  className="gap-2 rounded-full py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <CalcIcon className="h-4 w-4" /> EMI Calculator
                </TabsTrigger>
                <TabsTrigger
                  value="eligibility"
                  className="gap-2 rounded-full py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Wallet className="h-4 w-4" /> Eligibility
                </TabsTrigger>
              </TabsList>

              <TabsContent value="emi" className="mt-10 focus-visible:outline-none">
                <EmiTool />
              </TabsContent>
              <TabsContent
                value="eligibility"
                className="mt-10 focus-visible:outline-none"
              >
                <EligibilityTool />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </LoanApplicationProvider>
  );
};

export default Calculator;
