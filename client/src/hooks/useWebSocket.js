import { useEffect, useMemo, useRef, useState } from "react";

export function useWebSocket(url) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastMsg, setLastMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (e) => {
      try {
        setLastMsg(JSON.parse(e.data));
      } catch {
        // ignore
      }
    };

    ws.onerror = () => setError("WebSocket error");
    ws.onclose = () => setConnected(false);

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [url]);

  const send = useMemo(() => {
    return (type, payload = {}) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== 1) return; // OPEN
      ws.send(JSON.stringify({ type, ...payload }));
    };
  }, []);

  return { connected, lastMsg, error, send };
}
