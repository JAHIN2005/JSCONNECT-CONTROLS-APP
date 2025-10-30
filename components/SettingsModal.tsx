
import React, { useState, useEffect } from 'react';
import { ConnectionStatus } from '../types';

interface SettingsModalProps {
  initialPicoIp: string | null;
  initialCamIp: string | null;
  picoStatus: ConnectionStatus;
  camStatus: ConnectionStatus;
  onSave: (picoIp: string, camIp: string) => void;
  onClose: () => void;
  onTestConnections: () => Promise<void>;
}

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const baseClasses = "w-3 h-3 rounded-full ml-2";
  switch (status) {
    case ConnectionStatus.Success:
      return <div className={`${baseClasses} bg-green-500 animate-pulse`}></div>;
    case ConnectionStatus.Failed:
      return <div className={`${baseClasses} bg-red-500`}></div>;
    case ConnectionStatus.Testing:
      return <div className={`${baseClasses} bg-yellow-500 animate-spin`}></div>;
    default:
      return <div className={`${baseClasses} bg-gray-500`}></div>;
  }
};


const SettingsModal: React.FC<SettingsModalProps> = ({
  initialPicoIp,
  initialCamIp,
  picoStatus,
  camStatus,
  onSave,
  onClose,
  onTestConnections,
}) => {
  const [picoIp, setPicoIp] = useState(initialPicoIp || '');
  const [camIp, setCamIp] = useState(initialCamIp || '');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // This effect ensures that if the props change (e.g., from parent test), we reflect it.
    if(picoStatus !== ConnectionStatus.Testing && camStatus !== ConnectionStatus.Testing) {
      setIsTesting(false);
    }
  }, [picoStatus, camStatus]);

  const handleSave = () => {
    if (picoIp.trim() && camIp.trim()) {
      onSave(picoIp.trim(), camIp.trim());
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    await onTestConnections();
    setIsTesting(false);
  }

  const hasConfig = !!initialPicoIp && !!initialCamIp;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          {hasConfig && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="picoIp" className="block text-sm font-medium text-gray-300 mb-1">
              Robot IP (Pico W)
            </label>
            <div className="flex items-center bg-gray-900 rounded-md">
                <input
                    type="text"
                    id="picoIp"
                    value={picoIp}
                    onChange={(e) => setPicoIp(e.target.value)}
                    placeholder="e.g., 192.168.1.100"
                    className="w-full bg-transparent p-2 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
                <StatusIndicator status={picoStatus} />
            </div>
          </div>
          <div>
            <label htmlFor="camIp" className="block text-sm font-medium text-gray-300 mb-1">
              Camera IP (ESP32-CAM)
            </label>
            <div className="flex items-center bg-gray-900 rounded-md">
                <input
                    type="text"
                    id="camIp"
                    value={camIp}
                    onChange={(e) => setCamIp(e.target.value)}
                    placeholder="e.g., 192.168.1.101"
                    className="w-full bg-transparent p-2 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
                 <StatusIndicator status={camStatus} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
                {isTesting ? 'Testing...' : 'Test Connections'}
            </button>
            <button
                onClick={handleSave}
                className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Save & Connect
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
