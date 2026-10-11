<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Each realm is registered in `src/game/realm-defs.ts` (puzzles, hotspots, narration, completion timeline); the play route reads it — add new realms there rather than branching in the route.
- Realms after the dungeon render through the generic `SceneRoom` with a realm-specific scene/celebration component in `src/components/game/realms/` — keeps each realm's animations unique without duplicating hotspot/progress logic.
- The play route keys its body by levelId so moving to the next realm never inherits the previous realm's sequence state.
