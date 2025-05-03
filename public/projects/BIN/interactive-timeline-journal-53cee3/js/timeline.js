const Timeline = (() => {

    const timelineEntriesContainer = document.getElementById('timeline-entries');

    const createTimelineItemElement = (entry) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('timeline-item', 'flex-shrink-0');
        itemDiv.setAttribute('data-entry-id', entry.id); // Add data attribute for potential future use

        const dotDiv = document.createElement('div');
        dotDiv.classList.add('timeline-dot');

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('bg-gray-50', 'p-4', 'rounded-lg', 'shadow', 'border', 'border-gray-200', 'w-64', 'md:w-72'); // Responsive width

        const timeElement = document.createElement('time');
        timeElement.classList.add('text-sm', 'font-semibold', 'text-indigo-600', 'block', 'mb-1');
        timeElement.dateTime = entry.date;
        timeElement.textContent = entry.date; // Consider formatting date if needed

        const titleElement = document.createElement('h3');
        titleElement.classList.add('text-lg', 'font-bold', 'mt-1', 'mb-2', 'text-gray-800');
        titleElement.textContent = entry.title;

        cardDiv.appendChild(timeElement);
        cardDiv.appendChild(titleElement);

        if (entry.image) {
            const imgElement = document.createElement('img');
            imgElement.src = entry.image; // Assumes base64 or valid URL
            imgElement.alt = entry.title; // Use title as alt text
            imgElement.classList.add('my-2', 'rounded', 'max-h-32', 'w-full', 'object-cover');
            cardDiv.appendChild(imgElement);
        }

        if (entry.description) {
            const descriptionElement = document.createElement('p');
            descriptionElement.classList.add('text-sm', 'text-gray-600', 'mb-3');
            // Basic sanitization: replace potential HTML tags with entities to prevent XSS
            descriptionElement.textContent = entry.description;
            cardDiv.appendChild(descriptionElement);
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('flex', 'justify-end', 'space-x-2', 'mt-2');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn', 'text-sm', 'text-blue-500', 'hover:text-blue-700', 'font-medium');
        editButton.textContent = 'Edit';
        editButton.setAttribute('data-id', entry.id);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn', 'text-sm', 'text-red-500', 'hover:text-red-700', 'font-medium');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('data-id', entry.id);

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        cardDiv.appendChild(buttonContainer);

        itemDiv.appendChild(dotDiv);
        itemDiv.appendChild(cardDiv);

        return itemDiv;
    };

    const renderTimeline = (entries) => {
        if (!timelineEntriesContainer) {
            console.error("Timeline container not found!");
            return;
        }

        // Clear existing entries
        timelineEntriesContainer.innerHTML = '';

        // Sort entries by date (ascending) before rendering
        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedEntries.length === 0) {
            // Message handled by UI.js
            return;
        }

        // Create and append each entry element
        sortedEntries.forEach(entry => {
            const entryElement = createTimelineItemElement(entry);
            timelineEntriesContainer.appendChild(entryElement);
        });
    };

    return {
        renderTimeline
    };

})();