/** Minimal Cloudflare Pages Function types (no npm dependency). */
export {};

declare global {
  type PagesFunction<Env = unknown> = (
    context: EventContext<Env, string, Record<string, string | undefined>>,
  ) => Response | Promise<Response>;

  interface EventContext<Env, P extends string, Data> {
    request: Request;
    env: Env;
    params: Record<P, string | undefined>;
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    data: Data;
  }
}
