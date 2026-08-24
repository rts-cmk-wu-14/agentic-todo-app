## 2026-08-24: Use IndexedDB for client-side persistence

### Context

The app needs registration, login, multiple todo lists, checked-item state, and persistence between sessions, while database implementation is explicitly out of scope.

### Decision

Use the browser's IndexedDB API as the local persistence layer for account, session, list, and item data.

### Alternatives considered

- Use localStorage for simpler persistence.
- Use a predefined demo account instead of implementing registration.
- Provide authentication UI without persistent account enforcement.

### Consequences

- The app can provide meaningful local registration and login without a server database.
- Data is isolated to the browser/device and is not available across devices.
- The implementation needs an IndexedDB initialization and migration strategy, plus graceful handling when storage is unavailable.

## 2026-08-24: Normalize IndexedDB into users, lists, and items stores

### Context

The initial implementation stored the complete application state in one `app` object store row. This makes ownership boundaries and record-level updates harder to maintain.

### Decision

Use separate IndexedDB object stores for `users`, `lists`, and `items`, with a separate `session` store for the current session. Upgrade the existing database in place, migrate the legacy aggregate row into the normalized stores, and remove the legacy `app` store after migration.

### Alternatives considered

- Keep one aggregate row and continue replacing the whole application state.
- Keep the aggregate row alongside normalized stores indefinitely.

### Consequences

- Users, lists, and items can be read and written as independent records while preserving the existing client-side fallback contract.
- The version upgrade must migrate legacy data without dropping records.
- The storage adapter remains responsible for reconstructing the UI's application snapshot and for clearing/rebuilding normalized stores during fallback restoration.

## 2026-08-24: Use hashed passwords for local accounts

### Context

IndexedDB will hold the app's local account and todo data, so the authentication flow still needs to protect stored credentials within the browser's client-side constraints.

### Decision

Support real local accounts with a user-selected email or username and password. Hash passwords before storing them in IndexedDB, using the Web Crypto API rather than storing plaintext credentials.

### Alternatives considered

- Store credentials without hashing for a simpler prototype.
- Use passwordless local profiles.

### Consequences

- Registration and login can be meaningfully validated locally.
- This protects stored passwords from straightforward database inspection but is not equivalent to server-backed security, since the app and data remain client-controlled.
- The app needs password validation, hashing parameters, and a clear local-account recovery or reset policy.

## 2026-08-24: Identify accounts by username

### Context

The local authentication flow needs a stable account identifier, and the user selected usernames rather than email addresses.

### Decision

Require a unique username when registering and use that username for login.

### Alternatives considered

- Identify accounts by email address.
- Require both an email address and username.

### Consequences

- Registration and login do not require collecting personal contact information.
- Username uniqueness and normalization rules must be defined.
- Account recovery cannot rely on email unless a separate recovery mechanism is added.

## 2026-08-24: Recover accounts with a recovery phrase

### Context

Usernames do not provide an email-based password recovery path, but users need a way to regain access without losing their todo lists.

### Decision

Generate a recovery phrase during registration. Let users reset their password by providing that phrase, while preserving the account and its lists.

### Alternatives considered

- Reset the password after confirming only the username.
- Delete the account and its lists so the user can register again.
- Provide no recovery mechanism.

### Consequences

- Registration must display the phrase clearly and encourage the user to save it.
- The phrase must be stored in a protected form suitable for verification, not as visible plaintext.
- Losing both the password and recovery phrase makes the account unrecoverable.

## 2026-08-24: Seed a starter list with example items

### Context

New users should see a useful, populated todo experience immediately after registration rather than an empty state.

### Decision

Create an initial list named "Inbox" for each new account and seed it with representative dummy items, such as "Review today's priorities", "Add your first personal task", and "Check off a completed item".

### Alternatives considered

- Create an empty default list.
- Send the user to an empty state to create their first list.
- Ask the user to name the first list during registration.

### Consequences

- The first-run experience demonstrates list and item interactions without requiring setup.
- Seeded items should be distinguishable from user-created work and should not be re-added on later sessions.
- Users need normal controls to rename or delete the starter list and its items.

## 2026-08-24: Manage lists from a sidebar

### Context

Users can create a number of todo lists, so the app needs a predictable way to switch between and maintain them.

### Decision

Provide a sidebar where users can create, rename, select, and delete todo lists.

### Alternatives considered

- Allow list creation and renaming without deletion.
- Use one list with categories or tags instead.

### Consequences

- The active list and list-management actions remain accessible while working on items.
- Deleting a list must require confirmation and define what happens when the active list is removed.

## 2026-08-24: Support full item management

### Context

Todo items need to support the normal lifecycle expected in a list, including changing their text and organizing their order.

### Decision

Support adding, editing, checking off, deleting, and reordering items within a list.

### Alternatives considered

- Add, edit, check off, and delete items without reordering.
- Add, check off, and delete items without editing.
- Add and check off items only.

### Consequences

- The item model needs a stable identifier, completion state, and explicit ordering value.
- Reordering must persist in IndexedDB and remain stable across sessions.

## 2026-08-24: Make due dates and priority optional

### Context

Some tasks need scheduling or urgency, while others should remain lightweight and require only text and completion state.

### Decision

Allow each todo item to have an optional due date and an optional priority level. Neither field is required to create or edit an item.

### Alternatives considered

- Support text and completion only.
- Support due dates without priority.
- Require both a due date and priority for every item.
- Add tags or notes as part of the same item metadata model.

### Consequences

- The item editor needs clear controls for setting and clearing each optional field.
- The list view needs a compact way to show due dates and priority without making simple tasks feel heavy.
- Sorting and filtering behavior for these fields still needs to be defined.

## 2026-08-24: Keep completed items in place

### Context

Users may rely on the order of their task list, including the position where an item was completed.

### Decision

Completed items remain in their existing position and receive a clear completed visual style.

### Alternatives considered

- Move completed items to the bottom.
- Hide completed items by default.
- Move completed items to the bottom and make them collapsible.

### Consequences

- Checking an item off does not unexpectedly reorder the list.
- The interface should provide enough visual distinction for completed items while keeping their text readable.

## 2026-08-24: Preserve manual order with optional filters

### Context

Users need to control task order themselves while still being able to focus on subsets of work using the new metadata fields.

### Decision

Preserve the chosen manual item order and provide optional filters for all items, active items, completed items, overdue items, and priority.

### Alternatives considered

- Automatically sort by due date with priority as a secondary sort.
- Offer selectable sorting by manual order, due date, or priority.

### Consequences

- Filtering must not change the stored order or item data.
- The active filter should be visible and easy to clear.
- Overdue status must be calculated from the current date and apply only to items with a due date.

## 2026-08-24: Use four priority states

### Context

Todo items need a simple urgency indicator without forcing users to assign metadata to every task.

### Decision

Support the priority states none, low, medium, and high.

### Alternatives considered

- Support none, low, and high.
- Support low, medium, and high without an explicit none state.
- Use a numeric priority from 1 to 5.

### Consequences

- Priority is optional because "none" is a valid state.
- The UI should use consistent labels and visual treatment for the three assigned levels.

## 2026-08-24: Reorder items with drag and drop

### Context

Users chose to preserve manual ordering and need a direct way to organize items within a list.

### Decision

Provide drag-and-drop reordering for todo items and persist the resulting order in IndexedDB.

### Alternatives considered

- Provide move-up and move-down buttons.
- Support both drag-and-drop and move buttons.
- Use creation order without a manual reordering control.

### Consequences

- Each item needs a stable ordering value and a clear draggable affordance.
- The interaction must remain usable with keyboard and touch input, or provide an accessible alternative.

## 2026-08-24: Use a collapsible mobile list drawer

### Context

The desktop sidebar must remain usable on small screens without taking space away from the active todo list.

### Decision

On mobile, collapse the list sidebar into a drawer opened by a menu button. The drawer can be closed after selecting a list or by an explicit close action.

### Alternatives considered

- Keep the sidebar always visible above the active list.
- Replace the sidebar with a horizontal list switcher.
- Hide list management on mobile.

### Consequences

- The active list view gets the full mobile width by default.
- The drawer needs an accessible open/close state and must not trap users away from the active list.

## 2026-08-24: Follow the system color theme

### Context

The app should adapt to the user's environment without adding another preference that must be managed and persisted locally.

### Decision

Use the operating system's light or dark theme preference automatically. Do not provide an in-app theme toggle.

### Alternatives considered

- Provide light and dark themes with a toggle and use the system preference initially.
- Provide a light theme only.
- Provide a dark theme only.

### Consequences

- The interface must maintain readable contrast and clear states in both themes.
- Theme changes from the operating system should take effect without requiring an app restart.

## 2026-08-24: Restore the last local session

### Context

Users expect their locally persisted todo workspace to be immediately available when returning to the app, while new users still need an authentication entry point.

### Decision

Automatically restore the last local session when one is available. If no session can be restored, show the login screen with a link to registration.

### Alternatives considered

- Always show the login screen by default.
- Always show the registration screen by default.
- Show a welcome screen with equally prominent login and registration actions.

### Consequences

- The app needs a persisted current-session record and a loading state while IndexedDB is initialized.
- Users need an explicit logout action to stop automatic restoration on that device.

## 2026-08-24: Keep account data after logout

### Context

Logging out should end the current session without destroying the user's locally stored account or todo lists.

### Decision

Logout clears only the active session. The account, recovery data, lists, and items remain in IndexedDB and can be accessed after logging in again.

### Alternatives considered

- Clear the session and provide a separate account-removal action.
- Clear all local accounts and todo data on logout.

### Consequences

- The app must distinguish session clearing from permanent account deletion.
- Account deletion, if supported, needs an explicit destructive confirmation flow.

## 2026-08-24: Support multiple isolated local accounts

### Context

The browser may be shared by more than one local user, and account data must remain separated.

### Decision

Allow multiple accounts to be registered and logged into on the same browser. Each account has isolated lists and items.

### Alternatives considered

- Support only one account per browser.
- Support multiple accounts with a quick account switcher.

### Consequences

- Usernames must be unique across the local database.
- Login remains the mechanism for changing accounts; no account switcher is required.
- The data model must scope every list and item to its owning account.

## 2026-08-24: Require the password for account deletion

### Context

Permanent deletion of a local account and all of its lists is destructive and must be protected separately from ending a session.

### Decision

Allow users to permanently delete their account after explicit confirmation and successful verification of their current password. The recovery phrase cannot authorize account deletion.

### Alternatives considered

- Require either the password or recovery phrase.
- Require explicit confirmation without credential verification.
- Never allow account deletion.

### Consequences

- Account deletion must remove the account, its lists, and its items from IndexedDB, then clear the active session.
- A user who has forgotten the password can recover access with the phrase, then set a new password before deleting the account.

## 2026-08-24: Use minimal registration validation

### Context

This is a local todo application, and the user prefers a low-friction registration flow rather than strict username or password format rules.

### Decision

Require only a non-empty username and non-empty password during registration. Enforce username uniqueness, and provide confirmation fields where needed to reduce accidental input errors.

### Alternatives considered

- Limit usernames to 3-20 letters, numbers, and underscores, with passwords of at least 8 characters.
- Allow usernames of 3-30 letters, numbers, underscores, and hyphens, with passwords of at least 8 characters.

### Consequences

- The app should still trim input and reject duplicate usernames.
- Minimal validation is appropriate for a local prototype but does not provide strong password-quality guarantees.

## 2026-08-24: Treat usernames as case-sensitive

### Context

The registration flow needs an explicit username comparison rule because multiple accounts can exist in the same browser.

### Decision

Usernames are case-sensitive. `Alice`, `alice`, and `ALICE` are distinct account identifiers.

### Alternatives considered

- Treat usernames case-insensitively.
- Preserve original casing while logging in case-insensitively.

### Consequences

- Username uniqueness checks and login comparisons must use exact casing.
- The UI should preserve and display the username exactly as registered.

## 2026-08-24: Confirm passwords during registration

### Context

With minimal password validation and no server-side recovery, an accidental password entry could otherwise make a new local account difficult to access.

### Decision

Require users to enter the password twice during registration and reject the form unless both values match. Apply the same confirmation requirement when setting a new password after recovery.

### Alternatives considered

- Use one password field during registration.
- Require confirmation only when changing or resetting the password.

### Consequences

- The authentication forms need a confirmation field and a clear mismatch error.
- The confirmation value is transient and must never be stored.

## 2026-08-24: Use four random recovery words

### Context

The local account needs a recovery credential that is easier to transcribe than a long code while remaining generated by the app.

### Decision

Generate a recovery phrase consisting of four random words during registration. Display it to the user as part of onboarding and use the phrase for password recovery.

### Alternatives considered

- Generate twelve random words.
- Generate twenty-four random words.
- Let users create their own phrase.
- Generate a short alphanumeric recovery code.

### Consequences

- The app needs a deterministic word list and secure random selection using the Web Crypto API.
- The phrase must be normalized consistently for verification and stored only as a protected hash.
- Four words provide convenience but lower entropy than longer phrases, so the UI should make clear that the phrase must be kept private.

## 2026-08-24: Confirm the recovery phrase during registration

### Context

The recovery phrase is shown during onboarding and cannot be recovered from outside the browser, so users need to verify that they recorded it correctly.

### Decision

Require users to re-enter all four recovery words before registration is complete. Registration cannot finish until the entered phrase matches the generated phrase.

### Alternatives considered

- Show the phrase with a copy button and allow users to continue without confirmation.
- Make confirmation recommended but skippable.

### Consequences

- The generated phrase must remain available only during the registration flow until confirmation succeeds.
- The phrase confirmation input is transient and must not be stored separately.

## 2026-08-24: Confirm permanent list deletion

### Context

Lists contain user-created items, so deleting one is a destructive operation that must not happen accidentally.

### Decision

Require explicit confirmation before permanently deleting a list. Deleting the list also permanently deletes all items belonging to it.

### Alternatives considered

- Archive lists instead of deleting them.
- Require users to type the list name before deletion.
- Prevent deletion of the last remaining list.

### Consequences

- The UI must communicate that list deletion includes its items.
- The deletion operation must remove the list and its child items from IndexedDB.

## 2026-08-24: Show an empty state after active-list deletion

### Context

Deleting the selected list can leave the user without an active workspace, especially when it was the last list.

### Decision

After deleting the active list, show an empty state that asks the user to create or select a list. Do not create a replacement list automatically.

### Alternatives considered

- Select another existing list automatically.
- Create a new empty list automatically.
- Prevent deletion of the active list until another list is selected.

### Consequences

- The app needs a first-class no-active-list state.
- The empty state must provide a direct create-list action and, when applicable, make remaining lists selectable.

## 2026-08-24: Use a modal item editor

### Context

Todo items have optional metadata, so editing needs enough space for text, due date, and priority without making each list row overly dense.

### Decision

Use a modal dialog for adding and editing items. The dialog includes the item text, optional due date, and optional priority fields.

### Alternatives considered

- Edit items inline directly in the list.
- Use quick inline add with a separate modal or panel for metadata editing.

### Consequences

- The modal needs create, edit, cancel, and validation states.
- The dialog must be keyboard accessible and usable on small screens.

## 2026-08-24: Save item edits explicitly

### Context

The item modal can contain several fields, and users need a reliable way to decide whether changes should be committed.

### Decision

Provide explicit Save and Cancel buttons. Closing or canceling the modal discards all unsaved changes.

### Alternatives considered

- Autosave changes when the modal closes.
- Save automatically as each field changes.

### Consequences

- The Save action must persist the complete item atomically enough that partial edits are not left behind.
- The modal should indicate validation errors without closing.

## 2026-08-24: Use a modal list editor

### Context

List creation and renaming are distinct actions that should have enough room for validation and should follow the item editor's interaction pattern.

### Decision

Use a modal dialog for both creating and renaming lists. Require a non-empty list name and provide explicit Save and Cancel buttons.

### Alternatives considered

- Edit list names inline in the sidebar.
- Create lists inline but use a modal for renaming.

### Consequences

- Closing or canceling the modal discards unsaved list-name changes.
- The list editor needs clear validation for empty or otherwise invalid names.

## 2026-08-24: Require unique list names per account

### Context

List names are used for navigation in the sidebar, so duplicate names could make selecting and distinguishing lists unnecessarily confusing.

### Decision

List names must be unique within an account. The same name may still exist in a different account.

### Alternatives considered

- Allow duplicate list names.
- Warn about duplicates but allow them.

### Consequences

- Creating or renaming a list must reject a name already used by another list owned by the account.
- Name comparison rules need to be defined alongside list-name trimming and username comparison.

## 2026-08-24: Compare list names case-insensitively

### Context

List names must be unique within an account, and visually similar names would be difficult to distinguish in the sidebar.

### Decision

Trim list names and compare them case-insensitively when enforcing uniqueness. Preserve the first-created or edited display casing for the stored name.

### Alternatives considered

- Compare list names case-sensitively.
- Trim whitespace but otherwise use case-sensitive names.

### Consequences

- `Work` and `work` are treated as duplicate names within an account.
- The UI should reject names that become empty after trimming and should explain duplicate-name errors.

## 2026-08-24: Require non-empty item text

### Context

An item without meaningful text cannot be identified or completed reliably.

### Decision

Require todo-item text and trim surrounding whitespace before saving. Reject empty or whitespace-only values.

### Alternatives considered

- Allow empty text for quick placeholders.
- Add a maximum text length as part of the required validation.

### Consequences

- The item modal must show a validation error and remain open when text is invalid.
- Stored item text will not contain accidental leading or trailing whitespace.

## 2026-08-24: Store due dates as local date-times

### Context

Due dates need to support scheduling at a specific time, and the app is local to the user's browser rather than coordinating across devices or servers.

### Decision

Represent an optional due date as a date and time in the user's local timezone.

### Alternatives considered

- Store only a local calendar date.
- Store a date and time in UTC.

### Consequences

- The item editor needs date and time inputs and a way to clear the due date.
- Overdue status must compare the stored local date-time against the current local time.
- Moving the data to another timezone or device is outside the current local-only scope.

## 2026-08-24: Use a select for item priority

### Context

Priority is edited alongside the item's other metadata in the modal, and it has a small fixed set of named states.

### Decision

Use a select control in the item modal with the options None, Low, Medium, and High.

### Alternatives considered

- Use color-coded priority buttons.
- Put priority in a separate menu opened from each item row.

### Consequences

- The priority field remains compact and keyboard accessible.
- Priority colors or visual indicators in the list must supplement, rather than replace, the textual value.

## 2026-08-24: Use a filter select for item views

### Context

The list needs several focus modes without taking substantial vertical space away from the tasks themselves.

### Decision

Provide one filter select with the options All, Active, Completed, Overdue, and Priority. Keep the selected filter visible and allow returning to All.

### Alternatives considered

- Use segmented buttons or tabs for completion states and a separate priority filter.
- Put all filter options in a menu opened by a button.
- Show every filter control directly above the list.

### Consequences

- The filter is a view state and must not alter stored item order or data.
- The Priority option needs a defined matching rule for items with assigned priority.

## 2026-08-24: Filter priority-assigned items together

### Context

The filter select has one Priority mode, while individual items can use three assigned priority levels.

### Decision

The Priority filter shows every item with Low, Medium, or High priority and excludes items whose priority is None.

### Alternatives considered

- Show only High-priority items.
- Reveal a second selector for choosing a specific priority level.

### Consequences

- Users can focus on all explicitly prioritized work from one filter option.
- Filtering for one exact level is outside the current filter scope.

## 2026-08-24: Display due dates with relative labels

### Context

Due dates are stored as local date-times, but users benefit from quick visual cues when scanning a task list.

### Decision

Display due dates using relative labels such as "Today", "Tomorrow", and "Overdue".

### Alternatives considered

- Always show the local date and time.
- Use relative labels with the exact date and time available only in the editor.

### Consequences

- Relative status must update as time passes and must be calculated from the local date-time.
- The list needs a clear treatment for dates farther in the future and for items due later today.

## 2026-08-24: Show exact time with relative due labels

### Context

Relative labels make dates easy to scan, while the selected due-date model includes a specific time that should remain visible.

### Decision

Show the relative due-date label together with the exact local time in the list, for example "Today, 4:30 PM".

### Alternatives considered

- Show only the relative label.
- Show the exact date and time only on hover or focus.

### Consequences

- The due-date presentation must remain readable in narrow list rows.
- The exact local date should still be available in the item editor for dates whose relative label is not immediately descriptive.

## 2026-08-24: Use countdowns for future due dates

### Context

Due-date labels should communicate urgency while retaining the precise local time chosen by the user.

### Decision

For dates beyond today and tomorrow, display a relative countdown with the exact local time, such as "In 6 days, 4:30 PM".

### Alternatives considered

- Show the calendar date and exact time only.
- Show both the calendar date and a relative countdown.

### Consequences

- Countdown labels must update as time passes.
- The full calendar date remains available in the item editor and should be available to assistive technology where the short label is ambiguous.

## 2026-08-24: Support keyboard drag-and-drop reordering

### Context

Desktop drag-and-drop alone does not provide an equivalent reordering path for keyboard users.

### Decision

Support keyboard reordering with an accessible drag interaction: Space picks up an item, arrow keys move it, and Space drops it.

### Alternatives considered

- Add move-up and move-down buttons to every item row.
- Provide both move buttons and keyboard drag-and-drop.
- Provide no keyboard reordering support.

### Consequences

- The draggable item needs an accessible name and live status feedback during movement.
- The implementation must preserve the same persisted order regardless of whether the change came from pointer or keyboard input.

## 2026-08-24: Support touch item reordering

### Context

The app is responsive and manual ordering is a core workflow, so mobile users need a direct reordering interaction too.

### Decision

Support touch drag-and-drop reordering on mobile in addition to pointer and keyboard interactions.

### Alternatives considered

- Use move-up and move-down buttons on touch devices.
- Disable reordering on mobile.

### Consequences

- The drag interaction must avoid interfering with scrolling and item controls.
- Touch movement and drop results must persist through the same ordering path as other input methods.

## 2026-08-24: Do not impose artificial list or item limits

### Context

The product brief says users can create a number of todo lists, but does not specify a product limit.

### Decision

Do not impose artificial limits on the number of lists or items. Use the browser's IndexedDB capacity as the practical limit.

### Alternatives considered

- Limit the number of lists while allowing unlimited items.
- Limit both lists and items.

### Consequences

- The app must handle quota and persistence errors without losing already saved data.
- Very large collections may require efficient rendering later, but virtualization is not an initial requirement.

## 2026-08-24: Fall back to localStorage when IndexedDB is unavailable

### Context

The app should remain usable when IndexedDB is temporarily unavailable, while IndexedDB remains the preferred persistence layer.

### Decision

Use localStorage as a graceful fallback for persisted app data when IndexedDB cannot be opened or written. Continue reporting the storage condition to the user without blocking normal actions. When IndexedDB becomes available again, migrate fallback data back into IndexedDB and return to IndexedDB as the primary store.

### Alternatives considered

- Disable data-changing actions until IndexedDB works.
- Keep data only in memory with a warning.
- Show a blocking setup or error screen.

### Consequences

- The persistence layer needs a shared storage adapter rather than direct IndexedDB calls throughout the UI.
- Fallback writes and migration must preserve account isolation, sessions, list order, item order, and all metadata.
- localStorage has lower capacity and synchronous access, so quota failures must also be handled gracefully.

## 2026-08-24: Merge storage records during migration

### Context

IndexedDB and localStorage may diverge while the fallback is active or after a partial migration, so restoration needs a deterministic conflict policy.

### Decision

Merge records by stable ID and keep the newest version of each record. Preserve records that exist in only one store.

### Alternatives considered

- Prefer IndexedDB and discard conflicting fallback records.
- Prefer localStorage and overwrite conflicting IndexedDB records.
- Ask the user to resolve storage conflicts manually.

### Consequences

- Persisted records need a reliable version or last-modified value for comparison.
- Migration must merge related account, list, and item records without violating ownership or leaving orphaned data.

## 2026-08-24: Synchronize changes across browser tabs

### Context

The same local account may be open in more than one browser tab, and users should not need to refresh to see changes made elsewhere.

### Decision

Synchronize persisted changes across tabs in real time. Use browser cross-context messaging alongside storage notifications so list, item, session, and account changes update other open tabs.

### Alternatives considered

- Re-read data only when the app regains focus.
- Let each tab keep its own view until refreshed.

### Consequences

- The app needs a cross-tab event protocol and must ignore messages from unrelated accounts or stale versions.
- Simultaneous edits require a deterministic conflict-resolution rule.

## 2026-08-24: Keep simultaneous-edit resolution simple

### Context

Cross-tab synchronization is required, but simultaneous edits to the same record are not a meaningful product scenario for this local app.

### Decision

Do not add user-facing conflict-resolution workflows. Resolve rare simultaneous same-record edits with a straightforward last-write-wins rule using the record version or modification timestamp.

### Alternatives considered

- Reject later conflicting writes.
- Merge compatible fields.
- Ask the user to resolve conflicts.

### Consequences

- The synchronization implementation stays small and deterministic.
- A rare concurrent edit may overwrite another tab's change without an interactive warning.

## 2026-08-24: Search within the active list

### Context

Users may have many items in a list and need a quick way to locate a task without changing the stored order.

### Decision

Provide a text search field scoped to the active list. Search filters visible items by their text and works alongside the status and priority filter.

### Alternatives considered

- Use only status and priority filters.
- Search across all lists from one global search field.

### Consequences

- Search is a view state and must not mutate persisted data or item order.
- The UI needs a clear way to clear the search query and recover the normal list view.

## 2026-08-24: Use case-insensitive item search

### Context

Search should help users find task text without requiring them to match the original capitalization.

### Decision

Match item text case-insensitively when filtering the active list. Searching for `Buy` also matches `buy`.

### Alternatives considered

- Match item text case-sensitively.

### Consequences

- Search normalization must be applied consistently to both the query and item text.
- Stored item casing remains unchanged.

## 2026-08-24: Use an anime-inspired handwritten visual style

### Context

The app needs a distinct visual identity rather than a generic todo-dashboard appearance.

### Decision

Use an anime-inspired interface with handwritten-style typography, expressive visual details, and readable task-focused layouts. Preserve clear contrast and accessible controls in both system color themes.

### Alternatives considered

- Use a calm and minimal visual direction.
- Use a bold and energetic visual direction without the anime and handwritten treatment.
- Use a warm and friendly visual direction.

### Consequences

- Typography and decorative treatments must be selected carefully so personality does not reduce readability.
- The design system needs compatible light and dark color tokens rather than a single fixed palette.

## 2026-08-24: Use hot pink and indigo as the core palette

### Context

The anime-inspired visual style needs a recognizable color direction that can work across the system's light and dark themes.

### Decision

Use hot pink and indigo as the primary accent palette, with supporting neutral colors chosen for readable surfaces, text, and status states.

### Alternatives considered

- Sakura pink and indigo.
- Sky blue and coral.
- Mint green and cherry red.
- Monochrome ink with one bright accent.

### Consequences

- Hot pink and indigo should identify primary actions and brand accents without replacing semantic colors for priority, errors, or overdue states.
- Both theme variants need contrast checks for controls, text, focus indicators, and completed-item styling.

## 2026-08-24: Include anime artwork in the workspace

### Context

The chosen anime-inspired identity should be visible after login, not limited to typography and accent colors.

### Decision

Include a subtle anime-inspired illustration or character accent in the authenticated workspace while keeping the todo list the primary focus.

### Alternatives considered

- Use only typography, color, and interface details.
- Restrict decorative artwork to login and registration screens.

### Consequences

- Artwork must remain secondary to task content and responsive across desktop and mobile layouts.
- The asset should be locally bundled or generated so the app does not depend on an external runtime image service.

## 2026-08-24: Use subtle motion for anime artwork

### Context

The anime accent should feel alive without competing with repeated todo-list work.

### Decision

Add subtle animation to the workspace artwork, such as gentle blinking or floating accents. Keep motion low-intensity and nonessential to task completion.

### Alternatives considered

- Keep the artwork static.
- Animate artwork only on login and registration screens.

### Consequences

- Motion should be lightweight and avoid layout shifts or distracting movement near task controls.
- The app needs an accessible reduced-motion behavior.

## 2026-08-24: Respect reduced-motion preferences

### Context

Decorative animation should not create discomfort or accessibility barriers for users who request reduced motion.

### Decision

Respect the operating system's reduced-motion preference and disable decorative anime artwork animation when it is enabled.

### Alternatives considered

- Always animate regardless of system preference.
- Provide a separate in-app motion toggle.

### Consequences

- The animated artwork needs a static fallback state.
- Task interactions and state changes must remain understandable without animation.

## 2026-08-24: Name the app AniDo

### Context

The app needs a concise identity that reflects its anime-inspired todo experience.

### Decision

Call the application "AniDo" and use that name in the interface, authentication screens, and documentable product references.

### Alternatives considered

- Let the assistant choose a different anime-themed name.
- Use a generic name such as "Todo Lists".

### Consequences

- Branding should remain secondary to the core todo workflow.
- The app title and accessible labels should consistently use AniDo where the product name is exposed.
