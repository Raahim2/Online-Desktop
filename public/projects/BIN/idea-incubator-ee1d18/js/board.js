const Board = (() => {
    let draggedItem = null; // Stores the DOM element being dragged
    let draggedIdeaId = null; // Stores the ID of the idea being dragged

    function createIdeaCardElement(idea, App) {
        const card = document.createElement('div');
        card.classList.add('bg-white', 'p-3', 'rounded-md', 'shadow', 'cursor-grab', 'mb-3', 'hover:shadow-lg', 'transition-shadow', 'duration-150', 'ease-in-out', 'idea-card');
        card.setAttribute('draggable', 'true');
        card.dataset.id = idea.id;

        const title = document.createElement('h3');
        title.classList.add('font-semibold', 'text-md', 'text-gray-800', 'mb-1', 'break-words');
        title.textContent = idea.title;
        card.appendChild(title);

        if (idea.description) {
            const description = document.createElement('p');
            description