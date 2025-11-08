# Changelog / Release Notes Prompt

Purpose
- Provide a consistent plain-English template and examples for generating user-facing changelogs and release notes.
- Keep the format short and non-technical (suitable for emailing non-technical users).

Format rules (use these exactly):

1) Subject line (one short sentence)
- Example: "Quick update — Weapon balance + Jump Jet & Dark Mode fixes (Nov 8, 2025)"

2) One-line lead summary (very short)
- Example: "Small balance and UI fixes across a few systems. No action needed from users."

3) Bulleted details (one bullet per specific user‑visible change). Each bullet MUST follow this pattern:
- <Area or feature name>
  - <Short plain-language change 1>
  - <Short plain-language change 2>

Examples (exact phrasing style):
- Particle Cannon
  - Removed the "Plasma" trait.
  - Light damage increased (now stronger).
  - Heavy and Ultra‑Heavy weight reduced (cheaper).
  - Range increased from 12" to 18".

- Laser
  - Medium and Ultra‑Heavy weights increased (slightly heavier).
  - Ultra‑Heavy damage reduced (slightly weaker).
  - AP values increased for Heavy and Ultra‑Heavy.
  - Range changed to “Unlimited”.

- Jump Jets (print)
  - Fixed print bug that showed a Jump value even when Jump Jets weren’t equipped; now shown only when the upgrade is present.

4) Optional short developer notes (one paragraph) after user bullets: list the affected files (paths) and any quick follow-ups.
- Keep developer notes separate and clearly labeled.

5) Tone and restrictions
- Keep language plain, short, and non-technical. Avoid implementation details (no code, no IDs) in the user bullets.
- Use exact, imperative short phrases like "Removed", "Increased", "Fixed".
- Use double quotes for nicknames or trait names if needed (e.g., "Plasma").

6) Metadata
- Include date and author in the header if available.

Checklist for release author (copy into PR description):
- [ ] Subject line matches template
- [ ] One-line lead present
- [ ] All user-visible changes are in bullets and non-technical
- [ ] Developer notes list changed files
- [ ] Tests or verification steps included if needed

---

Use this file as the canonical prompt when generating changelog text for user-facing emails or release notes.
