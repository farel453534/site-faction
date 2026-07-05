---
name: Two separate ticket systems (Python Discord bot vs web api-server)
description: The project has two unrelated "ticket" systems; know which one to edit before adding ticket features.
---

There are two independent ticket systems in this project, not one:

1. **Web app tickets** — `lib/db/src/schema/tickets.ts` + `artifacts/api-server/src/routes/tickets.ts`. Rows in a Postgres `tickets` table, viewed on the reglement site (`/tickets`). Node's `discord.ts` sends REST notifications for these.
2. **Discord bot tickets** — a large standalone `discord.py` bot (~9800 lines, user manages it outside this repo, only shares it here as an attached file when edits are needed) with its own `TICKET_FACTIONS` dict (per-faction category_id/role_id/color) and a `TicketCreateButton` that creates a private Discord *channel* per ticket. This is the system players actually use in Discord for plaintes/demandes.

**Why it matters:** the user's requests about "notify gérants when a player opens a ticket" refer to system #2 (the Discord channel-based ticket bot), not system #1. Adding notification logic to the Node api-server alone does not affect what players see in Discord — the equivalent logic (DM to `role.members` of the faction's `role_id`, plus a log embed to a fixed channel ID) must be added inside the Python bot's `TicketCreateButton.callback`.

**How to apply:** when asked to change "ticket" notification/behavior for players in Discord, first check whether the user has attached/mentioned the standalone Python bot file — if so, edit that file directly rather than (or in addition to) the web app's tickets route. The bot also has an `outgoing_messages` Postgres table + `process_outgoing_messages` task loop (5s poll) that other services could use to queue channel messages for it to send, if direct DB access from Node to the bot's DB is ever wired up.
