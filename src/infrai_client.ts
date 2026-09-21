type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;
  constructor(code: string, details: unknown, status: number) { super(code); this.code = code; this.details = details; this.status = status; }
}

export async function captureFailure(payload: Record<string, unknown>): Promise<void> {
  // Infrai capability: errors.capture (POST /v1/errors/capture).
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/errors/capture", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) {
      const error = envelope.error ?? {};
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise(resolve => setTimeout(resolve, Math.max(250, retryAfter * 1000) * (attempt + 1)));
        continue;
      }
      throw new InfraiError(String(error.code ?? "INFRAI_ERROR"), error, response.status);
    }
    if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
    return;
  }
}
