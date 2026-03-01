'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ImportService } from '@/lib/import-service';
import { Download, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export function DataManager() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    stats?: any;
  } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecovest-backup-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      
      setResult({
        success: true,
        message: 'Backup downloaded successfully!'
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to export data'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setImporting(true);
    setResult(null);
    
    try {
      const importService = new ImportService();
      const result = await importService.importUserData(importFile);
      
      setResult({
        success: result.success,
        message: result.message,
        stats: result.stats
      });
      
      if (result.success) {
        setImportFile(null);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setImporting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Data Management</h2>
      <p className="text-gray-600">
        Export your data for backup or import a previous backup to restore your account.
      </p>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Your Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Download a complete backup of all your financial data, including transactions,
          accounts, budgets, goals, and uploaded files.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {exporting ? 'Creating Backup...' : 'Download Backup'}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Import Previous Backup
        </h3>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="import-file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="import-file"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {importFile ? importFile.name : 'Click to select backup file'}
              </span>
              <span className="text-xs text-gray-500">
                Only .zip files from EcoVest export
              </span>
            </label>
          </div>

          {importFile && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {importing ? 'Restoring Data...' : 'Restore from Backup'}
            </button>
          )}
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          result.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <div>
            <p className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </p>
            {result.stats && (
              <pre className="mt-2 text-xs text-gray-600">
                {JSON.stringify(result.stats, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2">⚠️ Important Notes:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Export files contain ALL your financial data</li>
          <li>Keep your backup file in a safe place</li>
          <li>Importing will add to existing data (no automatic deletion)</li>
          <li>Files (PDFs, images) need to be re-uploaded separately</li>
          <li>For account recovery, first create a new account then import</li>
        </ul>
      </div>
    </div>
  );
}