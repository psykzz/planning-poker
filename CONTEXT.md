# Planning Poker — Domain Context

A lightweight real-time estimation tool for agile teams. No authentication required — just a shareable URL and a display name.

## Glossary

### Session
A reusable team room identified by a URL hash (e.g., `#team-alpha`). Originally designed as a single meeting, but teams reuse sessions over time, accumulating round history. Sessions are created implicitly when someone visits a hash.

### Round
A single estimation event within a Session. The cycle is: **Vote → Reveal (via "Open results") → Discuss → Reset**. When reset, the round is saved to history and a new round begins. Rounds do not capture *what* is being estimated — that context lives externally (Jira, verbal discussion, screen share).

### User
A person participating in a Session. Represented by a row in the `users` table, scoped to one session. The same person joining multiple sessions has multiple User records.

### Participant
A User who votes. Distinguished by `is_spectator = false`.

### Spectator
A User who observes without voting. Distinguished by `is_spectator = true`. Spectators do not contribute to score statistics.

### Moderator
A self-assigned facilitation role, not a permission boundary. Any User can toggle moderator status. Moderators can transition stages ("Open results", "Back to voting") and access session settings. The toggle exists for UI clarity, not access control.

### Score
A User's estimate for the current Round. Can be:
- **Numeric** — Story point value (depends on point sequence: Fibonacci, Scrum, Standard)
- **?** — "Needs discussion" — the User cannot estimate without more context
- **☕** — "Break needed" — signals a pause for discussion or literal break

Special scores are excluded from statistical calculations (average, std dev).

### Stage
The current phase of a Round:
- **voting** — Users submit scores (hidden from others)
- **results** — Scores are revealed, statistics displayed, discussion happens

Transition from voting → results is triggered by a Moderator clicking "Open results". Transition from results → voting saves the current Round and resets scores.

### Presence
A heartbeat mechanism tracking active Users. Users update `last_presence` every ~10 seconds. Users inactive for 30+ seconds are filtered from the roster and their scores are excluded from statistics.

## Invariants

- Only **active** Users (present within 30 seconds) count toward score statistics
- A User can vote only while Stage = voting
- Late joiners can participate if Stage = voting; otherwise view-only
- Round history persists indefinitely within a Session

## Known Technical Debt

- **Reveal/Hide toggle** — Legacy UI that should be removed. "Open results" is the intended reveal mechanism.
- **AFK score bug** — Scores from inactive Users are currently counted. Should be filtered to active Users only.
- **No data cleanup** — Stale sessions accumulate indefinitely. Need cleanup mechanism for sessions with no activity for extended periods.
