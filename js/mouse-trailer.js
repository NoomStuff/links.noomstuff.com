const style = document.createElement("style");
style.textContent = `
        .mouse-trailer-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            overflow: hidden;
        }

        .mouse-trailer {
            position: absolute;
            pointer-events: none;
            border-radius: 50%;
            z-index: 1;
            background: linear-gradient(120deg, var(--primary-color, #f73878), var(--secondary-color, #5c00dd));

            animation: mouse-trailer 10s infinite linear;
        }

        @keyframes mouse-trailer {
            0% {
                transform: rotateZ(0deg) scale(1, 1);
            }

            50% {
                transform: rotateZ(360deg) scale(1, 1.5);
            }

            100% {
                transform: rotateZ(720deg) scale(1, 1);
            }
        }
    `;
document.head.appendChild(style);


const trailerContainer = document.createElement('div');
trailerContainer.className = 'mouse-trailer-container';
trailerContainer.style.filter = 'blur(' + Math.min(screen.width, screen.height) * 0.25 + 'px)';
document.body.appendChild(trailerContainer);

const trailerElement = document.createElement('div');
trailerElement.className = 'mouse-trailer';

const trailerSize = Math.min(screen.width, screen.height) * 0.35;
trailerElement.style.width = trailerSize + 'px';
trailerElement.style.height = trailerSize + 'px';

trailerContainer.appendChild(trailerElement);

let targetX = window.innerWidth / 2 - trailerElement.offsetWidth / 2;
let targetY = window.innerHeight / 2 - trailerElement.offsetHeight / 2;
let currentX = targetX;
let currentY = targetY;

trailerElement.style.left = `${currentX}px`;
trailerElement.style.top = `${currentY}px`;

let mouseTimeout;

document.body.addEventListener('pointermove', (event) => 
{
    clearTimeout(mouseTimeout);

    targetX = event.clientX - trailerElement.offsetWidth / 2;
    targetY = event.clientY - trailerElement.offsetHeight / 2;

    mouseTimeout = setTimeout(moveToCenter, 5000);
});

function moveToCenter() 
{
    targetX = window.innerWidth / 2 - trailerElement.offsetWidth / 2;
    targetY = window.innerHeight / 2 - trailerElement.offsetHeight / 2;
}

function animate() 
{
    currentX += (targetX - currentX) * 0.02;
    currentY += (targetY - currentY) * 0.02;

    trailerElement.style.left = `${currentX}px`;
    trailerElement.style.top = `${currentY}px`;

    requestAnimationFrame(animate);
}

animate();
