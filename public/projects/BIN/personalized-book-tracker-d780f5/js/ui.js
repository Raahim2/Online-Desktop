const UI = (() => {

    const createBookCard = (book) => {
        const card = document.createElement('div');
        card.className = 'book-card bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-start border border-gray-200';
        card.dataset.bookId = book.id;

        // Cover Image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'flex-shrink-0 w-20 h-28 sm:w-24 sm:h-36 bg-gray-200 rounded overflow-hidden flex items-center justify-center';
        const img = document.createElement('img');
        img.src = book.cover || 'https://via.placeholder.com/100x150.png?text=No+Cover'; // Placeholder
        img.alt = `Cover of ${book.title}`;
        img.className = 'object-cover w-full h-full';
        imgContainer.appendChild(img);

        // Book Details
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'flex-grow';

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-gray-800';
        title.textContent = book.title;

        const author = document.createElement('p');
        author.className = 'text-sm text-gray-600 mb-2';
        author.textContent = `by ${book.author}`;

        // Progress
        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-2';
        const progressBar = document.createElement('div');
        const percentage = book.totalPages > 0 ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100)) : 0;
        progressBar.className = 'bg-blue-600 h-2.5 rounded-full';
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressContainer.appendChild(progressBar);

        const progressText = document.createElement('p');
        progressText.className = 'text-xs text-gray-500 mt-1';
        progressText.textContent = `${book.pagesRead} / ${book.totalPages} pages (${percentage}%)`;


        // Status Badge
        const statusBadge = document.createElement('span');
        statusBadge.className = 'inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2';
        statusBadge.textContent = book.status.charAt(0).toUpperCase() + book.status.slice(1); // Capitalize
        switch (book.status) {
            case 'completed':
                statusBadge.classList.add('bg-green-100', 'text-green-800');
                break;
            case 'reading':
                statusBadge.classList.add('bg-blue-100', 'text-blue-800');
                break;
            case 'unread':
                statusBadge.classList.add('bg-gray-100', 'text-gray-800');
                break;
        }

        detailsContainer.appendChild(title);
        detailsContainer.appendChild(author);
        detailsContainer.appendChild(statusBadge);
        detailsContainer.appendChild(progressContainer);
        detailsContainer.appendChild(progressText);


        // Action Buttons
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex-shrink-0 flex flex-col sm:items-end gap-2 mt-4 sm:mt-0';

        const toggleReadButton = document.createElement('button');
        toggleReadButton.className = 'toggle-read-status-btn text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100';
        if (book.status === 'unread') {
            toggleReadButton.innerHTML = '<i class="fas fa-book-open mr-1"></i> Start Reading';
            toggleReadButton.classList.add('text-blue-600');
        } else {
            toggleReadButton.innerHTML = '<i class="fas fa-book mr-1"></i> Mark as Unread';
             toggleReadButton.classList.add('text-gray-600');
        }
         // Add specific 'Mark as Read' button only if not completed
        if (book.status !== 'completed') {
            const markReadButton = document.createElement('button');
            markReadButton.className = 'mark-read-btn text-xs px-2 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50';
            markReadButton.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Mark as Read';
            actionsContainer.appendChild(markReadButton);
        }


        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-book-btn text-xs px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> Delete';


        actionsContainer.appendChild(toggleReadButton);
        actionsContainer.appendChild(deleteButton);


        card.appendChild(imgContainer);
        card.appendChild(detailsContainer);
        card.appendChild(actionsContainer);

        return card;
    };

    const displayBooks = (container, books) => {
        container.innerHTML = ''; // Clear existing books
        if (books.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No books match the current filter, or no books added yet.</p>';
            return;
        }
        books.forEach(book => {
            const bookCard = createBookCard(book);
            container.appendChild(bookCard);
        });
    };

     const addBookToDOM = (container, book) => {
        // Remove the 'no books' message if it exists
        const noBooksMessage = container.querySelector('p.italic');
        if (noBooksMessage && noBooksMessage.textContent.includes('No books added yet')) {
            noBooksMessage.remove();
        }
         // Or if it's the only message left after filtering
         if (container.innerHTML.includes('No books match the current filter')) {
             container.innerHTML = '';
         }

        const bookCard = createBookCard(book);
        // Prepend or append based on preference, prepend feels more natural for new items
        container.prepend(bookCard);
    };


    const populateBookSelect = (selectElement, books) => {
        // Preserve the first "Select a book..." option
        const firstOption = selectElement.options[0];
        selectElement.innerHTML = ''; // Clear existing options
        selectElement.appendChild(firstOption); // Re-add the placeholder

        // Add only books that are not completed
        books
            .filter(book => book.status !== 'completed') // Only allow logging for unread or reading books
            .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically
            .forEach(book => {
                addBookOption(selectElement, book);
            });
         firstOption.selected = true; // Ensure placeholder is selected initially
    };

    const addBookOption = (selectElement, book) => {
         if (book.status !== 'completed') { // Ensure we only add non-completed books
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (by ${book.author})`;
            selectElement.appendChild(option);
        }
    };

    const removeBookOption = (selectElement, bookId) => {
        const optionToRemove = selectElement.querySelector(`option[value="${bookId}"]`);
        if (optionToRemove) {
            optionToRemove.remove();
        }
    };


    const displayReadingHistory = (container, history, books) => {
        container.innerHTML = ''; // Clear existing history
        if (history.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No reading sessions logged yet.</p>';
            return;
        }

        // Sort history newest first
        const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedHistory.forEach(log => {
            const book = books.find(b => b.id === log.bookId);
            const bookTitle = book ? book.title : 'Unknown Book (deleted?)';
            const logDate = new Date(log.date);
            // More readable date format
            const formattedDate = logDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });


            const historyItem = document.createElement('div');
            historyItem.className = 'py-1 border-b border-gray-200 last:border-b-0';
            historyItem.innerHTML = `
                <span class="text-gray-800">${formattedDate}:</span>
                <span class="text-blue-600 font-medium">${log.pagesRead} pages</span>
                <span class="text-gray-600">of "${bookTitle}"</span>
            `;
            container.appendChild(historyItem);
        });
    };

    const updateGoalDisplay = (goalSpan, goalInput, goals) => {
        if (goals && goals.weeklyPages) {
            goalSpan.textContent = `${goals.weeklyPages}`;
            goalInput.value = goals.weeklyPages; // Keep input in sync
        } else {
            goalSpan.textContent = 'Not set';
             goalInput.value = ''; // Clear input if no goal is set
        }
    };


    return {
        displayBooks,
        addBookToDOM,
        populateBookSelect,
        addBookOption,
        removeBookOption,
        displayReadingHistory,
        updateGoalDisplay
    };

})();