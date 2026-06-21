export function decodeJwt(token: string) {
  const [header, payload] = token.split(".");
  if (!header || !payload) throw new Error("JWT must contain a header and payload");

  const decode = (part: string) => JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  const decodedPayload = decode(payload);

  return {
    header: decode(header),
    payload: decodedPayload,
    expiration: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toLocaleString() : "No exp claim"
  };
}

export function uuidV4() {
  return crypto.randomUUID();
}

export function base64Encode(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

export function base64Decode(value: string) {
  return decodeURIComponent(escape(atob(value)));
}
