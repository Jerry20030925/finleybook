'use client';

export default function DebugEnv() {
  const envVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        {envVars.map((envVar) => (
          <div key={envVar} className="flex items-center space-x-4">
            <span className="w-80 font-mono text-sm">{envVar}:</span>
            <span className={`font-mono text-sm ${process.env[envVar] ? 'text-green-600' : 'text-red-600'}`}>
              {process.env[envVar] ? '✓ SET' : '✗ MISSING'}
            </span>
            {process.env[envVar] && (
              <span className="font-mono text-xs text-gray-500">
                ({process.env[envVar]?.substring(0, 10)}...)
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">All NEXT_PUBLIC_ vars:</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(
            Object.keys(process.env)
              .filter(key => key.startsWith('NEXT_PUBLIC_'))
              .reduce((obj, key) => {
                obj[key] = process.env[key]?.substring(0, 20) + '...';
                return obj;
              }, {} as Record<string, string>),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}