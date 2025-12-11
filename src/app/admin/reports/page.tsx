'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function AdminReportsPage() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [merchantId, setMerchantId] = useState('amazon');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Simple check for admin (in real app, use claims or DB check)
    // For now, we assume if they can access this page (protected by layout/middleware ideally), they are admin
    // or we just let it be open for this demo since we don't have strict admin roles yet.

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('merchantId', merchantId);

        try {
            const res = await fetch('/api/admin/upload-report', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setResult({ error: 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Upload Affiliate Report</h1>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Merchant</label>
                        <select
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="amazon">Amazon Associates</option>
                            <option value="ebay">eBay Partner Network</option>
                            <option value="aliexpress">AliExpress Portals</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CSV Report File</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Ensure the CSV contains 'Subtag' or 'CustomId' columns for tracking.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {uploading ? 'Processing...' : 'Upload & Process'}
                    </button>
                </form>

                {result && (
                    <div className={`mt-6 p-4 rounded-md ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {result.error ? (
                            <p>Error: {result.error}</p>
                        ) : (
                            <div>
                                <p className="font-bold">Success!</p>
                                <p>Processed: {result.processed} rows</p>
                                <p>Errors: {result.errors} rows</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
