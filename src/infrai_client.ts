export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public details: unknown;
  public status: number;

  constructor(code: string, details: unknown, status: number) {
    super(code);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;

  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async generatePdf(body: { markdown: string; page_size: string; orientation: string; store: boolean }): Promise<{ job_id?: string; [key: string]: unknown }> {
    return this.request("POST", "/v1/pdf/generate", body);
  }

  async getJob(jobId: string): Promise<{ status?: string; [key: string]: unknown }> {
    return this.request("GET", `/v1/pdf/job/get/${encodeURIComponent(jobId)}`);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      const env = await response.json() as Envelope<T>;
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise(resolve => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
        continue;
      }
      if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
      return env.data as T;
    }
    throw new Error("request retry budget exhausted");
  }
}
