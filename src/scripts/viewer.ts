// Opens at its final size straight away (the shape of every photo is known beforehand),
// with the thumbnail already in place, then sharpens. Swiping is the browser's own scrolling,
// so it stays smooth on any phone. The Back button closes it.
export interface Shot { el: HTMLElement; img: HTMLImageElement; full: string; w: number; h: number; t: string }
const d = document.querySelector<HTMLDialogElement>('.viewer')!;
const track = d.querySelector<HTMLElement>('.v-track')!, strip = d.querySelector<HTMLElement>('.v-strip')!;
const cap = d.querySelector('.v-cap b')!, num = d.querySelector('.v-cap span')!;
const calm = matchMedia('(prefers-reduced-motion:reduce)');
let shots: Shot[] = [], at = -1, closing = false, raf = 0;
const frame = (i: number) => track.children[i]?.firstElementChild as HTMLElement;
const thumb = (s: Shot) => s.img.naturalWidth ? s.img.currentSrc : '';

const load = (i: number) => {
  const b = frame(i)?.querySelector<HTMLImageElement>('.v-full'); if (!b || b.src) return Promise.resolve();
  b.src = shots[i].full;
  return b.decode().then(() => b.classList.add('on'), () => { if (b.naturalWidth) b.classList.add('on'); });
};
const settle = (i: number) => {
  if (i === at) return; at = i; cap.textContent = shots[i].t; num.textContent = shots.length > 1 ? `${i + 1} of ${shots.length}` : '';
  [...strip.children].forEach((c, k) => c.setAttribute('aria-current', String(k === i)));
  const s = strip.children[i] as HTMLElement; if (s) strip.scrollTo({ left: s.offsetLeft - strip.clientWidth / 2 + s.offsetWidth / 2, behavior: calm.matches ? 'instant' : 'smooth' });
  load(i).then(() => { if (at === i) { load(i + 1); load(i - 1); } });
};
const go = (i: number) => { const n = (i + shots.length) % shots.length; track.scrollTo({ left: n * track.clientWidth, behavior: calm.matches || Math.abs(n - at) > 1 ? 'instant' : 'smooth' }); };
const fly = (i: number, opening: boolean) => {
  const f = frame(i), a = shots[i].img.getBoundingClientRect(), b = f.getBoundingClientRect();
  const seen = a.width > 0 && a.bottom > 0 && a.top < innerHeight && a.right > 0 && a.left < innerWidth;
  if (calm.matches || !seen) return d.animate({ opacity: opening ? [0, 1] : [1, 0] }, { duration: calm.matches ? 0 : 180 }).finished;
  // Cover-fit the big frame over the thumbnail, clipped to the thumbnail's own box.
  const k = Math.max(a.width / b.width, a.height / b.height), x = a.left + a.width / 2 - b.left - b.width / 2, y = a.top + a.height / 2 - b.top - b.height / 2;
  const cx = (b.width - a.width / k) / 2, cy = (b.height - a.height / k) / 2;
  const from = { transform: `translate(${x}px,${y}px) scale(${k})`, clipPath: `inset(${cy}px ${cx}px round ${14 / k}px)` }, to = { transform: 'none', clipPath: 'inset(0 0 round 10px)' };
  d.animate({ backgroundColor: opening ? ['#1a0a0900', '#1a0a09'] : ['#1a0a09', '#1a0a0900'] }, { duration: 260 });
  return f.animate(opening ? [from, to] : [to, from], { duration: opening ? 380 : 280, easing: 'cubic-bezier(.2,.9,.2,1)' }).finished;
};

export function view(list: Shot[], i: number) {
  if (d.open) return; shots = list; at = -1; closing = false;
  track.replaceChildren(...list.map(s => {
    const f = document.createElement('figure'), box = document.createElement('div'); box.className = 'v-frame'; box.style.setProperty('--r', String(s.w / s.h)); box.style.background = s.img.style.background;
    const a = new Image(), b = new Image(); a.className = 'v-thumb'; b.className = 'v-full'; a.alt = ''; b.alt = s.t; b.decoding = 'async'; if (thumb(s)) a.src = thumb(s);
    box.append(a, b); f.append(box); return f;
  }));
  strip.replaceChildren(...(list.length > 1 ? list.map((s, k) => {
    const b = document.createElement('button'); b.setAttribute('aria-label', s.t); b.style.background = s.img.style.background;
    if (thumb(s)) { const m = new Image(); m.alt = ''; m.src = thumb(s); b.append(m); } b.onclick = () => go(k); return b;
  }) : []));
  d.classList.toggle('single', list.length < 2);
  const bar = innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden'; if (bar) document.documentElement.style.paddingRight = `${bar}px`;
  d.showModal(); track.scrollLeft = i * track.clientWidth; settle(i); d.querySelector<HTMLElement>('.v-close')!.focus({ preventScroll: true });
  history.pushState({ viewer: 1 }, ''); fly(i, true);
}
const shut = async () => {
  if (!d.open || closing) return; closing = true;
  d.classList.add('leaving'); try { await fly(at, false); } catch {}
  d.classList.remove('leaving'); d.close(); document.documentElement.style.overflow = document.documentElement.style.paddingRight = '';
  (shots[at]?.el)?.focus({ preventScroll: true }); track.replaceChildren(); strip.replaceChildren();
};
const ask = () => history.state?.viewer ? history.back() : shut();
addEventListener('popstate', shut);
d.addEventListener('cancel', e => { e.preventDefault(); ask(); });
d.querySelector<HTMLElement>('.v-close')!.onclick = ask;
d.querySelector<HTMLElement>('.v-prev')!.onclick = () => go(at - 1);
d.querySelector<HTMLElement>('.v-next')!.onclick = () => go(at + 1);
d.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key as 'ArrowRight']; if (k) { e.preventDefault(); go(at + k); } });
track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (d.open && !closing && track.clientWidth) settle(Math.max(0, Math.min(shots.length - 1, Math.round(track.scrollLeft / track.clientWidth)))); }); }, { passive: true });
track.addEventListener('click', e => { if (!(e.target as Element).closest('.v-frame')) ask(); });
addEventListener('resize', () => { if (d.open) track.scrollLeft = at * track.clientWidth; });
// Pull down to put the photo back
let y0 = 0, x0 = 0, dy = 0;
track.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; }, { passive: true });
track.addEventListener('touchmove', e => { if (e.touches.length > 1) return; const y = e.touches[0].clientY - y0; if (y > 12 && y > Math.abs(e.touches[0].clientX - x0) * 1.5) { dy = y; frame(at).style.translate = `0 ${y}px`; d.style.setProperty('--fade', String(Math.max(.35, 1 - y / 500))); } }, { passive: true });
track.addEventListener('touchend', () => { const f = frame(at); if (!f) return; d.style.removeProperty('--fade'); if (dy > 110) ask(); else if (dy) f.animate({ translate: [f.style.translate, '0 0'] }, { duration: 220, easing: 'ease-out' }); f.style.translate = ''; dy = 0; });
