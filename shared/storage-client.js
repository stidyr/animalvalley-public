const API_BASE = "https://api.animalvalley.no";
const API_KEY  = "";
const SCOPE    = "public";

export const storage = {
  get: (key) =>
    fetch(`${API_BASE}/api/get?key=${SCOPE}:${key}`,
      { headers: { "X-API-Key": API_KEY } }).then(r => r.json()),

  set: (key, value) =>
    fetch(`${API_BASE}/api/set?key=${SCOPE}:${key}`,
      { method: "PUT",
        headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(value) }),

  list: (prefix) =>
    fetch(`${API_BASE}/api/list?prefix=${SCOPE}:${prefix}`,
      { headers: { "X-API-Key": API_KEY } }).then(r => r.json()),

  del: (key) =>
    fetch(`${API_BASE}/api/delete?key=${SCOPE}:${key}`,
      { method: "DELETE", headers: { "X-API-Key": API_KEY } }),
};
