// Custom picker over a native <select>. The select stays in the form, so values,
// required and no-JS all keep working. Follows the ARIA select-only combobox pattern.
let n = 0;
export function enhance(sel: HTMLSelectElement) {
  const id = `pick${n++}`, kind = sel.dataset.pick || 'list';
  const name = sel.dataset.label || '';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pick'; btn.setAttribute('role', 'combobox');
  btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
  const pop = document.createElement('div');
  pop.id = id; pop.className = `pop ${kind}`; pop.setAttribute('role', 'listbox'); pop.setAttribute('aria-label', name); pop.popover = 'manual';
  const title = document.createElement('p'); title.className = 'pop-title'; title.textContent = name; title.setAttribute('aria-hidden', 'true'); pop.append(title);
  const opts: HTMLElement[] = []; const src: HTMLOptionElement[] = [];
  const add = (o: HTMLOptionElement, to: HTMLElement) => {
    if (!o.value) return;
    const e = document.createElement('div');
    e.id = `${id}-${opts.length}`; e.className = 'opt'; e.setAttribute('role', 'option');
    const b = document.createElement('b'); b.textContent = o.text; e.append(b);
    if (o.dataset.note) { const s = document.createElement('span'); s.textContent = o.dataset.note; e.append(s); }
    const i = opts.length; e.onclick = () => { choose(i); close(); }; e.onpointermove = ev => ev.pointerType === 'mouse' && mark(i);
    opts.push(e); src.push(o); to.append(e);
  };
  for (const c of [...sel.children]) {
    if (c instanceof HTMLOptGroupElement) {
      const g = document.createElement('div'); g.className = 'grp'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', c.label);
      const h = document.createElement('p'); h.textContent = c.label; h.setAttribute('aria-hidden', 'true'); g.append(h);
      const r = document.createElement('div'); r.className = 'row'; g.append(r); [...c.children].forEach(o => add(o as HTMLOptionElement, r)); pop.append(g);
    } else add(c as HTMLOptionElement, pop);
  }
  let cur = 0, typed = '', t = 0;
  const open = () => btn.getAttribute('aria-expanded') === 'true';
  const sync = () => {
    const o = sel.selectedOptions[0]; btn.textContent = o?.text || ''; btn.classList.toggle('empty', !sel.value);
    btn.setAttribute('aria-label', `${name}: ${o?.text || ''}`);
    src.forEach((s, i) => opts[i].setAttribute('aria-selected', String(s === o)));
  };
  const choose = (i: number) => { sel.value = src[i].value; sync(); btn.removeAttribute('aria-invalid'); sel.dispatchEvent(new Event('input', { bubbles: true })); };
  const mark = (i: number) => { cur = Math.max(0, Math.min(opts.length - 1, i)); opts.forEach((o, k) => o.classList.toggle('cur', k === cur)); btn.setAttribute('aria-activedescendant', opts[cur].id); };
  const place = () => {
    if (innerWidth <= 800) { pop.style.cssText = ''; return; }
    const r = btn.getBoundingClientRect(); pop.style.left = '0'; pop.style.top = '0';
    const h = pop.offsetHeight, w = pop.offsetWidth, below = innerHeight - r.bottom;
    const up = below < h + 16 && r.top > below;
    pop.style.left = `${Math.max(12, Math.min(r.left - 8, innerWidth - w - 12))}px`;
    pop.style.top = `${Math.max(8, up ? r.top - h - 10 : Math.min(r.bottom + 10, innerHeight - h - 8))}px`;
  };
  const show = () => { btn.focus({ preventScroll: true }); pop.showPopover(); btn.setAttribute('aria-expanded', 'true'); place(); mark(Math.max(0, src.indexOf(sel.selectedOptions[0]))); opts[cur].scrollIntoView({ block: 'nearest' }); };
  const close = (focus = true) => { if (!open()) return; pop.hidePopover(); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant'); if (focus) btn.focus(); };
  // Move to the nearest option in a direction, so grids feel like grids.
  const step = (dx: number, dy: number) => {
    const a = opts[cur].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = -1, score = Infinity;
    opts.forEach((o, i) => { const b = o.getBoundingClientRect(), x = b.left + b.width / 2 - ax, y = b.top + b.height / 2 - ay;
      const main = dx ? x * dx : y * dy, cross = Math.abs(dx ? y : x);
      if (main > 4 && main + cross * 3 < score) { score = main + cross * 3; best = i; } });
    if (best < 0) best = cur + (dx || dy); mark(best); opts[cur].scrollIntoView({ block: 'nearest' });
  };
  btn.onclick = () => open() ? close() : show();
  btn.onkeydown = e => {
    if (!open()) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(); return; } }
    else {
      const k = e.key; const d: Record<string, [number, number]> = { ArrowDown: [0, 1], ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (d[k]) { e.preventDefault(); step(...d[k]); }
      else if (k === 'Home') { e.preventDefault(); mark(0); } else if (k === 'End') { e.preventDefault(); mark(opts.length - 1); }
      else if (k === 'Enter' || (k === ' ' && !typed)) { e.preventDefault(); choose(cur); close(); return; }
      else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; } else if (k === 'Tab') { choose(cur); close(false); return; }
    }
    if (e.key.length === 1 && (e.key !== ' ' || typed) && !e.ctrlKey && !e.metaKey) {
      clearTimeout(t); typed += e.key.toLowerCase(); t = window.setTimeout(() => typed = '', 700);
      const i = src.findIndex(s => s.text.toLowerCase().startsWith(typed) || s.text.toLowerCase().replace('class ', '').startsWith(typed));
      if (i > -1) { if (!open()) show(); mark(i); opts[i].scrollIntoView({ block: 'nearest' }); }
    }
  };
  addEventListener('pointerdown', e => { if (open() && !pop.contains(e.target as Node) && !btn.contains(e.target as Node)) close(false); });
  addEventListener('scroll', e => { if (open() && innerWidth > 800 && !pop.contains(e.target as Node)) place(); }, { passive: true, capture: true });
  addEventListener('resize', () => open() && place());
  sel.addEventListener('sync', sync); sel.form?.addEventListener('reset', () => setTimeout(sync));
  sel.addEventListener('invalid', e => { e.preventDefault(); btn.setAttribute('aria-invalid', 'true'); if (sel.form?.querySelector(':invalid') === sel) btn.focus(); });
  sel.classList.add('picked'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
  sel.after(btn, pop); sync();
  // The wrapping label would forward clicks on options back to the button.
  sel.closest('label')?.addEventListener('click', e => { if (!btn.contains(e.target as Node)) { e.preventDefault(); if (!pop.contains(e.target as Node)) btn.focus(); } });
}
