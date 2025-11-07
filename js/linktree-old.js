const linktreeElement = document.getElementById('linktree');

linktreeElement.style.position = 'relative';

const links = [
    {
        name: "YouTube",
        url: "/youtube",
        icon: "fa-brands fa-youtube"
    },
    {
        name: "Twitter/X",
        url: "/twitter",
        icon: "fa-brands fa-x-twitter"
    },
    {
        name: "GitHub",
        url: "/github",
        icon: "fa-brands fa-github"
    },
    {
        name: "Bluesky",
        url: "/bluesky",
        icon: "fa-brands fa-bluesky"
    },
    {
        name: "Neocities",
        url: "/neocities",
        icon: "fa-solid fa-globe"
    },
    {
        name: "Itch.io",
        url: "/itch",
        icon: "fa-brands fa-itch-io"
    },
    {
        name: "Reddit",
        url: "/reddit",
        icon: "fa-brands fa-reddit"
    },
    {
        name: "Twitch",
        url: "/twitch",
        icon: "fa-brands fa-twitch"
    },
    {
        name: "Instagram",
        url: "/instagram",
        icon: "fa-brands fa-instagram"
    },
    {
        name: "Facebook",
        url: "/facebook",
        icon: "fa-brands fa-facebook"
    },
    {
        name: "Spotify",
        url: "/spotify",
        icon: "fa-brands fa-spotify"
    },
    {
        name: "SoundCloud",
        url: "/soundcloud",
        icon: "fa-brands fa-soundcloud"
    },
    {
        name: "Steam",
        url: "/steam",
        icon: "fa-brands fa-steam"
    },
];

function createLinks() {
    linktreeElement.innerHTML = '';

    const radius = Math.min(linktreeElement.offsetWidth / 2 / 1.2, linktreeElement.offsetHeight / 2 / 1.2) - 20;
    const linkWidth = radius / 2 / 1.2;
    const centerX = linktreeElement.offsetWidth / 2;
    const centerY = linktreeElement.offsetHeight / 2;

    const linkElement = document.createElement('a');
    linkElement.className = 'link homelink';
    linkElement.href = 'https://noomstuff.com';
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.innerHTML = `<img src="img/icon.png" alt="NoomStuff Logo" style="width: 100%; height: 100%;">`;
    linkElement.style.position = 'absolute';
    linkElement.style.width = radius + 'px';
    linkElement.style.left = `${centerX}px`;
    linkElement.style.top = `${centerY}px`;
    linkElement.style.fontSize = linkWidth + 'px';
    linktreeElement.appendChild(linkElement);

    links.forEach((link, i) => {
        const angle = (2 * Math.PI / links.length) * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const linkElement = document.createElement('a');
        linkElement.className = 'link';
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.innerHTML = `<i class="${link.icon}"></i> <span>${link.name}</span>`;
        linkElement.style.position = 'absolute';
        linkElement.style.width = linkWidth + 'px';
        linkElement.style.left = `${x}px`;
        linkElement.style.top = `${y}px`;
        linkElement.style.fontSize = linkWidth / 3 + 'px';
        linktreeElement.appendChild(linkElement);
    });
}

createLinks();

window.addEventListener('resize', createLinks);