parentElements = document.querySelectorAll('.mobile-hover');

parentElements.forEach(parent => {
    parent.addEventListener('click', () => {
        parent.classList.toggle('triggered');
    });
});