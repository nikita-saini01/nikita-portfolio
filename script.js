// ==============================
// Hero — cursor parallax movement (all directions, desktop only)
// ==============================
(function () {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  const bold = document.querySelector('.hero-bold');
  if (!hero || !bold) return;

  // Full-range movement: the text drifts toward/away from the cursor in
  // whichever direction it moves — left/right, up/down, and diagonals —
  // not just a rotation like the particle field below.
  const RANGE_X = 28;
  const RANGE_Y = 20;
  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;  // -0.5..0.5
    targetX = px * RANGE_X * 2;
    targetY = py * RANGE_Y * 2;
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function raf() {
    curX += (targetX - curX) * 0.07;
    curY += (targetY - curY) * 0.07;
    bold.style.setProperty('--hx', curX.toFixed(2) + 'px');
    bold.style.setProperty('--hy', curY.toFixed(2) + 'px');
    requestAnimationFrame(raf);
  }
  raf();
})();

// ==============================
// Custom cursor (desktop only)
// ==============================
(function () {
  if (window.matchMedia('(max-width: 760px)').matches) return;
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let active = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    if (!active) {
      dot.classList.add('active');
      ring.classList.add('active');
      active = true;
    }
  });
  document.addEventListener('mouseleave', () => {
    dot.classList.remove('active');
    ring.classList.remove('active');
    active = false;
  });

  function raf() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  document.querySelectorAll('a, button, .scroll-hint').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
})();

// ==============================
// Scroll hint — click to jump to About
// ==============================
(function () {
  const hint = document.querySelector('.scroll-hint');
  const about = document.getElementById('about');
  if (!hint || !about) return;

  hint.addEventListener('click', () => {
    about.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// ==============================
// Mobile nav toggle
// ==============================
(function () {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

// ==============================
// Magnetic buttons + cursor spotlight
// ==============================
(function () {
  if (window.matchMedia('(max-width: 760px)').matches) return;

  // Cursor spotlight glow
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let glowActive = false;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!glowActive) { glow.classList.add('active'); glowActive = true; }
  });
  document.addEventListener('mouseleave', () => { glow.classList.remove('active'); glowActive = false; });

  // Magnetic pull on buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

// ==============================
// Three.js — sparkling 3D particle field
// ==============================
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = canvas.parentElement;
  let w = hero.offsetWidth, h = hero.offsetHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const PARTICLE_COUNT = window.innerWidth < 800 ? 150 : 280;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    sizes[i] = Math.random() * 1.1 + 0.4;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vAlpha = 0.12 + 0.35 * pow(abs(sin(uTime * aSpeed + aPhase)), 2.0);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (40.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, d);
        vec3 col = vec3(0.92, 0.94, 1.0);
        gl_FragColor = vec4(col, vAlpha * glow);
      }
    `
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ---- Neural-network connecting lines between nearby particles ----
  const linePositions = [];
  const maxDist = 2.1;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < maxDist) {
        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x9fb4ff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  let targetRotX = 0, targetRotY = 0;
  let targetCamX = 0, targetCamY = 0;
  let mouseX = 0, mouseY = 0;
  let moveBoost = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
    mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
    // Rotation (as before, slightly stronger) plus an actual camera
    // position shift, so the field visibly drifts left/right/up/down
    // with the cursor instead of only tilting in place.
    targetRotY = mouseX * 0.14;
    targetRotX = mouseY * 0.09;
    targetCamX = -mouseX * 1.4;
    targetCamY = mouseY * 1.0;
    moveBoost = 1;
  });
  hero.addEventListener('mouseleave', () => { targetRotX = 0; targetRotY = 0; targetCamX = 0; targetCamY = 0; });

  function onResize() {
    w = hero.offsetWidth; h = hero.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    const speed = 1 + moveBoost * 2.5;
    points.rotation.y += (targetRotY - points.rotation.y) * 0.02 + 0.0012 * speed;
    points.rotation.x += (targetRotX - points.rotation.x) * 0.02 + Math.sin(t * 0.08) * 0.00015 * speed;
    points.rotation.z = Math.sin(t * 0.03) * 0.02;
    lines.rotation.copy(points.rotation);
    camera.position.x += (targetCamX - camera.position.x) * 0.04;
    camera.position.y += (targetCamY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    moveBoost *= 0.97;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// ==============================
// Typewriter loop — rotating roles with color cycling
// ==============================
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    { text: "AI/ML Engineer", color: "#d9b98c" },
    { text: "Full-Stack Developer", color: "#9ec3d9" },
    { text: "Problem Solver", color: "#c9a3d9" }
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const role = roles[roleIdx];
    const text = role.text;
    el.style.color = role.color;
    el.style.textShadow = `0 0 20px ${role.color}77`;
    if (!deleting) {
      charIdx++;
      el.textContent = text.slice(0, charIdx);
      if (charIdx === text.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
      setTimeout(tick, 85);
    } else {
      charIdx--;
      el.textContent = text.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 40);
    }
  }
  tick();
})();

// ==============================
// GSAP — hero entrance timeline
// ==============================
(function () {
  if (typeof gsap === 'undefined') return;

  gsap.set('.hero-greet', { y: 20 });
  gsap.set('.hero-lead', { y: 20 });
  gsap.set('.hero-sub', { y: 20 });
  gsap.set('.hero-cta', { y: 20 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.hero-greet', { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .to('.hero-lead', { opacity: 1, y: 0, duration: 0.7 }, 0.35)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7 }, 0.6)
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.7 }, 0.9);
})();

// ==============================
// GSAP — About section entrance + float trigger
// ==============================
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Set initial hidden states
  gsap.set('#aboutHeading', { y: 30, opacity: 0 });
  gsap.set('.about-bio', { y: 24, opacity: 0 });
  // Animate the inner photo element (#aboutPhoto), not the outer
  // #aboutPhotoWrap — that wrapper's `transform` is driven every frame
  // by the cursor-tilt CSS variables, and GSAP writes directly to the
  // inline transform style, so animating it here would silently
  // overwrite the tilt effect once this timeline completes.
  gsap.set('#aboutPhoto', { scale: 0.85, opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about',
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });

  // Order matters here: heading first, then paragraph, then the photo
  // scales/fades in last — a deliberate reveal sequence rather than
  // everything arriving at once.
  tl.to('#aboutHeading', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
    .to('.about-bio', { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.45')
    .to('#aboutPhoto', {
      scale: 1,
      opacity: 1,
      duration: 0.9,
      ease: 'back.out(1.4)',
      onComplete: () => {
        // Smoothly activate gravity float animations on settle
        const card = document.querySelector('.about-card');
        const photo = document.querySelector('.photo-float-wrapper');
        if (card) card.classList.add('float-active');
        if (photo) photo.classList.add('float-active');
      }
    }, '-=0.35');
})();

// ==============================
// About section — cursor tilt, parallax & spotlight (desktop only)
// ==============================
(function () {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const section = document.getElementById('about');
  const card = document.getElementById('aboutCard');
  const photoWrap = document.getElementById('aboutPhotoWrap');
  if (!section || !card) return;

  // On desktop this script owns `transform` on both elements every frame,
  // so the CSS keyframe float (.float-active) is turned off here to avoid
  // the two fighting over the same property — a gentle idle sine-wave
  // float is baked into the rAF loop below instead, so the "floating"
  // feel is preserved without any conflict. Mobile never reaches this
  // script, so it keeps the plain CSS float animation as its ambient motion.
  card.classList.remove('float-active');
  if (photoWrap) photoWrap.classList.remove('float-active');

  // Targets updated on mousemove, smoothed toward on every frame — this
  // keeps the tilt buttery instead of snapping straight to the cursor.
  let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
  let targetPX = 0, targetPY = 0, curPX = 0, curPY = 0; // photo parallax offset
  let targetPRX = 0, targetPRY = 0, curPRX = 0, curPRY = 0; // photo own tilt
  let mx = 50, my = 50, curMX = 50, curMY = 50;
  let active = false;

  section.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;  // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1

    // Card tilt: stronger, clearly noticeable
    targetRY = (px - 0.5) * 16;
    targetRX = -(py - 0.5) * 16;

    // Photo parallax: moves more than the card for a clear sense of depth
    targetPX = (px - 0.5) * 46;
    targetPY = (py - 0.5) * 32;
    targetPRY = (px - 0.5) * 22;
    targetPRX = -(py - 0.5) * 22;

    mx = px * 100;
    my = py * 100;
    if (!active) {
      active = true;
      card.classList.add('tilting');
    }
  });

  section.addEventListener('mouseleave', () => {
    targetRX = 0; targetRY = 0;
    targetPX = 0; targetPY = 0;
    targetPRX = 0; targetPRY = 0;
    mx = 50; my = 50;
    active = false;
    card.classList.remove('tilting');
  });

  function raf() {
    const t = performance.now() / 1000;
    // Gentle idle drift — small enough to read as "floating", not motion
    // sickness, and additive so it rides along with the cursor tilt.
    const idleY = Math.sin(t * 0.5) * 5;
    const idleRX = Math.sin(t * 0.4) * 0.6;

    curRX += (targetRX - curRX) * 0.08;
    curRY += (targetRY - curRY) * 0.08;
    curPX += (targetPX - curPX) * 0.08;
    curPY += (targetPY - curPY) * 0.08;
    curPRX += (targetPRX - curPRX) * 0.08;
    curPRY += (targetPRY - curPRY) * 0.08;
    curMX += (mx - curMX) * 0.12;
    curMY += (my - curMY) * 0.12;

    card.style.setProperty('--rx', (curRX + idleRX).toFixed(2) + 'deg');
    card.style.setProperty('--ry', curRY.toFixed(2) + 'deg');
    card.style.setProperty('--mx', curMX.toFixed(2) + '%');
    card.style.setProperty('--my', curMY.toFixed(2) + '%');

    if (photoWrap) {
      photoWrap.style.setProperty('--px', curPX.toFixed(2) + 'px');
      photoWrap.style.setProperty('--py', (curPY + idleY).toFixed(2) + 'px');
      photoWrap.style.setProperty('--prx', curPRX.toFixed(2) + 'deg');
      photoWrap.style.setProperty('--pry', curPRY.toFixed(2) + 'deg');
    }

    requestAnimationFrame(raf);
  }
  raf();
})();

// ==============================
// About section — ambient light particles
// ==============================
(function () {
  const field = document.getElementById('aboutParticles');
  if (!field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COUNT = window.innerWidth < 760 ? 8 : 16;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'about-particle';
    const startX = Math.random() * 100;
    const startY = 60 + Math.random() * 40;
    const drift = (Math.random() - 0.5) * 80;
    const duration = 14 + Math.random() * 12;
    const delay = Math.random() * -20;

    p.style.left = startX + '%';
    p.style.top = startY + '%';
    p.style.setProperty('--pdx', drift.toFixed(1) + 'px');
    p.style.setProperty('--pdy', -(220 + Math.random() * 160).toFixed(1) + 'px');
    p.style.animationDuration = duration.toFixed(1) + 's';
    p.style.animationDelay = delay.toFixed(1) + 's';
    field.appendChild(p);
  }
})();



// ==============================
// GSAP — Scroll Snap Proximity Helper
// ==============================
// This registers ScrollTrigger to toggle proximity snapping on html for longer sections 
// (e.g. pages that go beyond 100vh like project grids, preventing trapping).
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const relaxedSections = document.querySelectorAll('.snap-section-proximity');
  relaxedSections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => document.documentElement.classList.add('snap-proximity'),
      onLeave: () => document.documentElement.classList.remove('snap-proximity'),
      onEnterBack: () => document.documentElement.classList.add('snap-proximity'),
      onLeaveBack: () => document.documentElement.classList.remove('snap-proximity')
    });
  });
})();