// @ts-check

(() => {
    const heroElement = document.querySelector(".hero");
    if (!(heroElement instanceof HTMLElement)) return;
    const hero = heroElement;

    const container = document.createElement("div");
    container.className = "mouse-trailer-container";
    container.setAttribute("aria-hidden", "true");

    const trailer = document.createElement("div");
    trailer.className = "mouse-trailer";
    container.append(trailer);
    hero.prepend(container);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let size = 0;
    let resetTimeout = 0;

    function center() {
        const bounds = hero.getBoundingClientRect();
        targetX = bounds.width / 2 - size / 2;
        targetY = bounds.height / 2 - size / 2;
    }

    function resize() {
        const bounds = hero.getBoundingClientRect();
        size = Math.min(bounds.width, bounds.height) * 0.35;
        trailer.style.width = `${size}px`;
        trailer.style.height = `${size}px`;
        container.style.filter = `blur(${Math.min(bounds.width, bounds.height) * 0.25}px)`;
        center();
        if (currentX === 0 && currentY === 0) {
            currentX = targetX;
            currentY = targetY;
        }
    }

    hero.addEventListener("pointermove", (event) => {
        const bounds = hero.getBoundingClientRect();
        targetX = event.clientX - bounds.left - size / 2;
        targetY = event.clientY - bounds.top - size / 2;
        clearTimeout(resetTimeout);
        resetTimeout = window.setTimeout(center, 5000);
    }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    function animate() {
        currentX += (targetX - currentX) * 0.02;
        currentY += (targetY - currentY) * 0.02;
        trailer.style.left = `${currentX}px`;
        trailer.style.top = `${currentY}px`;
        requestAnimationFrame(animate);
    }

    resize();
    requestAnimationFrame(animate);
})();
