/* =========================================================
   JQ Portfolio - script.js
   Every block below is explained so you can learn from it.
   ========================================================= */

/* 1. TYPING EFFECT in the hero ------------------------------
   Types a word, waits, deletes it, then moves to the next. */
const words = ['ideas into real websites', 'clean websites from scratch', 'websites made for you', 'ideas that pop'];
const typedEl = document.getElementById('typed');
let wordIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = words[wordIndex];
  typedEl.textContent = word.substring(0, charIndex);

  if (!deleting && charIndex < word.length) { charIndex++; setTimeout(type, 90); }
  else if (!deleting) { deleting = true; setTimeout(type, 1400); }           // pause when finished
  else if (charIndex > 0) { charIndex--; setTimeout(type, 45); }
  else { deleting = false; wordIndex = (wordIndex + 1) % words.length; setTimeout(type, 300); }
}
setTimeout(type, 1800); // start after the hero animation

/* 2. SCROLL: progress bar + nav shadow ----------------------- */
const progress = document.getElementById('progress');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (scrolled / total) * 100 + '%';   // how far down the page we are
  nav.classList.toggle('scrolled', scrolled > 40);          // add/remove the "scrolled" class
});

/* 3. REVEAL ON SCROLL ----------------------------------------
   IntersectionObserver tells us when an element enters the screen. */
function animateCounter(el) {
  const target = +el.dataset.count;      // reads data-count="12"
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 50));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('show');                                   // fade + slide in
    const fill = el.querySelector('.fill');                     // skill bar inside?
    if (fill) fill.style.width = fill.dataset.level + '%';
    const counter = el.querySelector('[data-count]');           // number inside?
    if (counter) animateCounter(counter);
    observer.unobserve(el);                                     // only animate once
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* 4. HIGHLIGHT the current section in the menu --------------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.links a:not(.btn)');

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });
sections.forEach((s) => spy.observe(s));

/* 5. CUSTOM CURSOR -------------------------------------------- */
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', (e) => {
  cursor.style.opacity = 1;
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .card, .chips span').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

/* 6. 3D TILT on project cards ---------------------------------
   Sets CSS variables (--rx, --ry) that style.css turns into a tilt. */
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const box = card.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;    // -0.5 to 0.5
    const y = (e.clientY - box.top) / box.height - 0.5;
    card.style.setProperty('--ry', x * 10 + 'deg');
    card.style.setProperty('--rx', y * -10 + 'deg');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

/* 7. MOBILE MENU ---------------------------------------------- */
const burger = document.getElementById('burger');
const links = document.getElementById('links');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  burger.classList.remove('open');
  links.classList.remove('open');
}));

/* 8. CONTACT FORM CHECK ---------------------------------------
   This checks the fields. To really receive messages you need a
   form service (like Formspree) or a backend - the email link
   above works in the meantime. */
const form = document.getElementById('form');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();                                   // stop the page reloading
  const fields = [document.getElementById('fname'), document.getElementById('femail'), document.getElementById('fmsg')];
  fields.forEach((f) => f.classList.remove('invalid'));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[1].value);
  if (!fields[0].value.trim()) { fields[0].classList.add('invalid'); formMsg.textContent = 'Please enter your name.'; return; }
  if (!emailOk) { fields[1].classList.add('invalid'); formMsg.textContent = 'Please enter a valid email.'; return; }
  if (fields[2].value.trim().length < 10) { fields[2].classList.add('invalid'); formMsg.textContent = 'Please write a longer message.'; return; }

  formMsg.textContent = 'Thanks! Your message is ready to send.';
  form.reset();
});

/* 9. FOOTER YEAR ---------------------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();