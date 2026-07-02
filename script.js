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

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

// ==============================
// Typewriter loop — rotating roles
// ==============================
(function(){
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = ["AI/ML Engineer", "Full-Stack Developer", "Problem Solver"];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick(){
    const text = roles[roleIdx];
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