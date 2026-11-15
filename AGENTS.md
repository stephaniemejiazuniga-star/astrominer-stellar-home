<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep opening menu and configuration in client-side UI modules; never represent unimplemented gameplay or multiplayer as working actions.
- Store device preferences locally, independently of Cloud-backed game progress, so configuration does not require an account.
- Keep scientific reference records separate from UI, with source URLs and explicit simulation distinctions, for reuse by later game systems.

- Mount the full-bleed R3F expedition only on the client-only expedition route; keep domain rules in pure campaign TypeScript for deterministic unit checks.
- Durable solo saves use owner-scoped game_saves; cooperative membership and revision-checked saves use database RPCs with atomic five-seat admission, so concurrent joins cannot overfill a room.
- Use one eight-Hz change-only Broadcast/Presence channel per room and durable row-change notifications, with teardown and hidden-tab suppression, so networking stays within the casual co-op message budget.
- Dev-only window.__game exposes state, action, teleport, sim(seconds), roster, remotes and revision for reproductions; the canvas sets data-scene-ready for the bundled verification harness. Never use these hooks to declare normal UI playthrough fully verified.
- Store all scene material roles centrally in scene/palette.ts and all DOM styling in global semantic tokens, so scene and UI changes remain coordinated.
- Instance repeated Mars rocks, minerals and crop foliage; crop growth reads campaign state and the base shell is translucent so cultivation stays visible without adding per-plant draw calls.

- Earth launch is a deterministic campaign phase before flight; legacy version-one saves merge launch defaults for compatibility.
- All input sources share pure input/facing helpers; the astronaut GLB faces negative Z, so heading includes the model-axis correction.
- Clone suit materials per astronaut and broadcast optional profile appearance, so shared model caches never leak another player's colors.
- One gesture-unlocked GameAudio mixer owns recorded sounds and exposes numeric meters; dev __game.performance reports render budgets, not real-device FPS certification.
- English presentation uses stable Spanish domain identifiers and a language context; never translate action types, table keys, site keys or quiz answers before submitting them.
