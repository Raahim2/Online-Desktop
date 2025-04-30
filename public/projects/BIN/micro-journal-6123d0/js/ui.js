const UI = (() => {

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        // Handle potential invalid date strings gracefully
        try {
            const date = new Date(dateString);
            if (isNaN(date)) {
                return "Invalid Date";
            }
            return date.toLocaleDateString(undefined, options);
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Date Error";
        }
    };

    const createEntryElement = (entry) => {
        const div = document.createElement('div');
        div.className = 'p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-200';
        div.setAttribute('data-entry-id', entry.id);

        // Sanitize text content before inserting to prevent XSS
        const textParagraph = document.createElement('p');
        textParagraph.className = 'text-gray-700 mb-2 whitespace-pre-wrap break-words';
        textParagraph.textContent = entry.text; // Use textContent for safety

        const moodSpan = entry.mood ? `<span class="text-xl mr-2" title="Mood: ${entry.mood}">${entry.mood}</span>` : '<span class="text-sm text-gray-400 italic mr-2">(No mood)</span>';

        div.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-500">${formatDate(entry.date)}</span>
                <div>
                    ${moodSpan}
                    <button class="edit-entry-button text-blue-500 hover:text-blue-700 text-sm px-2 py-1 transition duration-150 ease-in-out" data-id="${entry.id}" title="Edit Entry">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-entry-button text-red-500 hover:text-red-700 text-sm px-2 py-1 transition duration-150 ease-in-out" data-id="${entry.id}" title="Delete Entry">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            ${textParagraph.outerHTML}
        `;
        return div;
    };

    const displayEntries = (entries, container) => {
        container.innerHTML = ''; // Clear existing entries
        const noEntriesMessage = document.getElementById('no-entries-message');

        if (entries.length === 0) {
            if (noEntriesMessage) noEntriesMessage.style.display = 'block';
        } else {
             if (noEntriesMessage) noEntriesMessage.style.display = 'none';
            // Sort entries by date, newest first (redundant if storage sorts, but safe)
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            entries.forEach(entry => {
                const entryElement = createEntryElement(entry);
                container.appendChild(entryElement);
            });
        }
    };

    const clearEditor = (textarea, moodInput, wordCountDisplay, moodButtons, dateDisplay) => {
        textarea.value = '';
        moodInput.value = '';
        wordCountDisplay.textContent = '0 words';
        moodButtons.forEach(btn => btn.classList.remove('mood-selected'));
        updateDateDisplay(dateDisplay); // Reset date to today
        textarea.focus();
    };

    const updateWordCount = (textarea, displayElement) => {
        const text = textarea.value.trim();
        const words = text === '' ? 0 : text.split(/\s+/).length;
        displayElement.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    };

    const selectMood = (mood, moodInput, moodButtons) => {
        moodInput.value = mood;
        moodButtons.forEach(btn => {
            if (btn.getAttribute('data-mood') === mood) {
                btn.classList.add('mood-selected');
            } else {
                btn.classList.remove('mood-selected');
            }
        });
    };

    const showAlert = (message, type = 'info', container = document.body, duration = 3000) => {
        const alertDiv = document.createElement('div');
        let bgColor, textColor;

        switch (type) {
            case 'success':
                bgColor = 'bg-green-100';
                textColor = 'text-green-700';
                break;
            case 'warning':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-700';
                break;
            case 'error':
                bgColor = 'bg-red-100';
                textColor = 'text-red-700';
                break;
            default: // info
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-700';
        }

        alertDiv.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-sm font-medium ${bgColor} ${textColor} z-50 transition-opacity duration-300 ease-in-out opacity-0`;
        alertDiv.textContent = message;

        // Append alert to the specified container or body
        const appendTarget = container || document.body;
        // Ensure the target can host positioned elements if it's not body
        if (appendTarget !== document.body && getComputedStyle(appendTarget).position === 'static') {
             appendTarget.style.position = 'relative';
        }
        appendTarget.appendChild(alertDiv);

        // Fade in
        requestAnimationFrame(() => {
            alertDiv.style.opacity = '1';
        });


        // Remove the alert after the duration
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                 if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                 }
            }, 300); // Wait for fade out transition
        }, duration);
    };


    const formatEntriesForExport = (entries) => {
        // Sort entries chronologically for export
        entries.sort((a, b) => new Date(a.date) - new Date(b.date));

        return entries.map(entry => {
            const dateStr = formatDate(entry.date);
            const moodStr = entry.mood ? `Mood: ${entry.mood}` : 'Mood: (None)';
            return `--------------------\nDate: ${dateStr}\n${moodStr}\n\n${entry.text}\n--------------------\n`;
        }).join('\n');
    };

    const triggerDownload = (data, filename) => {
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");

        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    };

    const updateDateDisplay = (dateDisplayElement, date = new Date()) => {
         const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
         try {
             if (isNaN(date)) date = new Date(); // Fallback to today if date is invalid
             dateDisplayElement.textContent = `Entry for ${date.toLocaleDateString(undefined, options)}`;
         } catch (e) {
             console.error("Error updating date display:", e);
             dateDisplayElement.textContent = "Today's Entry"; // Fallback text
         }
    };


    // Public API
    return {
        displayEntries,
        clearEditor,
        updateWordCount,
        selectMood,
        showAlert,
        formatEntriesForExport,
        triggerDownload,
        updateDateDisplay,
        formatDate // Expose if needed elsewhere, though primarily internal
    };
})();