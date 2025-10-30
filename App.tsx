import React, { useState, useEffect, useCallback } from 'react';
import Controller from './components/Controller';
import SettingsModal from './components/SettingsModal';
import { ConnectionStatus } from './types';
import { useRobotAPI, testCamConnection } from './hooks/useRobotAPI';

const LoginScreen: React.FC<{ onLogin: (code: string) => void; isLoading: boolean; error: string | null }> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && code) {
      onLogin(code);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm">
      <h1 className="text-3xl font-bold text-center mb-2">JSCONNECT CONTROLS</h1>
      <p className="text-center text-gray-400 mb-6">Please sign in to continue</p>
      {error && <p className="bg-red-900 text-red-300 border border-red-700 text-center p-2 rounded-md mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="code">Authorisation Code</label>
          <input
            id="code"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full bg-gray-900 text-white p-2 rounded-md border border-gray-700 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
          {isLoading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuthenticated') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [picoIp, setPicoIp] = useState<string | null>(null);
  const [camIp, setCamIp] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [picoStatus, setPicoStatus] = useState<ConnectionStatus>(ConnectionStatus.Unknown);
  const [camStatus, setCamStatus] = useState<ConnectionStatus>(ConnectionStatus.Unknown);

  const { testPicoConnection } = useRobotAPI(picoIp);
  
  useEffect(() => {
    if (isAuthenticated) {
      const savedPicoIp = localStorage.getItem('picoIp');
      const savedCamIp = localStorage.getItem('camIp');
      if (savedPicoIp) setPicoIp(savedPicoIp);
      if (savedCamIp) setCamIp(savedCamIp);

      if (!savedPicoIp || !savedCamIp) {
        setIsSettingsOpen(true);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (code: string) => {
    setIsLoading(true);
    setAuthError(null);

    // Simulate a brief delay for UX
    setTimeout(() => {
        if (code === '201205') {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
        } else {
            setAuthError('Invalid Authorisation Code.');
        }
        setIsLoading(false);
    }, 300);
  };

  const handleSaveSettings = (newPicoIp: string, newCamIp: string) => {
    setPicoIp(newPicoIp);
    setCamIp(newCamIp);
    localStorage.setItem('picoIp', newPicoIp);
    localStorage.setItem('camIp', newCamIp);
    setIsSettingsOpen(false);
    setPicoStatus(ConnectionStatus.Unknown);
    setCamStatus(ConnectionStatus.Unknown);
  };
  
  const handleTestConnections = useCallback(async () => {
      setPicoStatus(ConnectionStatus.Testing);
      const picoOk = await testPicoConnection();
      setPicoStatus(picoOk ? ConnectionStatus.Success : ConnectionStatus.Failed);

      setCamStatus(ConnectionStatus.Testing);
      const camOk = await testCamConnection(camIp);
      setCamStatus(camOk ? ConnectionStatus.Success : ConnectionStatus.Failed);
  }, [testPicoConnection, camIp]);

  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
        <LoginScreen onLogin={handleLogin} isLoading={isLoading} error={authError} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      {picoIp && camIp && !isSettingsOpen ? (
        <Controller 
          picoIp={picoIp} 
          camIp={camIp} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <SettingsModal 
          initialPicoIp={picoIp}
          initialCamIp={camIp}
          picoStatus={picoStatus}
          camStatus={camStatus}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          onTestConnections={handleTestConnections}
        />
      )}
    </div>
  );
};

export default App;