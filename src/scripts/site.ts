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
