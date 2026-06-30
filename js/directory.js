(async () => {
    const containerElement = document.getElementById("link-sections");
    if (!(containerElement instanceof HTMLElement)) return;
    const container = containerElement;

    const inputElement = document.getElementById("link-search");
    if (!(inputElement instanceof HTMLInputElement)) return;
    const input = inputElement;

    const searchElement = input.closest(".search");
    if (!(searchElement instanceof HTMLElement)) return;
    const searchBox = searchElement;

    const response = await fetch("links.json");
    if (!response.ok) throw new Error(`Could not load link directory (${response.status}).`);

    const json = /** @type {{ sections?: unknown }} */ (await response.json());
    if (!Array.isArray(json.sections)) throw new TypeError("links.json needs a sections array.");
    const sections = /** @type {LinkSection[]} */ (json.sections);
    /** @type {HTMLAnchorElement[]} */
    const tiles = [];
    /** @type {HTMLAnchorElement | null} */
    let focusedMatch = null;
    /** @type {HTMLAnchorElement | null} */
    let rememberedMatch = null;

    function setFocusedMatch(tile) {
        if (focusedMatch === tile) return;
        focusedMatch?.classList.remove("search-highlighted");
        focusedMatch = tile;
        focusedMatch?.classList.add("search-highlighted");
        if (focusedMatch) rememberedMatch = focusedMatch;
    }

    function addIconFallback(image) {
        image.addEventListener("error", () => {
            if (image.getAttribute("src") !== "media/icons/globe.svg") {
                image.src = "media/icons/globe.svg";
            }
        });
    }

    for (const section of sections) {
        if (typeof section.name !== "string" || !Array.isArray(section.links)) {
            throw new TypeError("Every link section needs a name and links array.");
        }

        const group = document.createElement("section");
        group.className = `link-group${section.featured ? " link-group--featured" : ""}`;

        const heading = document.createElement("div");
        heading.className = "link-group-heading";
        const title = document.createElement("h3");
        title.textContent = section.name;
        heading.append(title);

        const grid = document.createElement("div");
        grid.className = "link-grid";

        for (const link of section.links) {
            if (typeof link.name !== "string"
                || typeof link.url !== "string"
                || typeof link.icon !== "string"
                || typeof link.description !== "string") {
                throw new TypeError("Every link needs a name, URL, icon, and description.");
            }

            const tile = document.createElement("a");
            tile.className = "link-tile";
            tile.href = link.url;
            tile.target = "_blank";
            tile.rel = "noopener noreferrer";
            tile.dataset.name = link.name.toLocaleLowerCase();
            tile.dataset.section = section.name.toLocaleLowerCase();

            const iconWrap = document.createElement("span");
            iconWrap.className = "tile-icon";
            const icon = document.createElement("img");
            addIconFallback(icon);
            icon.src = link.icon;
            icon.alt = "";
            icon.loading = "lazy";
            iconWrap.append(icon);

            const divider = document.createElement("div");
            divider.className = "tile-divider";
            divider.setAttribute("aria-hidden", "true");

            const copy = document.createElement("span");
            copy.className = "tile-copy";
            const name = document.createElement("strong");
            name.textContent = link.name;
            const description = document.createElement("span");
            description.className = "tile-description";
            description.textContent = link.description;
            copy.append(name, description);

            const arrow = document.createElement("i");
            arrow.className = "tile-arrow fa-solid fa-chevron-right";
            arrow.setAttribute("aria-hidden", "true");

            tile.append(iconWrap, divider, copy, arrow);
            grid.append(tile);
            tiles.push(tile);
        }

        group.append(heading, grid);
        container.append(group);
    }

    function getMatchRank(tile, query) {
        const name = tile.dataset.name ?? "";
        const section = tile.dataset.section ?? "";
        if (name === query) return 0;

        const nameIndex = name.indexOf(query);
        if (nameIndex >= 0) {
            const startsAtWord = nameIndex === 0
                || /[^\p{L}\p{N}]/u.test(name[nameIndex - 1]);
            const matchType = nameIndex === 0
                ? 100
                : startsAtWord ? 1_000 : 2_000;
            return matchType + nameIndex * 10 + name.length - query.length;
        }

        const sectionIndex = section.indexOf(query);
        return 10_000 + Math.max(0, sectionIndex) * 10;
    }

    function stronglyMatchesTitle(tile, query) {
        const name = tile.dataset.name ?? "";
        const nameIndex = name.indexOf(query);
        return nameIndex === 0
            || (nameIndex > 0 && /[^\p{L}\p{N}]/u.test(name[nameIndex - 1]));
    }

    function search() {
        const query = input.value.trim().toLocaleLowerCase();
        const matches = tiles.filter((tile) => {
            const matchesQuery = !query
                || Boolean(tile.dataset.name?.includes(query))
                || Boolean(tile.dataset.section?.includes(query));
            tile.classList.toggle("search-dimmed", !matchesQuery);
            return matchesQuery;
        });
        if (query) {
            matches.sort((first, second) =>
                getMatchRank(first, query) - getMatchRank(second, query)
            );
        }

        if (!query || matches.length === 0) {
            setFocusedMatch(null);
        } else if (!focusedMatch || !matches.includes(focusedMatch)) {
            const nextMatch = rememberedMatch
                && query.length === 1
                && matches.includes(rememberedMatch)
                && stronglyMatchesTitle(rememberedMatch, query)
                ? rememberedMatch
                : matches[0];
            setFocusedMatch(nextMatch);
            focusedMatch.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "center",
            });
        }
        return matches;
    }

    function clearSearch() {
        if (!input.value) return;
        input.value = "";
        search();
    }

    input.addEventListener("input", search);
    input.addEventListener("blur", clearSearch);
    document.addEventListener("pointerdown", (event) => {
        if (event.target instanceof Node && !searchBox.contains(event.target)) {
            clearSearch();
        }
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && input.value.trim()) {
            event.preventDefault();
            const matches = search();
            const target = focusedMatch && matches.includes(focusedMatch)
                ? focusedMatch
                : matches[0];
            target?.click();
        }
    });
    window.addEventListener("keydown", (event) => {
        const target = event.target;
        const typingElsewhere = target instanceof HTMLElement
            && (target.isContentEditable
                || target instanceof HTMLInputElement
                || target instanceof HTMLTextAreaElement
                || target instanceof HTMLSelectElement);
        const isPlainLetter = /^\p{L}$/u.test(event.key)
            && !event.ctrlKey
            && !event.metaKey
            && !event.altKey;

        if (isPlainLetter && document.activeElement !== input && !typingElsewhere) {
            event.preventDefault();
            input.focus();
            input.value += event.key;
            input.setSelectionRange(input.value.length, input.value.length);
            search();
        } else if (event.key === "/" && document.activeElement !== input) {
            event.preventDefault();
            input.focus();
        } else if (event.key === "Escape" && document.activeElement === input) {
            clearSearch();
            input.blur();
        }
    });
})().catch(console.error);
