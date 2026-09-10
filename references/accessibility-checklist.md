# Accessibility checklist

WCAG 2.1 AA in a form a reviewer can check. `quality-verification` runs the objective subset mechanically
— responsive down to mobile, visible keyboard focus, `prefers-reduced-motion` honoured — and grades the
rest against the design reference.

## Keyboard

- Every interactive element reachable by Tab, in an order matching the visual one
- Focus visible on every focused element — style the outline, never remove it
- Custom widgets take Enter to activate, Escape to close
- No keyboard trap: Tab always leaves a component
- A skip-to-content link at the top, visible at least on focus
- Modals trap focus while open, return it to the opener on close

## Screen readers

- `alt` on every image, or `alt=""` when decorative
- A label on every input — `<label>` or `aria-label`
- Descriptive text on buttons and links, never "click here"; `aria-label` on icon-only ones
- One `<h1>` per page; headings skip no level; an empty link or button is announced as "link"
- Dynamic changes announced through an `aria-live` region; tables use `<th>` with `scope`

## Visual

- Text contrast ≥ 4.5:1, or ≥ 3:1 at 18px and above; UI components ≥ 3:1 against the background
- Colour never the only carrier of information
- Text resizes to 200% without breaking the layout
- Nothing flashes more than three times a second
- `prefers-reduced-motion` honoured — non-essential motion reduced or removed

## Forms

- A visible label on every input; required fields marked by more than colour
- Errors specific, associated with their field, shown as more than a colour change
- Submission errors summarised and focusable; known fields carry `autocomplete`

## Content

- `<html lang>` declared and a descriptive `<title>`
- Links distinguishable from surrounding text by more than colour
- Touch targets ≥ 44×44px on mobile; empty states say something
- Media never autoplays; `tabindex` never above 0 — only `0` or `-1`

## Patterns

`<button>` for actions, `<a href>` for navigation — a `div` with `onClick` is neither focusable nor
keyboard-operable. `role="status"` announces at the next pause (saved confirmations); `role="alert"`
interrupts (errors). Dialogs: `<dialog aria-modal="true" aria-labelledby>`. A custom dropdown with no
ARIA is unusable — take `<select>` or a proper listbox.

## Testing

`npx axe-core` or `npx pa11y`, then DevTools → Lighthouse and the Elements accessibility tree, then a real
screen reader — VoiceOver, NVDA, Orca.
