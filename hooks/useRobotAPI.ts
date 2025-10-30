
import { useCallback } from 'react';
import { RobotCommand, RobotMode } from '../types';

export const useRobotAPI = (picoIp: string | null) => {
  const sendRequest = useCallback(async (endpoint: string, params: Record<string, string>) => {
    if (!picoIp) {
      throw new Error("Pico IP address is not set.");
    }
    const url = new URL(`http://${picoIp}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      // Using 'no-cors' as the Pico server might not send CORS headers.
      // We don't need to read the response, just send the command.
      await fetch(url.toString(), { mode: 'no-cors' });
    } catch (error) {
      const errorMessage = `Failed to send command to ${url.toString()}`;
      console.error(errorMessage + ':', error);
      // Re-throw to allow the caller to handle the UI feedback.
      throw new Error(errorMessage);
    }
  }, [picoIp]);

  const sendCommand = useCallback((command: RobotCommand) => {
    return sendRequest('cmd', { cmd: command });
  }, [sendRequest]);

  const setMode = useCallback((mode: RobotMode) => {
    return sendRequest('mode', { mode: mode });
  }, [sendRequest]);

  const testPicoConnection = useCallback(async (): Promise<boolean> => {
    if (!picoIp) return false;
    try {
      // A simple fetch to the base URL. If it resolves without a network error,
      // the device is likely reachable on the network.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
      await fetch(`http://${picoIp}`, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  }, [picoIp]);

  return { sendCommand, setMode, testPicoConnection };
};

export const testCamConnection = async (camIp: string | null): Promise<boolean> => {
  if (!camIp) return false;
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        img.src = ''; // Abort loading
        resolve(false);
      }
    }, 3000); // 3-second timeout

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(true);
      }
    };
    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    };
    // Add a cache-busting query param to ensure a fresh request
    img.src = `http://${camIp}:81/stream?_=${new Date().getTime()}`;
  });
};
