export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ShadowXLab PAM Academy | Application Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <style>
      body { font: 15px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #001224; color: #F8FAFC; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 32rem; width: 100%; text-align: center; padding: 2.5rem; background: #001A33; border: 1px solid #1E3A5F; border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .brand { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1.5rem; font-weight: 700; font-size: 0.85rem; letter-spacing: 1.5px; color: #38BDF8; }
      h1 { font-size: 1.35rem; margin: 0 0 0.75rem; color: #FFFFFF; }
      p { color: #94A3B8; margin: 0 0 1.5rem; line-height: 1.6; font-size: 0.95rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.25rem; border-radius: 4px; font: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.15s ease; }
      .primary { background: #0078D4; color: #FFFFFF; }
      .primary:hover { background: #0086F0; }
      .secondary { background: transparent; color: #94A3B8; border-color: #334155; }
      .secondary:hover { background: #0F2942; color: #FFFFFF; border-color: #475569; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="brand">
        <span>SHADOWXLAB · PAM ACADEMY</span>
      </div>
      <h1>Simulation Runtime Error</h1>
      <p>An unexpected condition occurred in the training runtime. You can reload the simulator or return to the overview dashboard.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Reload Simulator</button>
        <a class="secondary" href="/">Return to Overview</a>
      </div>
    </div>
  </body>
</html>`;
}
