// server/src/utils.js
export function makeId(len = 6) {
    return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
  }
  
  export function safeJson(ws, obj) {
    if (!ws || ws.readyState !== ws.OPEN) return;
    ws.send(JSON.stringify(obj));
  }
  
  export function isValidCode(s) {
    return (
      typeof s === "string" &&
      /^[0-9]{4}$/.test(s) &&
      new Set(s.split("")).size === 4
    );
  }
  