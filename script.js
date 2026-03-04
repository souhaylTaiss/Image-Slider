import "./input.css";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import GSDevTools from "gsap/GSDevTools";

gsap.registerPlugin(GSDevTools);
gsap.registerPlugin(ScrollTrigger);

const items = document.querySelectorAll("#slider li");
const translateZ = 1100;
let scrollValue = 0;
const imgSlider = document.querySelector("#slider");

let gap = 360 / items.length;

if (window.innerWidth <= 768) gap = 8;

let value = gap;
let counter = 0;
// preload images first
const totalImages = 3;
for (let i = 1; i <= totalImages; i++) {
  const img = new Image();
  img.src = `./images/${i}.webp`;
}

document.body.style.backgroundImage = `url(./images/1.webp)`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundRepeat = "no-repeat";

window.addEventListener("wheel", (e) => {
  if (e.deltaY > 0 || e.deltaX > 0) scrollValue -= 2;
  else scrollValue += 2;
  imgSlider.style.transform = `rotateY(${scrollValue}deg)`;
  imgSlider.dataset.deg = scrollValue;
});

items.forEach((item, i) => {
  counter++;
  let newValue = value > 180 ? value - 360 : value;
  item.style.transform = `rotateY(${newValue}deg) translateZ(${translateZ}px) `;
  item.dataset.deg = newValue;
  item.innerHTML = i;
  item.style.backgroundImage = `url(./images/${counter}.webp)`;
  item.style.backgroundSize = "cover";
  item.style.backgroundPosition = "center";
  item.style.backgroundRepeat = "no-repeat";
  // item.style.opacity = 0;
  value += gap;
  if (counter == 3) counter = 0;

  item.addEventListener("click", () => showContent(item));
});

function showContent(item) {
  items.forEach((i) => (i.style.outline = "none"));
  item.style.outline = "4px solid white";

  let itemLocalDeg = parseFloat(item.dataset.deg);
  let sliderDeg = parseFloat(imgSlider.dataset.deg);
  let target = sliderDeg - (sliderDeg + itemLocalDeg);

  target = sliderDeg - (sliderDeg + itemLocalDeg);

  imgSlider.style.transform = `rotateY(${target}deg)`;
  imgSlider.dataset.deg = target;
  scrollValue = target;
}

await new Promise((resolve) => setTimeout(resolve, 0));
const tl = gsap.timeline();
const arr = [...items];
const elements = [...arr.slice(24), ...arr.slice(0, 3)];
const mm = gsap.matchMedia();

tl.from("h1", {
  y: 100,
  opacity: 0,
  duration: 1.5,
  stagger: 0.3,
  id: "heading",
});

tl.from(elements, {
  y: 135,
  opacity: 0,
  duration: 1.5,
  stagger: {
    ease: "power1.in",
    amount: .5,
    from: "center",
  },
  id: "items",
});

mm.add("(max-width: 768px)", (context) => {
  const links = document.querySelectorAll("nav li");

  tl.from(links, {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.3,
    id: "nav",
  });


  links.forEach((link) => {
    context.add("scaleLinks", () => {
       gsap.to(link, {
          scale: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
    });
    link.addEventListener("mouseenter", context.scaleLinks);
  });
});

GSDevTools.create();
