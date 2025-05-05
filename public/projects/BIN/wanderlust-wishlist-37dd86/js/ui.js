function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.classList.add(
        'destination-card', // Added class for easier selection
        'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden',
        'transition-transform', 'duration-300', 'hover:scale-105',
        'flex', 'flex-col' // Ensure content pushes buttons down
    );
    card.dataset.id = destination.id; // Set data-id attribute

    // Image
    const img = document.createElement('img');
    img.src = destination.imageUrl || 'assets/placeholder.jpg'; // Use placeholder if no image
    img.alt = `Image of ${destination.name}`;
    img.classList.add('w-full', 'h-48', 'object-cover');
    // Handle image loading errors gracefully
    img.onerror = () => {
        img.src = 'assets/placeholder.jpg'; // Fallback to placeholder on error
        img.alt = 'Placeholder image';
    };
    card.appendChild(img);

    // Content Container
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('p-4', 'flex', 'flex-col', 'flex-grow'); // flex-grow to push buttons down
    card.appendChild(contentDiv);

    // Name
    const nameH3 = document.createElement('h3');
    nameH3.textContent = destination.name;
    nameH3.classList.add('text-xl', 'font-semibold', 'mb-2', 'text-gray-800');
    contentDiv.appendChild(nameH3);

    // Category
    const categoryP = document.createElement('p');
    categoryP.classList.add('text-gray-600', 'text-sm', 'mb-3');
    categoryP.innerHTML = `Category: <span class="font-medium">${destination.category || 'Uncategorized'}</span>`;
    contentDiv.appendChild(categoryP);

    // Description
    const descriptionP = document.createElement('p');
    descriptionP.textContent = destination.description || 'No description provided.';
    descriptionP.classList.add('text-gray-700', 'text-sm', 'mb-4', 'line-clamp-3', 'flex-grow'); // flex-grow description
    contentDiv.appendChild(descriptionP);

     // Activities (if any)
    if (destination.activities && destination.activities.length > 0) {
        const activitiesDiv = document.createElement('div');
        activitiesDiv.classList.add('mb-3');

        const activitiesH4 = document.createElement('h4');
        activitiesH4.textContent = 'Activities:';
        activitiesH4.classList.add('text-sm', 'font-semibold', 'text-gray-700', 'mb-1');
        activitiesDiv.appendChild(activitiesH4);

        const activitiesUl = document.createElement('ul');
        activitiesUl.classList.add('list-disc', 'list-inside', 'text-sm', 'text-gray-600', 'space-y-1');
        destination.activities.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = activity;
            activitiesUl.appendChild(li);
        });
        activitiesDiv.appendChild(activitiesUl);
        contentDiv.appendChild(activitiesDiv); // Append activities before buttons
    }


    // Button Container (at the bottom)
    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('flex', 'justify-between', 'items-center', 'mt-auto', 'pt-4'); // mt-auto pushes to bottom, pt-4 adds space
    contentDiv.appendChild(buttonDiv); // Append to contentDiv, not card directly

    // Mark Visited Button
    const visitedBtn = document.createElement('button');
    visitedBtn.classList.add(
        'mark-visited-btn', 'text-sm', 'px-3', 'py-1', 'rounded', 'transition-colors',
        'focus:outline-none', 'focus:ring-2', 'focus:ring-opacity-75'
    );
    if (destination.visited) {
        visitedBtn.textContent = 'Visited';
        visitedBtn.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600', 'focus:ring-green-400');
        // Optionally add a checkmark icon
        // visitedBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Visited';
    } else {
        visitedBtn.textContent = 'Mark Visited';
        visitedBtn.classList.add('bg-gray-300', 'text-gray-700', 'hover:bg-gray-400', 'focus:ring-gray-400');
    }
    buttonDiv.appendChild(visitedBtn);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    // Optionally add a trash icon
    // deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.classList.add(
        'delete-btn', 'text-sm', 'px-3', 'py-1', 'rounded', 'bg-red-500', 'text-white',
        'hover:bg-red-600', 'focus:outline-none', 'focus:ring-2', 'focus:ring-red-400',
        'focus:ring-opacity-75'
    );
    buttonDiv.appendChild(deleteBtn);


    return card;
}

function renderDestinations(destinations, containerElement) {
    if (!containerElement) {
        console.error("Container element not found for rendering destinations.");
        return;
    }
    // Clear previous destinations
    containerElement.innerHTML = '';

    if (destinations && destinations.length > 0) {
        destinations.forEach(destination => {
            const cardElement = createDestinationCard(destination);
            containerElement.appendChild(cardElement);
        });
    }
    // The 'no destinations' message is handled in script.js
}


function clearForm(formElement) {
     if (formElement && typeof formElement.reset === 'function') {
        formElement.reset();
        // Manually clear any fields not reset by default if needed
        // e.g., hidden inputs or custom components
    } else if (formElement) {
         // Fallback for non-form elements or basic clearing
         const inputs = formElement.querySelectorAll('input, textarea, select');
         inputs.forEach(input => {
             if (input.type === 'checkbox' || input.type === 'radio') {
                 input.checked = false;
             } else if (input.tagName === 'SELECT') {
                 input.selectedIndex = 0; // Reset select to the first option
             }
              else {
                 input.value = '';
             }
         });
    }
}