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

## English Start
- Learning content (companions, locations, words, missions) lives in typed modules in `src/lib/content.ts`; user progress lives in Cloud tables (profiles, mission_progress, learned_words, activity_log) via `src/lib/progress.ts`. Why: content can later move to the database without touching UI.
- Pronunciation uses browser speech synthesis (`src/lib/speech.ts`). AI conversation, speech recognition and adaptive level are NOT implemented and must be shown as "Próximamente", never simulated. Any AI key goes server-side only.
- Each learning content type has its own color token (vocab, phrase, character, audio) in `src/styles.css`; use those tokens, not raw colors. Why: color coding supports memory.

- Keep beginner bilingual translations alongside their English content in typed content modules; audio continues to pronounce the English text with the selected companion. Why: translation support stays consistent without changing pronunciation practice.
- Apply sentence-level pronunciation delivery centrally in the speech helper and reuse one selected voice across each playback. Why: every learning screen gets consistent phrasing without losing the companion's voice.
