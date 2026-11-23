// A calm ending: say what happens next, and what to do if WhatsApp did not open.
export function sent() {
  const p = document.querySelector<HTMLElement>('.sent')!; if (!p.matches(':popover-open')) p.showPopover();
}
