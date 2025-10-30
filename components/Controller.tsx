
import React, { useState } from 'react';
import { useRobotAPI } from '../hooks/useRobotAPI';
import { RobotCommand, RobotMode } from '../types';
import ControlButton from './ControlButton';
import ActionButton from './ActionButton';

interface ControllerProps {
  picoIp: string;
  camIp: string;
  onOpenSettings: () => void;
}

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Controller: React.FC<ControllerProps> = ({ picoIp, camIp, onOpenSettings }) => {
  const { sendCommand, setMode } = useRobotAPI(picoIp);
  const [streamError, setStreamError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [activeMode, setActiveMode] = useState<RobotMode>(RobotMode.Free);

  const handleApiCall = async (apiCall: () => Promise<void>) => {
    try {
      await apiCall();
      if (connectionError) {
        setConnectionError(false);
      }
    } catch (error) {
      console.error("API call failed:", error);
      setConnectionError(true);
    }
  };

  const handleMove = (command: RobotCommand) => () => handleApiCall(() => sendCommand(command));
  const handleStop = () => handleApiCall(() => sendCommand(RobotCommand.Stop));
  
  const handleSetMode = (mode: RobotMode) => {
    setActiveMode(mode);
    handleApiCall(() => setMode(mode));
  };
  
  const handleHorn = () => handleApiCall(() => sendCommand(RobotCommand.Horn));

  return (
    <div className="w-full h-full max-w-sm mx-auto bg-gray-800 rounded-2xl shadow-2xl p-4 flex flex-col justify-between relative">
       {connectionError && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
            Connection Lost
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-200">JSCONNECT CONTROLS</h1>
        <button onClick={onOpenSettings} className="text-gray-400 hover:text-white transition-colors">
            <SettingsIcon />
        </button>
      </div>

      <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden relative flex items-center justify-center">
        {streamError ? (
          <div className="text-center text-red-400 p-2">
            <p className="font-bold text-lg mb-2">Stream Unavailable</p>
            <ul className="text-xs text-gray-300 list-none space-y-1 text-left">
              <li>- Check camera IP in settings.</li>
              <li>- Ensure camera is powered on.</li>
              <li>- Verify camera is on the same Wi-Fi.</li>
            </ul>
          </div>
        ) : (
          <img
            src={`http://${camIp}:81/stream`}
            alt="ESP32-CAM Stream"
            className="w-full h-full object-cover"
            onError={() => setStreamError(true)}
          />
        )}
      </div>

      <div className="grid grid-cols-3 grid-rows-4 gap-3 flex-grow">
        {/* Mode Buttons */}
        <ActionButton onClick={() => handleSetMode(RobotMode.Free)} className={`col-span-1 row-start-1 ${activeMode === RobotMode.Free ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}>Free</ActionButton>
        <ActionButton onClick={() => handleSetMode(RobotMode.LineFollower)} className={`col-span-1 row-start-1 ${activeMode === RobotMode.LineFollower ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}>Line</ActionButton>
        <ActionButton onClick={() => handleSetMode(RobotMode.ObstacleAvoidance)} className={`col-span-1 row-start-1 ${activeMode === RobotMode.ObstacleAvoidance ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}>Obstacle</ActionButton>
        
        {/* Spacer */}
        <div className="col-span-1 row-start-2"></div>

        {/* Forward */}
        <ControlButton onAction={handleMove(RobotCommand.Forward)} onRelease={handleStop} className="col-start-2 row-start-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </ControlButton>
        
        {/* Left */}
        <ControlButton onAction={handleMove(RobotCommand.Left)} onRelease={handleStop} className="col-start-1 row-start-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </ControlButton>

        {/* Stop */}
        <ActionButton onClick={handleStop} className="col-start-2 row-start-3 bg-red-600 hover:bg-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6" /></svg>
        </ActionButton>

        {/* Right */}
        <ControlButton onAction={handleMove(RobotCommand.Right)} onRelease={handleStop} className="col-start-3 row-start-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </ControlButton>
        
        {/* Horn Left */}
        <ActionButton onClick={handleHorn} className="col-start-1 row-start-4 bg-yellow-500 hover:bg-yellow-600">Horn</ActionButton>
        
        {/* Backward */}
        <ControlButton onAction={handleMove(RobotCommand.Backward)} onRelease={handleStop} className="col-start-2 row-start-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </ControlButton>

        {/* Horn Right */}
        <ActionButton onClick={handleHorn} className="col-start-3 row-start-4 bg-yellow-500 hover:bg-yellow-600">Horn</ActionButton>
      </div>
    </div>
  );
};

export default Controller;
