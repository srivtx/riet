import { enhance } from './pick';
import { wa } from '../site';
document.querySelectorAll<HTMLSelectElement>('select[data-pick]').forEach(enhance);

// Menu
const b = document.querySelector<HTMLButtonElement>('.burger')!;
const set = (o: boolean) => { b.setAttribute('aria-expanded', String(o)); document.body.classList.toggle('open', o); b.textContent = o ? 'Close' : 'Menu'; };
b.onclick = () => set(b.getAttribute('aria-expanded') !== 'true');
addEventListener('keydown', e => e.key === 'Escape' && set(false));

// The one-sentence enquiry
document.querySelectorAll<HTMLFormElement>('[data-ask]').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault(); const d = new FormData(f);
  window.open(wa(`Hello RIET. My child is joining ${d.get('grade')} and we live near ${d.get('campus')}. We would like ${d.get('mode')}. Please share admission details.`), '_blank', 'noopener');
}));

// Is the office open, in India time (Mon to Sat, 9 to 5)
const ist = new Date(Date.now() + 5.5 * 36e5), day = ist.getUTCDay(), hr = ist.getUTCHours() + ist.getUTCMinutes() / 60;
const isOpen = day > 0 && hr >= 9 && hr < 17;
const next = day > 0 && hr < 9 ? 'today' : day === 6 ? 'Monday' : 'tomorrow';
document.querySelectorAll('[data-open]').forEach(e => { e.textContent = isOpen ? 'Office hours now, until 5 pm' : `Office opens ${next} at 9 am. WhatsApp us any time.`; e.classList.toggle('yes', isOpen); });

// Rays lean gently towards the pointer
if (matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches)
  document.querySelector('.hero')?.addEventListener('pointermove', e => (e.currentTarget as HTMLElement).style.setProperty('--lean', String(((e as PointerEvent).clientX / innerWidth - .5) * 2)));

// Send to family: the phone's share sheet, or WhatsApp
document.querySelectorAll<HTMLAnchorElement>('[data-share]').forEach(a => a.addEventListener('click', e => {
  if (navigator.share && matchMedia('(pointer:coarse)').matches) { e.preventDefault(); navigator.share({ text: a.dataset.share }).catch(() => {}); }
}));

// Films play here instead of sending people away
const dlg = document.querySelector<HTMLDialogElement>('.film');
document.querySelectorAll<HTMLAnchorElement>('[data-film]').forEach(a => a.addEventListener('click', e => {
  if (!dlg || e.metaKey || e.ctrlKey) return; e.preventDefault();
  const f = document.createElement('iframe'); f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.film}?autoplay=1&rel=0`; f.title = a.dataset.title!; f.allow = 'autoplay; fullscreen; encrypted-media';
  dlg.querySelector('.frame')!.replaceChildren(f); dlg.querySelector('a')!.href = a.href; dlg.showModal();
}));
dlg?.addEventListener('click', e => { if (e.target === dlg || (e.target as Element).tagName === 'BUTTON') dlg.close(); });
dlg?.addEventListener('close', () => dlg.querySelector('.frame')!.replaceChildren());

// Nearest campus. The location never leaves the device.
document.querySelectorAll<HTMLButtonElement>('[data-near]').forEach(btn => btn.onclick = () => {
  const out = btn.parentElement!.querySelector('output')!, cards = [...document.querySelectorAll<HTMLElement>('[data-lat]')];
  if (!navigator.geolocation) { out.textContent = 'Your browser cannot share a location. Call us and we will guide you.'; return; }
  out.textContent = 'Looking…';
  navigator.geolocation.getCurrentPosition(p => {
    const R = Math.PI / 180, { latitude: a, longitude: o } = p.coords;
    const km = cards.map(c => { const x = +c.dataset.lat!, y = +c.dataset.lng!; const h = Math.sin((x - a) * R / 2) ** 2 + Math.cos(a * R) * Math.cos(x * R) * Math.sin((y - o) * R / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); });
    const i = km.indexOf(Math.min(...km)); cards.forEach((c, k) => c.classList.toggle('nearest', k === i));
    out.textContent = `${cards[i].dataset.name} is nearest, about ${km[i] < 1 ? 'a kilometre' : Math.round(km[i]) + ' km'} in a straight line.`;
  }, () => { out.textContent = 'We could not read your location. Call us and we will guide you.'; }, { timeout: 9000 });
});

// Images look after themselves.
// 1. A failed photo is retried; if a new version of the site went live meanwhile, its new address is looked up.
const net = (navigator as any).connection, slow = net?.saveData || /2g/.test(net?.effectiveType || '');
let fresh: Promise<Document> | undefined;
const tries = new WeakMap<HTMLImageElement, number>();
const order = [...document.images];
const heal = (i: HTMLImageElement) => {
  const n = (tries.get(i) ?? 0) + 1; tries.set(i, n); if (n > 4) return;
  setTimeout(async () => {
    const swap = (from: HTMLImageElement) => {
      const a = i.parentElement?.querySelectorAll('source'), b = from.parentElement?.querySelectorAll('source');
      if (a && b && a.length === b.length) a.forEach((s, k) => { s.srcset = b[k].srcset; });
      if (from.srcset) i.srcset = from.srcset; i.src = from.getAttribute('src')!;
    };
    if (n === 1) { const u = i.src; i.src = ''; i.src = u; return; }
    try {
      fresh ??= fetch(location.pathname, { cache: 'reload' }).then(r => { if (!r.ok) throw r; return r.text(); }).then(h => new DOMParser().parseFromString(h, 'text/html'));
      const same = [...(await fresh).images][order.indexOf(i)]; if (same && same.alt === i.alt) swap(same);
    } catch { fresh = undefined; }
  }, [600, 1500, 4000, 9000][n - 1]);
};
document.addEventListener('error', e => { const t = e.target; if (t instanceof HTMLImageElement && order.includes(t)) heal(t); }, true);
order.forEach(i => { if (i.complete && !i.naturalWidth && i.currentSrc) heal(i); });
addEventListener('online', () => order.forEach(i => { if (i.complete && !i.naturalWidth) { tries.delete(i); heal(i); } }));
// 2. Once the page is ready, the rest load quietly two at a time, so they are there before you scroll to them.
if (!slow) addEventListener('load', () => {
  const rest = order.filter(i => i.loading === 'lazy' && !i.complete);
  const next = () => { const i = rest.shift(); if (!i) return; if (i.complete) return next(); const go = () => { clearTimeout(t); next(); }; const t = setTimeout(go, 8000); i.addEventListener('load', go, { once: true }); i.addEventListener('error', go, { once: true }); i.loading = 'eager'; };
  const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 400)); idle(() => { next(); next(); });
});
