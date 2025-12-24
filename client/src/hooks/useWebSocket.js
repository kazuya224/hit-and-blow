// client/src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url, onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setConnected(false);

    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      setError(String(e?.message ?? e));
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onerror = () => {
      setError("WebSocket error");
      setConnected(false);
    };
    ws.onclose = () => setConnected(false);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        onMessage?.(msg);
      } catch {
        // JSONじゃないなら無視
      }
    };

    return () => {
      try { ws.close(); } catch {}
    };
  }, [url, onMessage]);

  const send = useCallback((type, payload = {}) => {
    const msg = JSON.stringify({ type, ...payload });
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(msg);
  }, []);

  return { connected, error, send };
}
