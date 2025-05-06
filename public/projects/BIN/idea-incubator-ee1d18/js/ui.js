const UI = (() => {
    const ideaModal = document.getElementById('ideaModal');
    const modalTitleEl = document.getElementById('modalTitle');
    const ideaForm = document.getElementById('ideaForm');
    const ideaIdInput = document.getElementById('ideaIdInput');
    const ideaTitleInput = document.getElementById('ideaTitleInput');
    const ideaDescriptionInput = document.getElementById('ideaDescriptionInput');
    const ideaTagsInput = document.getElementById('ideaTagsInput');
    const ideaLinkInput = document.getElementById('ideaLinkInput');
    const boardColumnsContainers = document.querySelectorAll('.board-column .idea-cards'); // Targets the containers for cards

    const openModal = (ideaToEdit = null) => {
        ideaForm.reset();
        ideaIdInput.value = '';

        if (ideaToEdit) {
            modalTitleEl.textContent = 'Edit Idea';
            ideaIdInput.value = ideaToEdit.id;
            ideaTitleInput.value = ideaToEdit.title;
            ideaDescriptionInput.value = ideaToEdit.description || '';
            ideaTagsInput.value = Array.isArray(ideaToEdit.tags) ? ideaToEdit.tags.join(', ') : '';
            ideaLinkInput.value = ideaToEdit.link || '';
        } else {
            modalTitleEl.textContent = 'Add New Idea';
        }
        ideaModal.classList.remove('hidden');
        setTimeout(() => {
            ideaModal.classList.remove('opacity-0');
            ideaModal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10); // Small delay for CSS transition
    };

    const closeModal = () => {
        ideaModal.classList.add('opacity-0');
        ideaModal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => {
            ideaModal.classList.add('hidden');
            ideaForm.reset();
            ideaIdInput.value = '';
        }, 300); // Sync with Tailwind transition duration
    };

    const createIdeaCardElement = (idea, App) => {
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
            description.classList.add('text-sm', 'text-gray-600', 'mb-2', 'break-words', 'whitespace-pre-wrap');
            description.textContent = idea.description;
            card.appendChild(description);
        }

        if (idea.tags && idea.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.classList.add('mb-2', 'flex', 'flex-wrap', 'gap-1', 'tags-container');
            idea.tags.forEach(tag => {
                if (tag.trim() === '') return;
                const tagEl = document.createElement('span');
                tagEl.classList.add('bg-blue-100', 'text-blue-700', 'text-xs', 'font-semibold', 'px-2', 'py-0.5', 'rounded-full');
                tagEl.textContent = tag.trim();
                tagsContainer.appendChild(tagEl);
            });
            if (tagsContainer.hasChildNodes()) {
                 card.appendChild(tagsContainer);
            }
        }

        if (idea.link) {
            const linkEl = document.createElement('a');
            linkEl.classList.add('text-blue-500', 'hover:text-blue-700', 'text-sm', 'hover:underline', 'block', 'truncate', 'break-all');
            linkEl.href = idea.link;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener noreferrer';
            linkEl.textContent = idea.link;
            linkEl.addEventListener('click', (e) => e.stopPropagation()); // Prevent card drag when clicking link
            card.appendChild(linkEl);
        }

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('mt-3', 'pt-2', 'border-t', 'border-gray-200', 'flex', 'justify-end', 'space-x-2');

        const editButton = document.createElement('button');
        editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 hover:text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>`;
        editButton.title = "Edit Idea";
        editButton.classList.add('p-1', 'rounded', 'hover:bg-gray-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            App.editIdea(idea.id);
        });
        actionsContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 hover:text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
        deleteButton.title = "Delete Idea";
        deleteButton.classList.add('p-1', 'rounded', 'hover:bg-gray-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-red-300');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${idea.title}"?`)) {
                App.deleteIdea(idea.id);
            }
        });
        actionsContainer.appendChild(deleteButton);
        card.appendChild(actionsContainer);

        return card;
    };

    const renderBoard = (allIdeas, App) => {
        boardColumnsContainers.forEach(columnContainer => {
            columnContainer.innerHTML = ''; // Clear existing cards
            const columnId = columnContainer.dataset.columnId;
            const columnIdeas = allIdeas.filter(idea => idea.column === columnId);

            columnIdeas.sort((a, b) => (a.order || 0) - (b.order || 0));

            columnIdeas.forEach(idea => {
                const cardElement = createIdeaCardElement(idea, App);
                columnContainer.appendChild(cardElement);
            });
        });
    };

    const filterCardsOnBoard = (searchTerm, allIdeas) => {
        const term = searchTerm.toLowerCase().trim();

        boardColumnsContainers.forEach(columnContainer => {
            const columnId = columnContainer.dataset.columnId;
            Array.from(columnContainer.children).forEach(cardElement => {
                const ideaId = cardElement.dataset.id;
                const idea = allIdeas.find(i => i.id === ideaId);

                if (!idea) { // Should not happen if board is consistent
                    cardElement.style.display = 'none';
                    return;
                }

                if (term === '') {
                    cardElement.style.display =