// ===== Falling petals / hearts =====
const petalsBox = document.getElementById("petals");
const petalChars = ["🌸", "💗", "💕", "🌷", "💖", "🎀"];

function spawnPetal() {
  const p = document.createElement("span");
  p.className = "petal";
  p.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
  p.style.left = Math.random() * 100 + "vw";
  p.style.fontSize = 0.9 + Math.random() * 1.6 + "rem";
  const dur = 6 + Math.random() * 7;
  p.style.animationDuration = dur + "s";
  petalsBox.appendChild(p);
  setTimeout(() => p.remove(), dur * 1000);
}
setInterval(spawnPetal, 650);

// ===== Background music =====
const audio = document.getElementById("bgAudio");
const musicControl = document.getElementById("musicControl");
let isPlaying = false;

function playMusic() {
  audio
    .play()
    .then(() => {
      isPlaying = true;
      musicControl.classList.add("playing");
    })
    .catch(() => {
      // Autoplay blocked by browser; user can tap the music button
      isPlaying = false;
      musicControl.classList.remove("playing");
    });
}

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    musicControl.classList.remove("playing");
  } else {
    playMusic();
  }
}

musicControl.addEventListener("click", toggleMusic);

// ===== Enter button: scroll down + start music =====
const enterBtn = document.getElementById("enterBtn");
enterBtn.addEventListener("click", () => {
  playMusic();
  document.querySelectorAll(".section")[0].scrollIntoView({ behavior: "smooth" });
});

// Try to start music on first interaction anywhere (browser autoplay policy)
document.body.addEventListener(
  "click",
  () => {
    if (!isPlaying) playMusic();
  },
  { once: true }
);

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));

// ===== Love explosion button =====
const loveBtn = document.getElementById("loveBtn");
const loveExplosion = document.getElementById("loveExplosion");
const hearts = ["💖", "💕", "💗", "❤️", "🌸", "✨", "💘"];

loveBtn.addEventListener("click", () => {
  const rect = loveBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 26; i++) {
    const b = document.createElement("span");
    b.className = "burst";
    b.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    b.style.left = cx + "px";
    b.style.top = cy + "px";
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 180;
    b.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    b.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    loveExplosion.appendChild(b);
    setTimeout(() => b.remove(), 1200);
  }
});

// ===== Photo Heart: arrange photos into a big heart shape =====
const heartCanvas = document.getElementById("heartCanvas");
const heartStage = document.getElementById("heartStage");
const heartPhotos = [
  "photos/merci-1.jpeg",
  "photos/merci-2.jpeg",
  "photos/merci-3.jpeg",
  "photos/merci-4.jpeg",
  "photos/merci-5.jpeg",
  "photos/merci-6.jpeg",
];

// Heart parametric curve: x = 16 sin^3 t, y = 13 cos t - 5 cos2t - 2 cos3t - cos4t
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function buildPhotoHeart() {
  if (!heartCanvas) return;
  heartCanvas.innerHTML = "";
  const count = 34; // number of photo tiles forming the heart outline
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const p = heartPoint(t);
    // normalize from roughly [-16,16] / [-17,13] into 0..100 percent
    const left = 50 + (p.x / 16) * 42;
    const top = 50 - (p.y / 16) * 42;

    const tile = document.createElement("div");
    tile.className = "heart-tile";
    tile.style.left = left + "%";
    tile.style.top = top + "%";
    tile.style.backgroundImage = `url('${heartPhotos[i % heartPhotos.length]}')`;
    // staggered pop-in so the heart "draws" itself
    tile.style.animationDelay = `${i * 0.05}s, ${i * 0.05 + 0.6}s`;
    heartCanvas.appendChild(tile);
  }
}

// Build the heart only when the section scrolls into view
const heartSection = document.querySelector(".section-heart");
if (heartSection) {
  const heartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          buildPhotoHeart();
          // start the heartbeat after tiles have popped in
          setTimeout(() => heartStage.classList.add("beating"), count0Delay());
          heartObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  heartObserver.observe(heartSection);
}

function count0Delay() {
  return 34 * 50 + 600; // matches total stagger
}

// ===== Flower frame: fill the four edges with flowers, responsive =====
const flowerFrame = document.getElementById("flowerFrame");
const frameFlowers = ["🌸", "🌷", "🌹", "🌺", "🌼", "🌻", "💐"];

function buildFlowerFrame() {
  if (!flowerFrame) return;
  // remove previously generated edges (keep the 4 corner decorations)
  flowerFrame.querySelectorAll(".frame-edge").forEach((el) => el.remove());

  // Minimal, airy frame: just a few sparse flower accents per edge (not a full row).
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const isSmall = vw <= 600;

  // only a handful of accents, evenly spaced, with gaps between them
  const horizCount = isSmall ? 2 : 3;
  const vertCount = isSmall ? 2 : 3;

  const edges = [
    { cls: "top", n: horizCount },
    { cls: "bottom", n: horizCount },
    { cls: "left", n: vertCount },
    { cls: "right", n: vertCount },
  ];

  edges.forEach((edge) => {
    const row = document.createElement("div");
    row.className = "frame-edge " + edge.cls;
    for (let i = 0; i < edge.n; i++) {
      const f = document.createElement("span");
      f.textContent = frameFlowers[i % frameFlowers.length];
      f.style.animationDelay = (i % 7) * 0.18 + "s";
      row.appendChild(f);
    }
    flowerFrame.appendChild(row);
  });
}

buildFlowerFrame();

// rebuild on resize / orientation change (debounced)
let frameTimer;
window.addEventListener("resize", () => {
  clearTimeout(frameTimer);
  frameTimer = setTimeout(buildFlowerFrame, 200);
});

// ===== Gallery: reveal the six photos one-by-one with a transition =====
const galleryPics = document.querySelectorAll(".gallery .pic");
if (galleryPics.length) {
  const galObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          galleryPics.forEach((pic, i) => {
            setTimeout(() => pic.classList.add("show"), i * 180);
          });
          obs.disconnect(); // run the stagger once
        }
      });
    },
    { threshold: 0.2 }
  );
  galObserver.observe(document.querySelector(".section-gallery"));
}

// ===== Interactive birthday cake: swipe to blow out the candles =====
(function () {
  const stage = document.getElementById("cakeStage");
  if (!stage) return;

  const flames = Array.from(document.querySelectorAll(".candle .flame"));
  const cakeHint = document.getElementById("cakeHint");
  const cakeWish = document.getElementById("cakeWish");
  const smokePuffs = document.getElementById("smokePuffs");
  let totalLit = flames.length;
  let wishShown = false;

  // track pointer speed to require an actual "swipe/gesek" over a flame
  let lastX = null,
    lastY = null,
    lastT = 0;

  function extinguish(flame) {
    if (!flame.dataset.lit || flame.dataset.lit === "0") return;
    // first touch: start blowing, then go out shortly after
    flame.classList.add("blowing");
    setTimeout(() => {
      if (flame.dataset.lit === "0") return;
      flame.dataset.lit = "0";
      flame.classList.remove("blowing");
      flame.classList.add("out");
      totalLit--;
      spawnPuff(flame);
      if (totalLit <= 0) showWish();
    }, 320);
  }

  function spawnPuff(flame) {
    if (!smokePuffs) return;
    const rect = flame.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const puff = document.createElement("span");
    puff.className = "puff";
    puff.textContent = "💨";
    puff.style.left = rect.left - stageRect.left + "px";
    smokePuffs.appendChild(puff);
    setTimeout(() => puff.remove(), 1600);
  }

  function showWish() {
    if (wishShown) return;
    wishShown = true;
    if (cakeHint) {
      cakeHint.textContent = "Yeay, semua lilinnya mati! Udah make a wish belum? 🌟";
    }
    // a few extra celebratory puffs
    let n = 0;
    const burst = setInterval(() => {
      flames.forEach((f) => spawnPuff(f));
      if (++n >= 3) clearInterval(burst);
    }, 200);
    setTimeout(() => {
      if (cakeWish) cakeWish.classList.add("show");
    }, 700);
  }

  function handleMove(x, y) {
    const now = performance.now();
    if (lastX !== null) {
      const dt = now - lastT || 16;
      const dist = Math.hypot(x - lastX, y - lastY);
      const speed = dist / dt; // px per ms
      // only a real swipe (fast move) blows out a flame it passes over
      if (speed > 0.35) {
        const el = document.elementFromPoint(x, y);
        if (el && el.classList.contains("flame")) {
          extinguish(el);
        }
      }
    }
    lastX = x;
    lastY = y;
    lastT = now;
  }

  stage.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
  stage.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (t) handleMove(t.clientX, t.clientY);
    },
    { passive: true }
  );

  // accessibility / fallback: clicking or tapping a flame also blows it out
  flames.forEach((f) => {
    f.addEventListener("click", () => extinguish(f));
  });
})();

// ===== Polaroid running gallery (auto-scroll up, seamless loop) =====
(function () {
  const viewport = document.getElementById("polaroidViewport");
  const track = document.getElementById("polaroidTrack");
  if (!viewport || !track) return;

  const CAPTIONS = [
    "Anti wacana Forever",
    "Pose keren kita",
    "Kamu begitu cantik",
    "si paling foto",
    "momen di kegelapan",
    "Kamu dan Malam",
    "My favorit",
    "senja dan kamu",
    "Renang kala itu",
    "kita, lagi",
    "Part favorit",
    "Pose imutmu",
    "Cermin di sudut Jogja",
  ];

  // build one set of 13 polaroids
  function buildSet() {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= 13; i++) {
      const card = document.createElement("figure");
      card.className = "polaroid";
      card.style.setProperty("--rot", (i % 2 === 0 ? 2.2 : -2.4) + "deg");

      const img = document.createElement("div");
      img.className = "pola-img empty";
      img.setAttribute("data-label", "Foto ke-" + i);
      // load the real photo; if it exists, drop the placeholder look
      const url = "photos/polaroid/pola-" + i + ".jpeg";
      const probe = new Image();
      probe.onload = () => {
        img.style.backgroundImage = `url('${url}')`;
        img.classList.remove("empty");
      };
      probe.src = url;

      const cap = document.createElement("figcaption");
      cap.textContent = CAPTIONS[i - 1] || "kita 💕";

      card.appendChild(img);
      card.appendChild(cap);
      frag.appendChild(card);
    }
    return frag;
  }

  // two identical sets back-to-back for a seamless loop
  track.appendChild(buildSet());
  track.appendChild(buildSet());

  let offset = 0;
  let paused = false;
  let loopSize = 0; // size of one full set (height on desktop, width on phone)
  const SPEED = 0.7; // px per frame — brisk so all 13 cycle without a long wait

  function isHorizontal() {
    return window.matchMedia("(max-width: 600px)").matches;
  }

  function measure() {
    loopSize = isHorizontal() ? track.scrollWidth / 2 : track.scrollHeight / 2;
  }
  setTimeout(measure, 300);
  window.addEventListener("resize", () => setTimeout(measure, 200));

  function apply() {
    if (isHorizontal()) {
      track.style.transform = `translateX(${-offset}px)`;
    } else {
      track.style.transform = `translateY(${-offset}px)`;
    }
  }

  function tick() {
    if (!paused && loopSize > 0) {
      offset += SPEED;
      if (offset >= loopSize) offset -= loopSize; // seamless loop
      apply();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // pause on hover (desktop)
  viewport.addEventListener("mouseenter", () => (paused = true));
  viewport.addEventListener("mouseleave", () => (paused = false));

  // manual drag on touch (works both directions), then resume auto
  let startPos = null;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      paused = true;
      const t = e.touches[0];
      startPos = isHorizontal() ? t.clientX : t.clientY;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (startPos === null || loopSize === 0) return;
      const t = e.touches[0];
      const pos = isHorizontal() ? t.clientX : t.clientY;
      offset += startPos - pos;
      offset = ((offset % loopSize) + loopSize) % loopSize;
      apply();
      startPos = pos;
    },
    { passive: true }
  );
  viewport.addEventListener("touchend", () => {
    startPos = null;
    setTimeout(() => (paused = false), 1200);
  });

  // hide / show toggle
  const rail = document.getElementById("polaroidRail");
  const toggle = document.getElementById("railToggle");
  if (toggle && rail) {
    toggle.addEventListener("click", () => rail.classList.toggle("hidden"));
  }
})();
