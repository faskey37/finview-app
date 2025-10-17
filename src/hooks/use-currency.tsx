
"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "./use-auth";

// Note: These are static rates for demonstration purposes.
// In a real-world application, these would be fetched from a live API.
const EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.93,
  JPY: 157.6,
  GBP: 0.79,
  INR: 83.5,
};


interface CurrencyContextProps {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  formatCompactNumber: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const { userData } = useAuth();
  
  useEffect(() => {
    if (userData?.currency) {
      setCurrency(userData.currency);
    }
  }, [userData]);

  const convertAmount = (amount: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount * rate;
  }

  const formatCurrency = (amount: number) => {
    const convertedAmount = convertAmount(amount);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(convertedAmount);
  };
  
  const formatCompactNumber = (amount: number) => {
    const convertedAmount = convertAmount(amount);
     return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
      notation: "compact",
      compactDisplay: "short",
    }).format(convertedAmount);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCompactNumber }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
