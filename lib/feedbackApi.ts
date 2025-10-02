const API_URL = "/api/feedback";

export async function submitFeedback(token: string, data: any) {
  return fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

export async function getAllFeedback(token: string) {
  return fetch(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

export async function getMyFeedback(token: string, params: any = {}) {
  const query = new URLSearchParams({ route: "my-feedback", ...params }).toString();
  return fetch(`${API_URL}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

export async function getEventFeedback(token: string, params: any = {}) {
  const query = new URLSearchParams({ route: "event", ...params }).toString();
  return fetch(`${API_URL}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

export async function resolveFeedback(token: string, id: string, body: any) {
  return fetch(`${API_URL}?id=${id}&route=resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

export async function addAdminNote(token: string, id: string, body: any) {
  return fetch(`${API_URL}?id=${id}&route=note`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

export async function voteFeedback(token: string, id: string, body: any) {
  return fetch(`${API_URL}?id=${id}&route=vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

export async function getAnalytics(token: string) {
  return fetch(`${API_URL}?route=analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}
