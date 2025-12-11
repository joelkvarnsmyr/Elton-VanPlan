import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ArrowLeft } from 'lucide-react';

export function TestScraper({ onClose }: { onClose?: () => void }) {
  const [regNo, setRegNo] = useState('JSN398');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testScraper = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const functions = getFunctions(undefined, 'europe-west1');
      const scrapeVehicleData = httpsCallable(functions, 'scrapeVehicleData');

      console.log('🚀 Calling scrapeVehicleData with:', regNo);
      const response = await scrapeVehicleData({ regNo });

      console.log('✅ Response:', response.data);
      setResult(response.data);

    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#f5f5f5'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 style={{ margin: 0 }}>🧪 Test Vehicle Scraper</h2>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value.toUpperCase())}
          placeholder="JSN398"
          style={{ padding: '8px', fontSize: '16px', width: '200px' }}
        />
        <button
          onClick={testScraper}
          disabled={loading}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            fontSize: '16px',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Scraper'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#fee' }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Result:</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.success && result.vehicleData && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#efe' }}>
              <h4>📊 Vehicle Data:</h4>
              <p><strong>Source:</strong> {result.source}</p>
              <p><strong>Cached:</strong> {result.cached ? 'YES ✅' : 'NO (fresh scrape) 🆕'}</p>
              <p><strong>Make:</strong> {result.vehicleData.make}</p>
              <p><strong>Model:</strong> {result.vehicleData.model}</p>
              <p><strong>Year:</strong> {result.vehicleData.year}</p>
              <p><strong>VIN:</strong> {result.vehicleData.vin}</p>
              <p><strong>Status:</strong> {result.vehicleData.status}</p>
              <p><strong>Fuel:</strong> {result.vehicleData.engine?.fuel}</p>
              <p><strong>Power:</strong> {result.vehicleData.engine?.power}</p>
              <p><strong>Weight:</strong> {result.vehicleData.weights?.curb}kg / {result.vehicleData.weights?.total}kg</p>
              <p><strong>Owners:</strong> {result.vehicleData.history?.owners}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
