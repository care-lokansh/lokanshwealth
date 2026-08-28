import { createContext, useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface LoanApplicationContextValue {
  /** Open the full application page, optionally preselecting a loan code. */
  open: (loanCode?: string) => void;
}

const LoanApplicationContext = createContext<LoanApplicationContextValue | null>(null);

export function useLoanApplication() {
  const ctx = useContext(LoanApplicationContext);
  if (!ctx) throw new Error("useLoanApplication must be used within LoanApplicationProvider");
  return ctx;
}

export function LoanApplicationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const open = useCallback(
    (loanCode?: string) => {
      navigate(loanCode ? `/apply/${loanCode}` : "/apply");
      window.scrollTo({ top: 0 });
    },
    [navigate],
  );

  const value = useMemo(() => ({ open }), [open]);

  return (
    <LoanApplicationContext.Provider value={value}>
      {children}
    </LoanApplicationContext.Provider>
  );
}
