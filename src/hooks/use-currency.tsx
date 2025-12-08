
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

const CURRENCY_SYMBOLS: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    JPY: "¥",
    GBP: "£",
    INR: "₹",
};


interface CurrencyContextProps {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  formatCompactNumber: (amount: number) => string;
  convertToBaseCurrency: (amount: number, fromCurrency: string) => number;
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
    // This assumes the base amount stored in DB is always USD
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount * rate;
  }
  
  const convertToBaseCurrency = (amount: number, fromCurrency: string): number => {
    const rate = EXCHANGE_RATES[fromCurrency] || 1;
    if (rate === 0) return amount; // Avoid division by zero
    // Convert the amount from the user's currency back to the base currency (USD)
    return amount / rate;
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

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCompactNumber, convertToBaseCurrency, currencySymbol }}>
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
