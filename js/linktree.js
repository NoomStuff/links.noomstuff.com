const linktreeElement = document.getElementById('linktree');

linktreeElement.style.position = 'relative';

const importantLinks = [
    {
        name: "YouTube",
        url: "/youtube",
        icon: "fa-brands fa-youtube"
    },
    {
        name: "Itch.io",
        url: "/itch",
        icon: "fa-brands fa-itch-io"
    },
    {
        name: "Bluesky",
        url: "/bluesky",
        icon: "fa-brands fa-bluesky"
    },
    {
        name: "Linktree",
        url: "/linktreesite",
        icon: "fa-brands fa-linktree"
    },
    {
        name: "Instagram",
        url: "/instagram",
        icon: "fa-brands fa-instagram"
    },
    {
        name: "GitHub",
        url: "/github",
        icon: "fa-brands fa-github"
    },
    {
        name: "Discord",
        url: "/discordprofile",
        icon: "fa-brands fa-discord"
    },

];

const links = [
    {
        name: "Artfight",
        url: "/artfight",
        icon: "fa-solid fa-paintbrush"
    },
    {
        name: "Cara",
        url: "/cara",
        icon: "fa-solid fa-c"
    },
    {
        name: "Facebook",
        url: "/facebook",
        icon: "fa-brands fa-facebook"
    },
    {
        name: "Gamejolt",
        url: "/gamejolt",
        icon: "fa-solid fa-bolt"
    },
    {
        name: "Neocities",
        url: "/neocities",
        icon: "fa-solid fa-globe"
    },
    {
        name: "Newgrounds",
        url: "/newgrounds",
        icon: "fa-solid fa-snowplow"
    },
    {
        name: "Reddit",
        url: "/reddit",
        icon: "fa-brands fa-reddit"
    },
    {
        name: "Roblox",
        url: "/roblox",
        icon: "fa-brands fa-jira"
    },
    {
        name: "Scratch",
        url: "/scratch",
        icon: "fa-brands fa-stripe-s"
    },
    {
        name: "SoundCloud",
        url: "/soundcloud",
        icon: "fa-brands fa-soundcloud"
    },
    {
        name: "Spotify",
        url: "/spotify",
        icon: "fa-brands fa-spotify"
    },
    {
        name: "Steam",
        url: "/steamprofile",
        icon: "fa-brands fa-steam"
    },
    {
        name: "Threads",
        url: "/threads",
        icon: "fa-brands fa-threads"
    },
    {
        name: "TikTok",
        url: "/tiktok",
        icon: "fa-brands fa-tiktok"
    },
    {
        name: "Twitch",
        url: "/twitch",
        icon: "fa-brands fa-twitch"
    },
    {
        name: "Twitter (X)",
        url: "/twitter",
        icon: "fa-brands fa-twitter"
    },
];

let hasPlayed = false;

function createLinks() {
    linktreeElement.innerHTML = '';

    const containerRadius = Math.min(linktreeElement.offsetWidth, linktreeElement.offsetHeight) / 2.05;
    const centerX = linktreeElement.offsetWidth / 2;
    const centerY = linktreeElement.offsetHeight / 2;
    const linkWidth = (2 * containerRadius * Math.sin(Math.PI / links.length)) / (1 + Math.sin(Math.PI / links.length));
    const radius = containerRadius - linkWidth / 2;
    let importantLinkWidth = Math.max(8, 2 * radius * Math.sin(Math.PI / importantLinks.length));
    let importantLinkRadius = radius - (linkWidth + importantLinkWidth) / 2;
    for (let i = 0; i < importantLinks.length; i++) {
        importantLinkWidth = 2 * importantLinkRadius * Math.sin(Math.PI / importantLinks.length);
        importantLinkRadius = radius - (linkWidth + importantLinkWidth) / 2;
    }
    const homeRadius = Math.max(8, importantLinkRadius - importantLinkWidth / 2);
    const homeDiameter = homeRadius * 2;

    const linkElement = document.createElement('a');
    linkElement.className = 'link home-link';
    linkElement.href = '/';
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.innerHTML = `<img src="img/profile.png" alt="NoomStuff Logo" style="width: 100%; height: 100%;"> <span>Website</span>`;
    linkElement.style.position = 'absolute';
    linkElement.style.width = homeDiameter + 'px';
    linkElement.style.height = homeDiameter + 'px';
    linkElement.style.left = `${centerX}px`;
    linkElement.style.top = `${centerY}px`;
    linkElement.style.fontSize = homeDiameter / 3 + 'px';
    if (!hasPlayed) linkElement.classList.add('bubble-animate');
    linktreeElement.appendChild(linkElement);

    importantLinks.forEach((link, i) => {
        setTimeout(() => {
            const angle = (2 * Math.PI / importantLinks.length) * i - Math.PI / 2;
            const x = centerX + importantLinkRadius * Math.cos(angle);
            const y = centerY + importantLinkRadius * Math.sin(angle);

            const linkElement = document.createElement('a');
            linkElement.className = 'link important-link';
            linkElement.href = link.url;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.innerHTML = `<i class="${link.icon}"></i> <span>${link.name}</span>`;
            linkElement.style.position = 'absolute';
            linkElement.style.width = importantLinkWidth + 'px';
            linkElement.style.height = importantLinkWidth + 'px';
            linkElement.style.left = `${x}px`;
            linkElement.style.top = `${y}px`;
            linkElement.style.fontSize = importantLinkWidth / 3 + 'px';
            if (!hasPlayed) linkElement.classList.add('bubble-animate');
            linktreeElement.appendChild(linkElement);
        }, i * (hasPlayed ? 0 : 50));
    });

    links.forEach((link, i) => {
        setTimeout(() => {
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
            if (!hasPlayed) linkElement.classList.add('bubble-animate');
            linktreeElement.appendChild(linkElement);
        }, (importantLinks.length + i) * (hasPlayed ? 0 : 50));
    });

    mobileText = document.createElement('p');
    linktreeElement.appendChild(mobileText);
    mobileText.id = 'mobile-text';
    mobileText.innerText = 'Tap to show labels';
}


createLinks();

window.addEventListener('resize', () =>
{
    hasPlayed = true;
    createLinks();
});