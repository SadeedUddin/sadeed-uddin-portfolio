// Main site script for index.html (runs at the end of <body>). Sections follow the page order.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// smooth scroll (Lenis, self-hosted); falls back to native scrolling if it fails to load
const lenis = !reduced && window.Lenis ? new Lenis({ lerp: 0.09 }) : null;

// loading screen: minimal handwriting of the logo (animated webp, plays once), then lift (9s / error fallback)
const loader = document.getElementById('loader'), ldAnim = loader.querySelector('.ld-anim');
function endLoad() {
  if (loader.classList.contains('done')) return;
  loader.classList.add('done');
  document.documentElement.classList.remove('loading');
  lenis?.start();
  setTimeout(() => loader.remove(), 1300);
}
if (reduced) endLoad();
else {
  lenis?.stop();
  // the webp holds its last frame once "sd" is written (1.64s); then wipe in the final stroke
  const write = () => setTimeout(() => { loader.querySelector('.ld-swash').classList.add('draw'); setTimeout(endLoad, 1400); }, 1640);
  ldAnim.complete && ldAnim.naturalWidth ? write() : ldAnim.addEventListener('load', write, { once: true });
  ldAnim.addEventListener('error', endLoad);
  setTimeout(endLoad, 9000);
}

// menu + anchor links
const burger = document.querySelector('.burger');
const setMenu = open => { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); };
burger.onclick = () => setMenu(!document.body.classList.contains('menu-open'));
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  setMenu(false);
  if (t.id === 'content') t.focus({ preventScroll: true });
  lenis ? lenis.scrollTo(t, { offset: 0 }) : t.scrollIntoView({ behavior: 'smooth' });
}));

// line + fade reveals
document.querySelectorAll('.lines').forEach(el => el.querySelectorAll('.l').forEach((l, i) => l.style.setProperty('--i', i)));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.classList.contains('stats')) countUp(e.target);
  io.unobserve(e.target);
}), { threshold: .2 });
document.querySelectorAll('.lines, .fade').forEach(el => io.observe(el));

function countUp(box) {
  box.querySelectorAll('[data-count]').forEach(b => {
    const to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now();
    const tick = now => {
      const k = reduced ? 1 : clamp((now - t0) / 1600);
      b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US') + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// about: split into words so they can light up one by one
const about = document.querySelector('[data-words]');
about.innerHTML = about.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
const words = about.querySelectorAll('.w');

// projects: section height = horizontal distance to travel + one screen
const projSec = document.querySelector('.projects'), track = projSec.querySelector('.track'), projNow = document.getElementById('projNow');
const cards = track.querySelectorAll('.card');
document.getElementById('projAll').textContent = String(cards.length).padStart(2, '0');
// desktop: continuous sideways scroll. mobile: one card per scroll step (70vh each), snapping into place
const mobile = matchMedia('(max-width: 900px)');
let shown = -1;
function sizeProjects() {
  shown = -1;
  if (mobile.matches) { projSec.style.height = (cards.length * innerHeight * 0.7 + innerHeight) + 'px'; return; }
  track.style.transform = '';
  const dist = Math.max(0, track.scrollWidth - innerWidth);
  projSec.style.setProperty('--dist', dist + 'px');
  projSec.style.height = (dist + innerHeight * 1.2) + 'px';
}
addEventListener('resize', sizeProjects);
addEventListener('load', sizeProjects);
sizeProjects();

const quotes = document.querySelectorAll('.quote');
document.querySelector('.dots').innerHTML = '<i></i>'.repeat(quotes.length);
const dots = document.querySelectorAll('.dots i');
const pins = [...document.querySelectorAll('[data-pin]')];

// one loop: drive Lenis, then set --p (0..1) on every pinned section
function frame(t) {
  lenis?.raf(t);
  for (const el of pins) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -100 || r.top > innerHeight + 100) continue;
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    el.style.setProperty('--p', p.toFixed(4));
    if (el.id === 'about') { const n = Math.floor(p * 1.15 * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); }
    if (el.id === 'projects') {
      const k = Math.min(cards.length - 1, Math.floor(p * cards.length));
      projNow.textContent = String(k + 1).padStart(2, '0');
      if (mobile.matches && k !== shown) { shown = k; track.style.transform = `translateX(${-(cards[k].offsetLeft - cards[0].offsetLeft)}px)`; }
    }
    if (el.id === 'testimonials') { const k = Math.min(quotes.length - 1, Math.floor(p * quotes.length)); quotes.forEach((q, i) => q.classList.toggle('on', i === k)); dots.forEach((d, i) => d.classList.toggle('on', i === k)); }
  }
  updateDial();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// details popup (island): click a project or marketing card to open it
const drawer = document.getElementById('drawer'), drawerBody = drawer.querySelector('.drawer-body'), drawerClose = drawer.querySelector('.drawer-close');
let lastFocus = null;
function openDetails(card) {
  const ld = document.getElementById('loader');
  if (ld && !ld.classList.contains('done')) return;
  lastFocus = document.activeElement;
  drawerBody.innerHTML = card.querySelector('template.details').innerHTML;
  drawer.querySelector('.drawer-panel').scrollTop = 0;
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('drawer-open'); lenis?.stop();
  drawerClose.focus({ preventScroll: true });
}
function closeDetails() {
  if (!drawer.classList.contains('open')) return;
  drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('drawer-open'); lenis?.start();
  lastFocus?.focus({ preventScroll: true });
}
document.querySelectorAll('.card').forEach(card => {
  card.tabIndex = 0; card.setAttribute('role', 'button');
  card.addEventListener('click', () => openDetails(card));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(card); } });
});
drawerClose.addEventListener('click', closeDetails);
drawer.querySelector('.drawer-backdrop').addEventListener('click', closeDetails);
addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDetails(); setMenu(false); }
  // keep Tab inside the open popup
  if (e.key !== 'Tab' || !drawer.classList.contains('open')) return;
  const f = drawer.querySelectorAll('a[href], button'), first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
});
// moving logos can be paused (WCAG 2.2.2)
const mq = document.querySelector('.marquee'), mqBtn = document.querySelector('.mq-toggle');
mqBtn.addEventListener('click', () => { const p = mq.classList.toggle('paused'); mqBtn.setAttribute('aria-pressed', p); mqBtn.textContent = p ? 'Play logos' : 'Pause logos'; });

// section dial: v = position in sections (0 = intro ... 6 = contact)
const dial = document.querySelector('.zoom-dial'), ring = dial.querySelector('.zd-ring'), dialVal = dial.querySelector('.zd-value b'), dialName = dial.querySelector('.zd-value span');
const dialSecs = [['#top', 'Intro'], ['#about', 'About'], ['#projects', 'Projects'], ['#marketing', 'Marketing'], ['#accomplishments', 'Work'], ['#trusted', 'Clients'], ['#testimonials', 'Reviews'], ['#contact', 'Contact']]
  .map(([sel, name]) => ({ el: document.querySelector(sel), name }));
const TICKS = 8, SPACING = 100; // minor ticks per section, px of arc between sections
const DIAL_H = 62; // visible height of the arc band (dial height 92 minus the 30px above the arc)
let dialBtns = [];
function buildDial() {
  // radius chosen so the arc runs exactly into both bottom corners of the screen
  const w = innerWidth, r = (w * w / 4 + DIAL_H * DIAL_H) / (2 * DIAL_H), step = SPACING / r * 180 / Math.PI;
  const pad = Math.ceil(w / 2 / SPACING) + 1; // extra decorative ticks so the ends of the scale are never blank
  dial.style.setProperty('--r', r + 'px'); dial.style.setProperty('--step', step + 'deg');
  let ticks = '';
  for (let k = -pad * TICKS; k <= (dialSecs.length - 1 + pad) * TICKS; k++) {
    const inRange = k >= 0 && k <= (dialSecs.length - 1) * TICKS;
    ticks += `<i class="${k % TICKS ? '' : 'major'}${inRange ? '' : ' faint'}" style="--a:${k * step / TICKS}deg"></i>`;
  }
  ring.innerHTML = ticks + dialSecs.map((d, i) => `<button type="button" tabindex="-1" style="--a:${i * step}deg" data-i="${i}">${String(i + 1).padStart(2, '0')}<small>${d.name}</small></button>`).join('');
  dialBtns = ring.querySelectorAll('button'); lastShown = -1;
}
const tops = () => dialSecs.map(d => d.el.getBoundingClientRect().top + scrollY);
function vFromScroll() {
  const t = tops(), y = scrollY;
  for (let i = t.length - 2; i >= 0; i--) if (y >= t[i]) return Math.min(t.length - 1, i + (y - t[i]) / Math.max(1, t[i + 1] - t[i]));
  return 0;
}
function scrollFromV(v) {
  const t = tops(), i = Math.max(0, Math.min(t.length - 2, Math.floor(v))), f = Math.max(0, Math.min(1, v - i));
  return t[i] + f * (t[i + 1] - t[i]);
}
const goTo = (y, instant) => lenis ? lenis.scrollTo(y, instant ? { immediate: true, force: true } : { duration: 1.1, force: true }) : scrollTo({ top: y, behavior: instant ? 'auto' : 'smooth' });
// click sound + vibration as the dial moves. Audio can only start after a tap (browser rule), and
// vibration follows the phone's own settings (Android; iOS Safari has no vibration API and mutes audio on silent)
let actx = null, lastTickAt = 0, lastTickIdx = null;
const unlockAudio = () => {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; } }
  if (actx.state === 'suspended') actx.resume();
};
addEventListener('pointerdown', unlockAudio, { passive: true });
addEventListener('touchend', unlockAudio, { passive: true });
function haptic(strong) {
  const now = performance.now();
  if (now - lastTickAt < 35) return; // cap the rate on fast drags
  lastTickAt = now;
  if (!strong && actx && actx.state === 'running') { // section changes vibrate only, no sound
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = 'square'; o.frequency.value = 2600;
    g.gain.setValueAtTime(.025, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + .015);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .04);
  }
  try { navigator.vibrate?.(strong ? 12 : 5); } catch {}
}
let dragV = null, lastShown = -1, shownV = 0;
buildDial();
addEventListener('resize', buildDial);
function updateDial() {
  if (!mobile.matches) return; // phones only
  // ease the dial toward its target every frame so it glides instead of stepping
  const target = dragV ?? vFromScroll();
  shownV += (target - shownV) * 0.14;
  if (Math.abs(target - shownV) < 0.0005) shownV = target;
  const v = shownV, k = Math.round(v);
  dial.style.setProperty('--v', v.toFixed(3));
  dialVal.textContent = String(k + 1).padStart(2, '0') + ' / ' + String(dialSecs.length).padStart(2, '0');
  // light tick for every mark passed while dragging, stronger one on each new section
  const tk = Math.round(v * TICKS);
  if (dragV !== null && lastTickIdx !== null && tk !== lastTickIdx && k === lastShown) haptic(false);
  lastTickIdx = tk;
  if (k !== lastShown) { if (lastShown !== -1) haptic(true); lastShown = k; dialBtns.forEach((b, i) => b.classList.toggle('on', i === k)); dialName.textContent = dialSecs[k].name; }
  // hide once the footer curtain is showing
  dial.classList.toggle('away', document.querySelector('main').getBoundingClientRect().bottom < innerHeight - 40);
}
// drag like the camera zoom: 1 section per ~2/5 of the arc length of 24deg
let startX = 0, startV = 0, moved = false, downBtn = null;
dial.addEventListener('pointerdown', e => {
  startX = e.clientX; startV = vFromScroll(); dragV = startV; moved = false; downBtn = e.target.closest('button');
  dial.setPointerCapture(e.pointerId); dial.classList.add('drag');
});
dial.addEventListener('pointermove', e => {
  if (dragV === null) return;
  const d = e.clientX - startX;
  if (Math.abs(d) > 4) moved = true;
  dragV = Math.max(0, Math.min(dialSecs.length - 1, startV - d / SPACING));
  goTo(scrollFromV(dragV), true);
});
const endDrag = e => {
  if (dragV === null) return;
  const target = moved ? Math.round(dragV) : null;
  dragV = null; dial.classList.remove('drag');
  if (target !== null) goTo(scrollFromV(target));
  else if (downBtn) goTo(scrollFromV(+downBtn.dataset.i));
};
dial.addEventListener('pointerup', endDrag);
dial.addEventListener('pointercancel', endDrag);

// contact form -> FormSubmit emails every submission to the inbox below.
// First submission ever sends an activation email to that inbox; click it once and messages start arriving.
const INBOX = 'sadeeduddin11@outlook.com';
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, btn = f.querySelector('.send-btn'), status = f.querySelector('.form-status');
  const v = n => f.elements[n].value.trim().replace(/[<>]/g, ''); // plain text only: no HTML reaches the email
  if (v('_honey')) return; // bots fill the hidden field
  btn.disabled = true; btn.textContent = 'Sending…'; status.textContent = '';
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${INBOX}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New project enquiry from ${v('name')}`,
        _template: 'table', _captcha: 'false', _replyto: v('email'),
        Name: v('name'), Email: v('email'), Phone: v('phone') || '-', Description: v('description'),
        Consent: `Agreed to Privacy Policy on ${new Date().toISOString()}`, // record of consent
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === 'false' || data.success === false) throw new Error(data.message || res.status);
    f.reset();
    status.textContent = 'Thanks! Your message has been sent — I’ll reply as soon as I can.';
  } catch (err) {
    // service unreachable: fall back to the visitor's own email app so the message isn't lost
    const body = `Name: ${v('name')}\nEmail: ${v('email')}\nPhone: ${v('phone') || '-'}\n\n${v('description')}`;
    location.href = `mailto:${INBOX}?subject=${encodeURIComponent('Project enquiry from ' + v('name'))}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Couldn’t send directly — opening your email app instead.';
  } finally {
    btn.disabled = false; btn.textContent = 'Send message →';
  }
});

document.getElementById('yr').textContent = new Date().getFullYear();
