import { ExportData } from "./types";

// lib/import-validation.ts
export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: ExportData;
}

export const validateImportData = (data: any): ImportValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!data.version) errors.push('Missing version field');
  if (!data.profile) errors.push('Missing profile data');
  if (!Array.isArray(data.accounts)) errors.push('Accounts must be an array');
  if (!Array.isArray(data.transactions)) errors.push('Transactions must be an array');
  
  // Version compatibility check
  if (data.version && data.version !== '1.0') {
    warnings.push(`Version ${data.version} may not be fully compatible`);
  }
  
  // Data integrity checks
  data.transactions?.forEach((tx: any, index: number) => {
    if (!tx.amount || typeof tx.amount !== 'number') {
      errors.push(`Transaction ${index}: Invalid amount`);
    }
    if (!tx.date || isNaN(Date.parse(tx.date))) {
      errors.push(`Transaction ${index}: Invalid date`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: errors.length === 0 ? data : undefined
  };
};