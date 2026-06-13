/** Browser-resident WebMCP tool registration (feature-detected). */

export function initWebMcp(): void {
  type WebMcpTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: () => Promise<unknown>;
  };
  type WebMcpNavigator = Navigator & {
    modelContext?: { provideContext: (config: { tools: WebMcpTool[] }) => unknown };
  };

  const nav = navigator as WebMcpNavigator;
  if (!nav.modelContext?.provideContext) return;

  const config = document.querySelector<HTMLScriptElement>('script[data-webmcp-tools]');
  if (!config) return;

  const tools: { name: string; description: string; path: string }[] = JSON.parse(
    config.textContent || '[]',
  );

  const json = async (path: string) => {
    const r = await fetch(path, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`fetch ${path} failed: ${r.status}`);
    return r.json();
  };

  nav.modelContext.provideContext({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => json(t.path),
    })),
  });
}
