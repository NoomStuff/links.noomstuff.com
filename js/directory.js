(async () => {
    const tiles = [];
    let focusedMatch = null;
    let rememberedMatch = null;

    const container = getById("link-sections", HTMLElement);
    const input = getById("link-search", HTMLInputElement);
    const searchBox = input.closest(".search");

    if (!container || !input || !(searchBox instanceof HTMLElement)) return;

    const sections = await loadSections();
    for (const section of sections) {
        container.append(createSectionGroup(section));
    }

    function getById(id, ElementType) {
        const element = document.getElementById(id);
        return element instanceof ElementType ? element : null;
    }

    async function loadSections() {
        const response = await fetch("links.json");
        if (!response.ok) throw new Error(`Could not load link directory (${response.status}).`);

        const json = (await response.json());
        if (!Array.isArray(json.sections)) {
            throw new TypeError("links.json needs a sections array.");
        }
        return (json.sections);
    }

    function createSectionGroup(section) {
        if (typeof section.name !== "string" || !Array.isArray(section.links)) {
            throw new TypeError("Every link section needs a name and links array.");
        }

        const group = document.createElement("section");
        group.className = `link-group${section.featured ? " link-group--featured" : ""}`;

        const heading = document.createElement("div");
        heading.className = "link-group-heading animate-in";
        const title = document.createElement("h3");
        title.textContent = section.name;
        heading.append(title);

        const grid = document.createElement("div");
        grid.className = "link-grid";

        for (const link of section.links) {
            const tile = createTile(section.name, link);
            grid.append(tile);
            tiles.push(tile.querySelector(".link-tile"));
        }

        group.append(heading, grid);
        return group;
    }

    function createTile(sectionName, link) {
        if (typeof link.name !== "string"
            || typeof link.url !== "string"
            || typeof link.icon !== "string"
            || typeof link.description !== "string") {
            throw new TypeError("Every link needs a name, URL, icon, and description.");
        }

        const wrapper = document.createElement("div");
        wrapper.className = "animate-in";

        const tile = document.createElement("a");
        tile.className = "link-tile";
        tile.href = link.url;
        tile.target = "_blank";
        tile.rel = "noopener noreferrer";

        tile.dataset.name = link.name.toLocaleLowerCase();
        tile.dataset.section = sectionName.toLocaleLowerCase();

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
        wrapper.append(tile);

        return wrapper;
    }

    function addIconFallback(image) {
        image.addEventListener("error", () => {
            if (image.getAttribute("src") !== "media/icons/globe.svg") {
                image.src = "media/icons/globe.svg";
            }
        });
    }

    function startsAtWordBoundary(text, index) {
        return index === 0 || /[^\p{L}\p{N}]/u.test(text[index - 1]);
    }

    function getMatchRank(tile, query) {
        const name = tile.dataset.name ?? "";
        const section = tile.dataset.section ?? "";

        if (name === query) return 0;

        const nameIndex = name.indexOf(query);
        if (nameIndex >= 0) {
            const matchType = nameIndex === 0
                ? 100
                : startsAtWordBoundary(name, nameIndex) ? 1_000 : 2_000;
            return matchType + nameIndex * 10 + name.length - query.length;
        }

        const sectionIndex = section.indexOf(query);
        return 10_000 + Math.max(0, sectionIndex) * 10;
    }

    function stronglyMatchesTitle(tile, query) {
        const name = tile.dataset.name ?? "";
        const nameIndex = name.indexOf(query);
        return nameIndex >= 0 && startsAtWordBoundary(name, nameIndex);
    }

    function setFocusedMatch(tile) {
        if (focusedMatch === tile) return;

        focusedMatch?.classList.remove("search-highlighted");
        focusedMatch = tile;
        focusedMatch?.classList.add("search-highlighted");

        if (focusedMatch) rememberedMatch = focusedMatch;
    }

    function matchesQuery(tile, query) {
        return !query
            || Boolean(tile.dataset.name?.includes(query))
            || Boolean(tile.dataset.section?.includes(query));
    }

    function scrollMatchIntoView(tile) {
        tile.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "center",
        });
    }

    function search() {
        const query = input.value.trim().toLocaleLowerCase();
        const matches = tiles.filter((tile) => {
            const tileMatches = matchesQuery(tile, query);
            tile.classList.toggle("search-dimmed", !tileMatches);
            return tileMatches;
        });

        if (query) {
            matches.sort((first, second) => getMatchRank(first, query) - getMatchRank(second, query));
        }

        if (!query || matches.length === 0) {
            setFocusedMatch(null);
            return matches;
        }

        if (!focusedMatch || !matches.includes(focusedMatch)) {
            const shouldUseRememberedMatch = rememberedMatch
                && query.length === 1
                && matches.includes(rememberedMatch)
                && stronglyMatchesTitle(rememberedMatch, query);

            setFocusedMatch(shouldUseRememberedMatch ? rememberedMatch : matches[0]);

            if (focusedMatch) {
                scrollMatchIntoView(focusedMatch);
            }
        }

        return matches;
    }

    function clearSearch() {
        if (!input.value) return;
        input.value = "";
        search();
    }

    function isTypingElement(value) {
        return value instanceof HTMLElement
            && (value.isContentEditable
                || value instanceof HTMLInputElement
                || value instanceof HTMLTextAreaElement
                || value instanceof HTMLSelectElement);
    }

    function handleGlobalKeydown(event) {
        const inputIsFocused = document.activeElement === input;
        const typingElsewhere = isTypingElement(event.target) && !inputIsFocused;
        const isPlainLetter = /^\p{L}$/u.test(event.key)
            && !event.ctrlKey
            && !event.metaKey
            && !event.altKey;

        if (isPlainLetter && !inputIsFocused && !typingElsewhere) {
            event.preventDefault();
            input.focus();
            input.value += event.key;
            input.setSelectionRange(input.value.length, input.value.length);
            search();
            return;
        }

        if (event.key === "/" && !inputIsFocused) {
            event.preventDefault();
            input.focus();
            return;
        }

        if (event.key === "Escape" && inputIsFocused) {
            clearSearch();
            input.blur();
        }
    }

    input.addEventListener("input", search);
    input.addEventListener("blur", clearSearch);
    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" || !input.value.trim()) return;

        event.preventDefault();
        const matches = search();
        const target = focusedMatch && matches.includes(focusedMatch)
            ? focusedMatch
            : matches[0];
        target?.click();
    });

    document.addEventListener("pointerdown", (event) => {
        if (event.target instanceof Node && !searchBox.contains(event.target)) {
            clearSearch();
        }
    });

    window.addEventListener("keydown", handleGlobalKeydown);
})().catch(console.error);
