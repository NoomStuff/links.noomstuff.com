const CLUSTER_VIEWPORT_USAGE = 1;
const BUBBLE_GAP_RATIO = 0.3;
const BOTTOM_SCALE_FALLOFF = 0.2;

const ORBIT_ARC_DEGREES = 250;
const ORBIT_HEIGHT_OFFSET_RATIO = -0.125;

const SPAWN_DELAY_MS = 80;
const SPAWN_STAGGER_MS = 60;
const SPAWN_SPEED = 350;

const POINTER_FOLLOW_STRENGTH = 2;
const POINTER_PUSH_BASE_RADIUS_PX = 240;
const POINTER_PUSH_STRENGTH = 800;
const POINTER_REFERENCE_BUBBLE_DIAMETER_PX = 180;

const HOVER_ENTER_IMPULSE = 400;
const HOVER_LEAVE_IMPULSE = 200;

const SPRING_STRENGTH = 30;
const SPRING_DAMPING = 6;
const MAX_FRAME_DELTA_SECONDS = 0.033;

(async () => {
    const stageElement = document.getElementById("bubble-stage");
    if (!(stageElement instanceof HTMLElement)) return;
    const stage = stageElement;

    const profileElement = stage.querySelector(".profile-bubble");
    if (!(profileElement instanceof HTMLAnchorElement)) return;
    const profile = profileElement;
    const profileImageElement = profile.querySelector("img");
    if (!(profileImageElement instanceof HTMLImageElement)) return;
    const profileImage = profileImageElement;

    const captionElement = document.getElementById("bubble-caption");
    const captionTitle = captionElement?.querySelector("strong");
    const captionDescription = captionElement?.querySelector("span");
    if (!(captionElement instanceof HTMLElement)
        || !(captionTitle instanceof HTMLElement)
        || !(captionDescription instanceof HTMLElement)) return;
    const caption = captionElement;

    const response = await fetch("links.json");
    if (!response.ok) throw new Error(`Could not load featured links (${response.status}).`);

    const json = (await response.json());
    if (!Array.isArray(json.featured)) throw new TypeError("links.json needs a featured array.");
    const centerLink = json.center;
    if (typeof centerLink !== "object"
        || centerLink === null
        || typeof centerLink.name !== "string"
        || typeof centerLink.url !== "string"
        || typeof centerLink.icon !== "string"
        || typeof centerLink.description !== "string") {
        throw new TypeError(
            "links.json needs a center link with a name, URL, icon, and description.",
        );
    }
    const links = (json.featured);

    function addIconFallback(image) {
        image.addEventListener("error", () => {
            if (image.getAttribute("src") !== "media/icons/globe.svg") {
                image.src = "media/icons/globe.svg";
            }
        });
    }

    addIconFallback(profileImage);
    profile.href = centerLink.url;
    profile.ariaLabel = centerLink.name;
    profile.title = centerLink.name;
    profileImage.src = centerLink.icon;
    profileImage.alt = centerLink.name;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionEnabled = !reducedMotion.matches;
    
    const bubbles = [];
    let pointerX = -10_000;
    let pointerY = -10_000;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let resizeFrame = 0;
    let previousFrame = performance.now();
    let captionOwner = null;

    function showCaption(element, title, description) {
        if (captionOwner !== element) {
            caption.classList.add("resetting");
            caption.classList.remove("visible");
            caption.getBoundingClientRect();
            caption.classList.remove("resetting");
        }

        captionOwner = element;
        captionTitle.textContent = title;
        captionDescription.textContent = description;
        caption.classList.add("visible");
    }

    function hideCaptionIfUnused() {
        const captionInUse = bubbles.some((bubble) =>
            bubble.hovered
            || (
                document.activeElement === bubble.element
                && bubble.element.matches(":focus-visible")
            )
        );
        if (!captionInUse) caption.classList.remove("visible");
    }

    function addBubble(element, active, title, description) {
        const bubble = {
            element,
            anchorX: 0,
            anchorY: 0,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
            active,
            hovered: false,
            pointerPressed: false,
            interactionScale: 1,
        };

        element.addEventListener("pointerdown", () => {
            bubble.pointerPressed = true;
        });
        element.addEventListener("click", () => {
            if (!bubble.pointerPressed) return;
            bubble.pointerPressed = false;
            element.blur();
            hideCaptionIfUnused();
        });
        element.addEventListener("pointerenter", (event) => {
            bubble.hovered = true;
            showCaption(element, title, description);
            const rect = element.getBoundingClientRect();
            const deltaX = event.clientX - (rect.left + rect.width / 2);
            const deltaY = event.clientY - (rect.top + rect.height / 2);
            const distance = Math.hypot(deltaX, deltaY) || 1;
            bubble.velocityX += deltaX / distance
                * HOVER_ENTER_IMPULSE * bubble.interactionScale;
            bubble.velocityY += deltaY / distance
                * HOVER_ENTER_IMPULSE * bubble.interactionScale;
        });
        element.addEventListener("pointerleave", (event) => {
            bubble.hovered = false;
            hideCaptionIfUnused();
            const rect = element.getBoundingClientRect();
            const deltaX = event.clientX - (rect.left + rect.width / 2);
            const deltaY = event.clientY - (rect.top + rect.height / 2);
            const distance = Math.hypot(deltaX, deltaY) || 1;
            bubble.velocityX -= deltaX / distance
                * HOVER_LEAVE_IMPULSE * bubble.interactionScale;
            bubble.velocityY -= deltaY / distance
                * HOVER_LEAVE_IMPULSE * bubble.interactionScale;
        });
        element.addEventListener("focus", () => {
            showCaption(element, title, description);
        });
        element.addEventListener("blur", () => {
            bubble.pointerPressed = false;
            hideCaptionIfUnused();
        });
        bubbles.push(bubble);
        return bubble;
    }

    const profileBubble = addBubble(
        profile,
        true,
        centerLink.name,
        centerLink.description,
    );
    const featuredBubbles = links.map((link, index) => {
        if (typeof link.name !== "string"
            || typeof link.url !== "string"
            || typeof link.icon !== "string"
            || typeof link.description !== "string") {
            throw new TypeError(
                "Every featured link needs a name, URL, icon, and description.",
            );
        }

        const element = document.createElement("a");
        element.className = "featured-bubble";
        element.href = link.url;
        element.target = "_blank";
        element.rel = "noopener noreferrer";
        element.ariaLabel = link.name;

        const entrance = document.createElement("span");
        entrance.className = "bubble-entrance";
        entrance.style.animationDelay =
            `${SPAWN_DELAY_MS + index * SPAWN_STAGGER_MS}ms`;

        const surface = document.createElement("span");
        surface.className = "bubble-surface";
        const icon = document.createElement("img");
        addIconFallback(icon);
        icon.src = link.icon;
        icon.alt = "";
        surface.append(icon);
        entrance.append(surface);
        element.append(entrance);
        stage.append(element);

        return addBubble(element, !motionEnabled, link.name, link.description);
    });

    function draw(bubble) {
        bubble.element.style.transform =
            `translate3d(calc(-50% + ${bubble.offsetX}px), calc(-50% + ${bubble.offsetY}px), 0)`;
    }

    function layout() {
        const { width, height } = stage.getBoundingClientRect();
        if (width === 0 || height === 0 || featuredBubbles.length === 0) return;

        const clusterRadius = Math.min(width, height) * CLUSTER_VIEWPORT_USAGE / 2;
        const arcDegrees = Math.max(1, Math.min(360, ORBIT_ARC_DEGREES));
        const targetArc = arcDegrees * Math.PI / 180;
        const midpoint = (featuredBubbles.length - 1) / 2;
        const scaleFalloff = Math.max(0, Math.min(0.95, BOTTOM_SCALE_FALLOFF));
        const sizeScales = featuredBubbles.map((_, index) => {
            const distanceFromTop = midpoint === 0
                ? 0
                : Math.abs(index - midpoint) / midpoint;
            return 1 - scaleFalloff * distanceFromTop;
        });

        function getAngleSteps(profileRatio) {
            return sizeScales.map((scale, index) => {
                const nextScale = sizeScales[(index + 1) % sizeScales.length];
                const distance = profileRatio + BUBBLE_GAP_RATIO + scale;
                const nextDistance = profileRatio + BUBBLE_GAP_RATIO + nextScale;
                const separation = scale + nextScale + BUBBLE_GAP_RATIO;
                const cosine = (
                    distance ** 2 + nextDistance ** 2 - separation ** 2
                ) / (2 * distance * nextDistance);
                return Math.acos(Math.max(-1, Math.min(1, cosine)));
            });
        }

        let minimumProfileRatio = 0;
        let maximumProfileRatio = 1;
        while (getAngleSteps(maximumProfileRatio)
            .reduce((total, step) => total + step, 0) > targetArc) {
            maximumProfileRatio *= 2;
        }
        for (let iteration = 0; iteration < 40; iteration++) {
            const profileRatio = (minimumProfileRatio + maximumProfileRatio) / 2;
            const arc = getAngleSteps(profileRatio)
                .reduce((total, step) => total + step, 0);
            if (arc > targetArc) {
                minimumProfileRatio = profileRatio;
            } else {
                maximumProfileRatio = profileRatio;
            }
        }

        const profileRatio = (minimumProfileRatio + maximumProfileRatio) / 2;
        const bubbleRadius = clusterRadius
            / (profileRatio + BUBBLE_GAP_RATIO + 2);
        const radii = sizeScales.map((scale) => bubbleRadius * scale);
        const gap = bubbleRadius * BUBBLE_GAP_RATIO;
        const profileRadius = bubbleRadius * profileRatio;
        const distances = radii.map((radius) => profileRadius + gap + radius);
        const angleSteps = getAngleSteps(profileRatio);
        const occupiedArc = angleSteps
            .slice(0, -1)
            .reduce((total, step) => total + step, 0);
        let angle = -Math.PI / 2 - occupiedArc / 2;
        const positions = featuredBubbles.map((_, index) => {
            const position = {
                x: Math.cos(angle) * distances[index],
                y: Math.sin(angle) * distances[index],
            };
            angle += angleSteps[index];
            return position;
        });

        const centerX = width / 2;
        const centerY = height / 2
            - Math.min(width, height) * ORBIT_HEIGHT_OFFSET_RATIO;

        const oldProfileX = profileBubble.anchorX;
        const oldProfileY = profileBubble.anchorY;
        profileBubble.anchorX = centerX;
        profileBubble.anchorY = centerY;
        profileBubble.interactionScale =
            profileRadius * 2 / POINTER_REFERENCE_BUBBLE_DIAMETER_PX;
        profile.style.left = `${centerX}px`;
        profile.style.top = `${centerY}px`;
        profile.style.width = `${profileRadius * 2}px`;

        if (!motionEnabled) {
            profileBubble.offsetX = 0;
            profileBubble.offsetY = 0;
            profileBubble.velocityX = 0;
            profileBubble.velocityY = 0;
        } else if (oldProfileX !== 0 || oldProfileY !== 0) {
            profileBubble.offsetX += oldProfileX - profileBubble.anchorX;
            profileBubble.offsetY += oldProfileY - profileBubble.anchorY;
        }
        draw(profileBubble);

        featuredBubbles.forEach((bubble, index) => {
            const oldX = bubble.anchorX;
            const oldY = bubble.anchorY;
            bubble.anchorX = centerX + positions[index].x;
            bubble.anchorY = centerY + positions[index].y;
            bubble.interactionScale =
                radii[index] * 2 / POINTER_REFERENCE_BUBBLE_DIAMETER_PX;
            bubble.element.style.left = `${bubble.anchorX}px`;
            bubble.element.style.top = `${bubble.anchorY}px`;
            bubble.element.style.width = `${radii[index] * 2}px`;

            if (!motionEnabled) {
                bubble.offsetX = 0;
                bubble.offsetY = 0;
                bubble.velocityX = 0;
                bubble.velocityY = 0;
            } else if (!bubble.active) {
                bubble.offsetX = centerX - bubble.anchorX;
                bubble.offsetY = centerY - bubble.anchorY;
            } else if (oldX !== 0 || oldY !== 0) {
                bubble.offsetX += oldX - bubble.anchorX;
                bubble.offsetY += oldY - bubble.anchorY;
            }
            draw(bubble);
        });
    }

    layout();

    if (motionEnabled) {
        featuredBubbles.forEach((bubble, index) => {
            window.setTimeout(() => {
                bubble.active = true;
                const length = Math.hypot(bubble.anchorX - profileBubble.anchorX,
                    bubble.anchorY - profileBubble.anchorY) || 1;
                bubble.velocityX =
                    (bubble.anchorX - profileBubble.anchorX) / length * SPAWN_SPEED;
                bubble.velocityY =
                    (bubble.anchorY - profileBubble.anchorY) / length * SPAWN_SPEED;
            }, SPAWN_DELAY_MS + index * SPAWN_STAGGER_MS);
        });
    }

    stage.addEventListener("pointermove", (event) => {
        const deltaX = event.clientX - previousPointerX;
        const deltaY = event.clientY - previousPointerY;
        pointerX = event.clientX;
        pointerY = event.clientY;

        for (const bubble of bubbles) {
            if (bubble.hovered && previousPointerX !== 0) {
                bubble.velocityX += deltaX
                    * POINTER_FOLLOW_STRENGTH * bubble.interactionScale;
                bubble.velocityY += deltaY
                    * POINTER_FOLLOW_STRENGTH * bubble.interactionScale;
            }
        }
        previousPointerX = event.clientX;
        previousPointerY = event.clientY;
    }, { passive: true });

    stage.addEventListener("pointerleave", () => {
        pointerX = -10_000;
        pointerY = -10_000;
        previousPointerX = 0;
        previousPointerY = 0;
    });

    new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(layout);
    }).observe(stage);

    /** @param {number} now */
    function animate(now) {
        const delta = Math.min(
            (now - previousFrame) / 1000,
            MAX_FRAME_DELTA_SECONDS,
        );
        previousFrame = now;

        if (motionEnabled && !document.hidden) {
            const bounds = stage.getBoundingClientRect();
            for (const bubble of bubbles) {
                if (!bubble.active) continue;

                bubble.velocityX -= bubble.offsetX * SPRING_STRENGTH * delta;
                bubble.velocityY -= bubble.offsetY * SPRING_STRENGTH * delta;

                const bubbleX = bounds.left + bubble.anchorX + bubble.offsetX;
                const bubbleY = bounds.top + bubble.anchorY + bubble.offsetY;
                const toPointerX = pointerX - bubbleX;
                const toPointerY = pointerY - bubbleY;
                const distance = Math.hypot(toPointerX, toPointerY) || 1;
                const pushRadius = POINTER_PUSH_BASE_RADIUS_PX * bubble.interactionScale * 2;
                const push = Math.max(0, 1 - distance / pushRadius);
                if (!bubble.hovered && push > 0) {
                    bubble.velocityX -= toPointerX / distance
                        * push * push * POINTER_PUSH_STRENGTH
                        * bubble.interactionScale * delta;
                    bubble.velocityY -= toPointerY / distance
                        * push * push * POINTER_PUSH_STRENGTH
                        * bubble.interactionScale * delta;
                }

                const damping = Math.exp(-SPRING_DAMPING * delta);
                bubble.velocityX *= damping;
                bubble.velocityY *= damping;
                bubble.offsetX += bubble.velocityX * delta;
                bubble.offsetY += bubble.velocityY * delta;
                draw(bubble);
            }
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})().catch(console.error);
