document.addEventListener('DOMContentLoaded', () => {
    const addIdeaForm = document.getElementById('add-idea-form');
    const ideaTitleInput = document.getElementById('idea-title');
    const ideaDescriptionInput = document.getElementById('idea-description');
    const ideaTagsInput = document.getElementById('idea-tags');
    const searchInput = document.getElementById('search-ideas');
    const filterTagsSelect = document.getElementById('filter-tags');
    const exportButton = document.getElementById('export-ideas');
    const selectedIdeaDetailsDiv = document.getElementById('selected-idea-details');
    const detailsTitle = document.getElementById('details-title');
    const detailsDescription = document.getElementById('details-description');
    const detailsTags = document.getElementById('details-tags');
    const deleteIdeaButton = document.getElementById('delete-idea');

    let currentIdeas = [];
    let selectedIdeaId = null;

    // --- Initialization ---

    function loadIdeasAndInitialize() {
        currentIdeas = IdeaStorage.getAllIdeas();
        updateTagFilterOptions();
        applyFiltersAndRenderGraph(); // Initial graph render
    }

    // --- Idea Management ---

    function handleAddIdea(event) {
        event.preventDefault();
        const title = ideaTitleInput.value.trim();
        const description = ideaDescriptionInput.value.trim();
        const tags = ideaTagsInput.value.split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag !== '');

        if (!title) {
            alert('Please enter an idea title.');
            return;
        }

        const newIdea = {
            id: `idea-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title: title,
            description: description,
            tags: tags,
            x: Math.random() * (document.getElementById('graph-container').clientWidth || 600), // Initial position
            y: Math.random() * (document.getElementById('graph-container').clientHeight || 400)
        };

        IdeaStorage.addIdea(newIdea);
        currentIdeas = IdeaStorage.getAllIdeas(); // Refresh local copy

        addIdeaForm.reset();
        updateTagFilterOptions();
        applyFiltersAndRenderGraph();
        hideSelectedIdeaDetails(); // Hide details if a new idea is added
    }

    function handleDeleteIdea() {
        if (!selectedIdeaId) return;

        if (confirm(`Are you sure you want to delete the idea: "${detailsTitle.textContent}"?`)) {
            IdeaStorage.deleteIdea(selectedIdeaId);
            currentIdeas = IdeaStorage.getAllIdeas(); // Refresh local copy
            selectedIdeaId = null; // Clear selection

            updateTagFilterOptions();
            applyFiltersAndRenderGraph();
            hideSelectedIdeaDetails();
        }
    }


    // --- Filtering and Searching ---

    function applyFiltersAndRenderGraph() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedTag = filterTagsSelect.value;

        let filteredIdeas = currentIdeas.filter(idea => {
            const matchesSearch = !searchTerm ||
                idea.title.toLowerCase().includes(searchTerm) ||
                idea.description.toLowerCase().includes(searchTerm) ||
                idea.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesTag = !selectedTag || idea.tags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });

        // Generate links based on shared tags within the *filtered* set
        const links = generateLinks(filteredIdeas);

        IdeaGraph.renderGraph(filteredIdeas, links);
    }

    function generateLinks(ideas) {
        const links = [];
        const ideasById = new Map(ideas.map(idea => [idea.id, idea]));

        for (let i = 0; i < ideas.length; i++) {
            for (let j = i + 1; j < ideas.length; j++) {
                const ideaA = ideas[i];
                const ideaB = ideas[j];
                const commonTags = ideaA.tags.filter(tag => ideaB.tags.includes(tag));

                if (commonTags.length > 0) {
                    // Check if both source and target exist in the current filtered map
                    if (ideasById.has(ideaA.id) && ideasById.has(ideaB.id)) {
                       links.push({ source: ideaA.id, target: ideaB.id, value: commonTags.length });
                    }
                }
            }
        }
        return links;
    }


    // --- UI Updates ---

    function updateTagFilterOptions() {
        const allTags = new Set();
        currentIdeas.forEach(idea => {
            idea.tags.forEach(tag => allTags.add(tag));
        });

        // Preserve current selection if possible
        const currentFilterValue = filterTagsSelect.value;

        // Clear existing options except the default "All Tags"
        filterTagsSelect.innerHTML = '<option value="">All Tags</option>';

        const sortedTags = Array.from(allTags).sort();
        sortedTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            filterTagsSelect.appendChild(option);
        });

        // Restore selection
        if (allTags.has(currentFilterValue)) {
            filterTagsSelect.value = currentFilterValue;
        } else {
             filterTagsSelect.value = ""; // Reset if the previously selected tag no longer exists
        }
    }

    function displaySelectedIdeaDetails(idea) {
        if (!idea) {
            hideSelectedIdeaDetails();
            return;
        }
        selectedIdeaId = idea.id;
        detailsTitle.textContent = idea.title;
        detailsDescription.textContent = idea.description || 'No description.';
        detailsTags.textContent = `Tags: ${idea.tags.length > 0 ? idea.tags.join(', ') : 'None'}`;
        selectedIdeaDetailsDiv.classList.remove('hidden');
    }

    function hideSelectedIdeaDetails() {
        selectedIdeaId = null;
        selectedIdeaDetailsDiv.classList.add('hidden');
        detailsTitle.textContent = '';
        detailsDescription.textContent = '';
        detailsTags.textContent = '';
    }

    // --- Export ---

    function handleExportIdeas() {
        const ideasToExport = IdeaStorage.getAllIdeas();
        if (ideasToExport.length === 0) {
            alert("No ideas to export.");
            return;
        }

        let textContent = "Idea Incubator Export\n======================\n\n";

        ideasToExport.forEach(idea => {
            textContent += `Title: ${idea.title}\n`;
            if (idea.description) {
                textContent += `Description: ${idea.description}\n`;
            }
            if (idea.tags.length > 0) {
                textContent += `Tags: ${idea.tags.join(', ')}\n`;
            }
            // Find connections (simple version: list ideas sharing tags)
            const connections = ideasToExport.filter(otherIdea =>
                otherIdea.id !== idea.id &&
                idea.tags.some(tag => otherIdea.tags.includes(tag))
            );
            if (connections.length > 0) {
                textContent += `Connected To: ${connections.map(c => c.title).join(', ')}\n`;
            }
            textContent += "\n---\n\n";
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'idea_incubator_export.txt';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // --- Event Listeners ---

    addIdeaForm.addEventListener('submit', handleAddIdea);
    searchInput.addEventListener('input', applyFiltersAndRenderGraph);
    filterTagsSelect.addEventListener('change', applyFiltersAndRenderGraph);
    exportButton.addEventListener('click', handleExportIdeas);
    deleteIdeaButton.addEventListener('click', handleDeleteIdea);

    // Listen for custom event from graph.js when a node is clicked
    document.addEventListener('ideaSelected', (event) => {
        const ideaId = event.detail.id;
        if (ideaId) {
            const selectedIdea = IdeaStorage.getIdeaById(ideaId);
            displaySelectedIdeaDetails(selectedIdea);
        } else {
            hideSelectedIdeaDetails(); // Clicked on background
        }
    });

     // Listen for custom event from graph.js when a node is dragged
    document.addEventListener('ideaMoved', (event) => {
        const { id, x, y } = event.detail;
        IdeaStorage.updateIdeaPosition(id, x, y);
        // No need to refresh local `currentIdeas` for just position update unless strictly necessary
    });


    // --- Initial Load ---
    loadIdeasAndInitialize();

});