# Parameter design delivery

- This repository is the user's designated destination for the latest Parameter design.
- Preserve unrelated user changes and fetch/check remote changes before publishing.
- After completing and checking user-requested design changes, commit the relevant design files and required assets and push to origin, without force-pushing.
- Report successful publication to the user in Persian: «نسخه جدید در گیت به‌روزرسانی شد», with the commit or repository link.
- If publication fails, explain the failure; never claim a successful update.
- The current entry file is `parameter-v34-login-sharp.html`; keep its construction image beside it.
- Row operations and related-form links use icon-only buttons with hover titles, no visible labels/backgrounds. Column headers use separate filter and sort controls; filtering expands inline, never a combined three-dot menu.
- For UI changes, inspect the latest plan-management styles first and reuse the existing shared components and tokens. Main tabs use `group-tab`, `parameter-tab-icon`, and active/aria-selected state. Do not invent independent header palettes or tab patterns for new pages. The removed design-system reference page must not be restored.
