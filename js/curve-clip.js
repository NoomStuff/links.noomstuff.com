const element = document.querySelector(".curve-clip");

const curveDepth = 160;
const animationSpeed = 0.2;

let currentCurve = 0;
let targetCurve = 0;

const clipId = "curveClip";

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.style.cssText = "position:absolute;width:0;height:0";

svg.innerHTML = `
  <defs>
    <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
      <path />
    </clipPath>
  </defs>
`;

document.body.appendChild(svg);

const path = svg.querySelector("path");

element.style.clipPath = `url(#${clipId})`;
element.style.webkitClipPath = `url(#${clipId})`;

function updateClip() {
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  const depth = currentCurve;

  path.setAttribute("d", `
    M0 0
    H${width}
    V${height - depth}
    C${width * 0.75} ${height}
     ${width * 0.25} ${height}
     0 ${height - depth}
    Z
  `);
}

function updateScroll() {
  const progress = Math.min(window.scrollY / window.innerHeight, 1);

  targetCurve = progress * curveDepth;
}

function animate() {
  currentCurve += (targetCurve - currentCurve) * animationSpeed;

  if (Math.abs(currentCurve - targetCurve) > 0.01) {
    updateClip();
  }

  requestAnimationFrame(animate);
}

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateClip);

updateClip();
animate();