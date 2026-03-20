// In your @/lib/types.ts or create a new file @/lib/subscription-types.ts

export type BillingPeriod = 'monthly' | 'yearly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface SubscriptionInfo {
  // Plan details
  plan: BillingPeriod;
  amount: number;
  currency: string; // 'INR' as base
  
  // Dates
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  trialEndDate?: string;
  cancelledAt?: string;
  
  // Status
  status: SubscriptionStatus;
  autoRenew: boolean;
  
  // Payment
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  razorpaySubscriptionId?: string;
  
  // History
  billingHistory?: Array<{
    date: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    invoiceUrl?: string;
  }>;
}

// Then update UserData
export type UserData = {
  // ... existing fields
  subscription?: SubscriptionInfo;
};