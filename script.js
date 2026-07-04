// ==============================
// Custom cursor (desktop only)
// ==============================
(function(){
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

  function raf(){
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
// Mobile nav toggle
// ==============================
(function(){
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
(function(){
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
(function(){
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
      const dx = positions[i*3] - positions[j*3];
      const dy = positions[i*3+1] - positions[j*3+1];
      const dz = positions[i*3+2] - positions[j*3+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < maxDist) {
        linePositions.push(positions[i*3], positions[i*3+1], positions[i*3+2]);
        linePositions.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
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
  let mouseX = 0, mouseY = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
    mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
    targetRotY = mouseX * 0.08;
    targetRotX = mouseY * 0.05;
  });
  hero.addEventListener('mouseleave', () => { targetRotX = 0; targetRotY = 0; });

  function onResize(){
    w = hero.offsetWidth; h = hero.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function animate(){
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    points.rotation.y += (targetRotY - points.rotation.y) * 0.02 + 0.0002;
    points.rotation.x += (targetRotX - points.rotation.x) * 0.02;
    points.rotation.z = Math.sin(t * 0.03) * 0.02;
    lines.rotation.copy(points.rotation);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// ==============================
// Typewriter loop — rotating roles with color cycling
// ==============================
(function(){
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

  function tick(){
    const role = roles[roleIdx];
    const text = role.text;
    el.style.color = role.color;
    el.style.textShadow = `0 0 16px ${role.color}55`;
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
(function(){
  if (typeof gsap === 'undefined') return;

  gsap.set('.hero-greet', { y: 20 });
  gsap.set('.hero-sub', { y: 24 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.hero-greet', { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .to('.hero-sub',   { opacity: 1, y: 0, duration: 0.8 }, 0.4);
})();