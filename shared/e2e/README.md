# Shared end-to-end suite

The backend side of this repository is covered by the BDD suite in
`shared/acceptance`, which talks HTTP. That suite cannot tell whether a user can
actually *use* the application, so this one drives a real browser.

It is implementation-agnostic: it runs against whichever frontend
`FRONTEND_URL` points at, the same way the BDD suite runs against whichever
backend `BACKEND_URL` points at. A frontend passes or fails on its own merits.

```bash
# one frontend, end to end, from the repository root
./scripts/validate-e2e.sh 01-component-layered

# all four
./scripts/validate-e2e.sh
```

Prerequisites: `npm ci` in the frontend and here, then once:

```bash
npx playwright install chromium
```

## The UI contract

`shared/openapi.yaml` is the contract for the HTTP surface. This suite needs a
second, much smaller contract for the **UI surface**: stable hooks a test can
drive without knowing whether the implementation uses contexts, stores or props.

Every frontend must expose these `data-testid` attributes. That is the whole
requirement — styling, structure and state management stay free.

| testid | element |
| --- | --- |
| `signup-name`, `signup-email`, `signup-password`, `signup-submit` | sign-up form |
| `signin-email`, `signin-password`, `signin-submit` | sign-in form |
| `auth-error` | the message shown when a sign-in fails |
| `header-user` | the signed-in user's name; absent while anonymous |
| `project-create-toggle` | control that reveals the project form |
| `project-name`, `project-submit` | project form field and submit |
| `project-item` | one project row |
| `project-select` | inside a `project-item`, opens that project |
| `task-create-toggle` | control that reveals the task form |
| `task-title`, `task-submit` | task form field and submit |
| `task-item` | one task row |
| `task-toggle` | inside a `task-item`, the completed checkbox |
| `task-select` | inside a `task-item`, opens the task |
| `comment-content`, `comment-submit` | comment form |
| `comment-item` | one comment |
| `notification-status` | with `data-connected="yes"` once the socket is up |
| `notification-item` | one real-time notification |
| `notification-dismiss` | inside a `notification-item`, dismisses it |

Two of these deserve a note.

**`notification-status` exists because "connected" is not observable from the
data.** An empty notification list means both "connected, nothing happened" and
"not connected yet", and a test that assigns a task while the socket is still
handshaking is a test that fails once in ten runs. The element doubles as a
genuine live-updates indicator for the user.

**There is no testid for deleting a project or a task, because the contract has
no `DELETE` for either.** `shared/openapi.yaml` exposes `DELETE /comments/{id}`
and nothing else, so the implementations offer no project or task deletion.
Buttons that call endpoints the contract does not define are not a feature, they
are a 404 with a nicer label.

## What is covered

| spec | scenario |
| --- | --- |
| `auth.spec.ts` | sign up, sign in, wrong password, anonymous visitor redirected |
| `projects.spec.ts` | create a project and see it listed; a fresh account starts empty |
| `tasks-comments.spec.ts` | create a task, complete it, comment on it, survive a reload |
| `notifications.spec.ts` | the assignee is notified live; an anonymous visitor holds no socket |

## Not covered

- **Assignment through the UI.** The contract has no user directory (`GET
  /users` does not exist), so a frontend has no source for an `assigneeId`. The
  notification spec assigns through the API instead, and the browser's job is
  the receiving half.
- **Visual regression.** No screenshots are compared.
