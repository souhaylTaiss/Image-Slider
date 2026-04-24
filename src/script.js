import "./input.css";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import Observer from "gsap/Observer";

gsap.registerPlugin(SplitText, Observer);

// Import Images
import img1 from "../images/1.webp";
import img2 from "../images/2.webp";
import img3 from "../images/3.webp";

const images = [img1, img2, img3];
// ============================================================
// CONFIG
// ============================================================
const TRANSLATE_Z = window.innerWidth <= 768 ? 700 : 1100;
const GAP = 12.8571;
const TOTAL_IMAGES = 3;

// ============================================================
// DOM
// ============================================================
const items = gsap.utils.toArray("#slider li");
const imgSlider = document.querySelector("#slider");
const contactUs = document.querySelector("p ~ a");
const anchors = gsap.utils.toArray("nav li a");

// ============================================================
// Body Background
// ============================================================
document.body.style.backgroundImage = `url(${images[0]})`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";

// ============================================================
// STATE
// ============================================================
let scrollValue = 0;
let elements = [...items.slice(23), ...items.slice(0, 4)];

// ============================================================
// OBSERVER
// ============================================================
const observer = Observer.create({
  onUp:    () => scrollSlider(2),
  onDown:  () => scrollSlider(-2),
  onLeft:  () => scrollSlider(2),
  onRight: () => scrollSlider(-2),
});

// ============================================================
// SLIDER
// ============================================================
function scrollSlider(value) {
  scrollValue += value;
  imgSlider.dataset.deg = scrollValue;
  imgSlider.style.transform = `rotateY(${scrollValue}deg)`;
}

function getTargetRotation(currentRotation, itemAngle) {
  const targetBase  = -itemAngle;
  const currentNorm = ((currentRotation % 360) + 360) % 360;
  const targetNorm  = ((targetBase % 360) + 360) % 360;

  let diff = targetNorm - currentNorm;
  if (diff >  180) diff -= 360;
  if (diff < -180) diff += 360;

  return currentRotation + diff;
}

function getCircularSlice(arr, center, count) {
  const len  = arr.length;
  const half = Math.floor(count / 2);
  const result = [];

  for (let i = -half; i <= half; i++) {
    const index = (((center + i) % len) + len) % len;
    result.push(arr[index]);
  }

  return result;
}

// ============================================================
// SETUP ITEMS
// ============================================================
let counter = 0;
let value   = GAP;

items.forEach((item, i) => {
  counter++;
  item.id = i;
  item.dataset.deg = value;
  item.style.cssText += `
    transform: rotateY(${value}deg) translateZ(${TRANSLATE_Z}px);
    background-image: url(${images[counter - 1]});
    background-size: cover;
    background-position: center;
  `;

  value += GAP;
  if (counter === TOTAL_IMAGES) counter = 0;

  item.addEventListener("click",      () => showContent(item));
  item.addEventListener("mouseenter", () => gsap.to(item, { scale: 1.1, duration: 0.3, ease: "power2.out" }));
  item.addEventListener("mouseleave", () => gsap.to(item, { scale: 1,   duration: 0.3, ease: "power2.out" }));
});

// ============================================================
// NAV HOVER
// ============================================================
anchors.forEach((anchor) => {
  const split = SplitText.create(anchor, { type: "chars" });

  gsap.set(anchor, {
    transformStyle: "preserve-3d",
    perspective: 200,
    display: "block",
  });

  anchor.addEventListener("mouseenter", () => {
    gsap.to(split.chars, {
      z: 50,
      color: "#155dfc",
      duration: 0.3,
      ease: "power2.out",
      stagger: { each: 0.05, from: "center" },
    });
  });

  anchor.addEventListener("mouseleave", () => {
    gsap.to(split.chars, {
      z: 0,
      color: "white",
      duration: 0.3,
      ease: "power2.out",
      stagger: { each: 0.05, from: "center" },
    });
  });
});

// ============================================================
// CONTACT US HOVER
// ============================================================
const contactSplit = SplitText.create(contactUs, { type: "chars" });

gsap.set(contactUs, {
  transformStyle: "preserve-3d",
  perspective: 200,
  display: "block",
});

contactUs.addEventListener("mouseenter", () => {
  gsap.set(contactUs, { background: "transparent" });
  gsap.to(contactSplit.chars, {
    z: 50,
    duration: 0.3,
    ease: "power2.out",
    margin: "0 1px",
    padding: 2,
    borderRadius: 5,
    background: "#fe9a00",
    stagger: { each: 0.05, from: "center" },
  });
});

contactUs.addEventListener("mouseleave", () => {
  const tl = gsap.timeline();
  tl.to(contactSplit.chars, {
    z: 0,
    duration: 0.3,
    ease: "power2.out",
    margin: 0,
    padding: 0,
    borderRadius: 0,
    background: "transparent",
    stagger: { each: 0.05, from: "center" },
  })
  .to(contactUs, { background: "#fe9a00" }, "<20%");
});

// ============================================================
// SHOW CONTENT
// ============================================================
async function showContent(item) {
  observer.disable();

  elements = getCircularSlice(items, Number(item.id), 10);

  const itemLocalDeg = parseFloat(item.dataset.deg);
  const sliderDeg    = parseFloat(imgSlider.dataset.deg) || 0;
  const target       = +getTargetRotation(sliderDeg, itemLocalDeg).toFixed(4);

  imgSlider.style.transform = `rotateY(${target}deg)`;
  imgSlider.dataset.deg     = target;
  scrollValue               = target;

  await new Promise((resolve) => {
    imgSlider.addEventListener(
      "transitionend",
      (e) => { if (e.propertyName === "transform") resolve(); },
      { once: true }
    );
  });

  items.forEach((i) => (i.style.outline = "none"));
  item.style.outline = "4px solid white";

  // Clone animation
  const rect  = item.getBoundingClientRect();
  const clone = item.cloneNode(true);

  Object.assign(clone.style, {
    position:   "fixed",
    listStyle:  "none",
    top:        rect.top  + "px",
    left:       rect.left + "px",
    width:      rect.width  + "px",
    height:     rect.height + "px",
    transform:  "none",
    zIndex:     "1000",
    margin:     "0",
  });

  document.body.append(clone);

  gsap.to(clone, {
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    duration: 1.5,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.set("header", { opacity: 0 });
      document.body.style.cssText += `
        background-image: ${item.style.backgroundImage};
        background-size: cover;
        background-position: center;
      `;

      gsap.to(clone, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => { clone.remove(); loadElements(); },
      });
    },
  });
}

// ============================================================
// LOAD ELEMENTS
// ============================================================
function loadElements() {
  const splitHeader = SplitText.create("h1", { type: "words" });
  const splitPara   = SplitText.create("p",  { type: "words" });

  const tl = gsap.timeline();

  tl.from("#layer",  { backdropFilter: "blur(8px)" })
    .to("header",    { opacity: 1 }, "<")
    .from("nav li",  { y: -100, opacity: 0, stagger: 0.3 }, "<10%")
    .from(splitHeader.words, {
      rotateX: 90,
      transformOrigin: "bottom",
      opacity: 0,
      stagger: 0.2,
    }, "<75%")
    .from(splitPara.words, {
      y: 50,
      opacity: 0,
      stagger: { each: 0.01, from: "random" },
    }, "<75%")
    .from("#contactUs", {
      scale: 0.2,
      opacity: 0,
      duration: 1,
      ease: "elastic",
    }, "<75%")
    .from(elements, {
      y: 135,
      opacity: 0,
      ease: "elastic.out(1, 0.5)",
      duration: 1.5,
      stagger: { each: 0.1, from: "center" },
      onComplete: () => observer.enable(),
    }, "<70%");
}

loadElements();
