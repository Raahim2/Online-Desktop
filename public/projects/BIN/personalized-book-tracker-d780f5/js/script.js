document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const addBookForm = document.getElementById('add-book-form');
    const logSessionForm = document.getElementById('log-session-form');
    const setGoalsForm = document.getElementById('set-goals-form');
    const bookListContainer = document.getElementById('book-list');
    const sessionBookSelect = document.getElementById('session-book-select');
    const readingHistoryList = document.getElementById('reading-history-list');
    const searchInput = document.getElementById('search-input');
    const filterStatusSelect = document.getElementById('filter-status');
    const currentGoalSpan = document.getElementById('current-goal');
    const goalInput = document.getElementById('goal-pages-per-week');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const chartTypeSelect = document.getElementById('chart-type-select');

    // --- State ---
    let books = Storage.loadBooks();
    let readingHistory = Storage.loadReadingHistory();
    let goals = Storage.loadGoals();

    // --- Initialization ---
    function initializeApp() {
        UI.populateBookSelect(sessionBookSelect, books);
        UI.displayBooks(bookListContainer, books);
        UI.displayReadingHistory(readingHistoryList, readingHistory, books);
        UI.updateGoalDisplay(currentGoalSpan, goalInput, goals);
        updateCharts(); // Initial chart render
        setupEventListeners();
    }

    // --- Event Handlers ---
    function handleAddBook(event) {
        event.preventDefault();
        const title = event.target['book-title'].value.trim();
        const author = event.target['book-author'].value.trim();
        const totalPages = parseInt(event.target['book-pages'].value, 10);
        const cover = event.target['book-cover'].value.trim();

        if (title && author && totalPages > 0) {
            const newBook = {
                id: `book-${Date.now()}`, // Simple unique ID
                title,
                author,
                totalPages,
                pagesRead: 0,
                status: 'unread', // 'unread', 'reading', 'completed'
                cover: cover || null, // Use null if empty
                addedDate: new Date().toISOString(),
            };
            books.push(newBook);
            Storage.saveBooks(books);
            UI.addBookToDOM(bookListContainer, newBook); // Add directly instead of full refresh
            UI.addBookOption(sessionBookSelect, newBook);
            event.target.reset();
            filterAndDisplayBooks(); // Re-apply filters if needed
        } else {
            alert('Please fill in Title, Author, and a valid Total Pages.');
        }
    }

    function handleLogSession(event) {
        event.preventDefault();
        const bookId = event.target['session-book-select'].value;
        const pagesRead = parseInt(event.target['session-pages-read'].value, 10);
        const book = books.find(b => b.id === bookId);

        if (book && pagesRead > 0) {
            const previousPagesRead = book.pagesRead;
            book.pagesRead += pagesRead;

            // Prevent reading more pages than total
            if (book.pagesRead > book.totalPages) {
                book.pagesRead = book.totalPages;
            }

            const actualPagesLogged = book.pagesRead - previousPagesRead; // Pages actually added in this session

            if (actualPagesLogged <= 0) {
                 alert("No new pages logged. Either the book is finished or the input was invalid relative to current progress.");
                 event.target.reset();
                 return; // Don't log if no pages were actually added
            }


            book.status = book.pagesRead >= book.totalPages ? 'completed' : 'reading';

            const sessionLog = {
                id: `log-${Date.now()}`,
                bookId: book.id,
                pagesRead: actualPagesLogged, // Log only the pages read in this session
                date: new Date().toISOString(),
            };

            readingHistory.push(sessionLog);

            Storage.saveBooks(books);
            Storage.saveReadingHistory(readingHistory);

            UI.displayReadingHistory(readingHistoryList, readingHistory, books);
            filterAndDisplayBooks(); // Update book card in the list
            updateCharts();
            event.target.reset();
             // Re-populate select in case status changed affecting filters elsewhere
            UI.populateBookSelect(sessionBookSelect, books);

        } else if (!book) {
             alert('Please select a valid book.');
        }
         else {
            alert('Please enter a valid number of pages read (must be greater than 0).');
        }
    }

    function handleSetGoal(event) {
        event.preventDefault();
        const pagesPerWeek = parseInt(event.target['goal-pages-per-week'].value, 10);

        if (!isNaN(pagesPerWeek) && pagesPerWeek > 0) {
            goals.weeklyPages = pagesPerWeek;
            Storage.saveGoals(goals);
            UI.updateGoalDisplay(currentGoalSpan, goalInput, goals);
            // Optionally, update charts or UI elements related to goals
        } else if (event.target['goal-pages-per-week'].value === '' || pagesPerWeek === 0) {
            // Allow clearing the goal
            goals.weeklyPages = null;
            Storage.saveGoals(goals);
            UI.updateGoalDisplay(currentGoalSpan, goalInput, goals);
        }
         else {
            alert('Please enter a valid positive number for the weekly page goal.');
        }
    }

    function handleBookListActions(event) {
        const target = event.target;
        const bookCard = target.closest('.book-card');
        if (!bookCard) return;

        const bookId = bookCard.dataset.bookId;

        // Delete Button
        if (target.classList.contains('delete-book-btn') || target.closest('.delete-book-btn')) {
            if (confirm(`Are you sure you want to delete the book "${books.find(b => b.id === bookId)?.title}"? This cannot be undone.`)) {
                // Remove associated reading history
                readingHistory = readingHistory.filter(log => log.bookId !== bookId);
                Storage.saveReadingHistory(readingHistory);

                // Remove book
                books = books.filter(book => book.id !== bookId);
                Storage.saveBooks(books);

                // Update UI
                bookCard.remove();
                UI.removeBookOption(sessionBookSelect, bookId);
                UI.displayReadingHistory(readingHistoryList, readingHistory, books); // Refresh history display
                updateCharts();
                // If the deleted book was the only one, show the "no books" message
                if (books.length === 0) {
                    UI.displayBooks(bookListContainer, books);
                }
            }
        }

        // Mark as Read Button (Example - could be more sophisticated)
        if (target.classList.contains('mark-read-btn') || target.closest('.mark-read-btn')) {
            const book = books.find(b => b.id === bookId);
            if (book && book.status !== 'completed') {
                book.pagesRead = book.totalPages;
                book.status = 'completed';
                Storage.saveBooks(books);
                filterAndDisplayBooks(); // Update UI
                updateCharts();
            }
        }

         // Mark as Unread / Reading Button (Toggle)
        if (target.classList.contains('toggle-read-status-btn') || target.closest('.toggle-read-status-btn')) {
            const book = books.find(b => b.id === bookId);
            if (book) {
                if (book.status === 'completed' || book.status === 'reading') {
                    book.pagesRead = 0;
                    book.status = 'unread';
                } else if (book.status === 'unread') {
                    // Set to reading - doesn't log pages, just changes status
                    book.status = 'reading';
                }
                Storage.saveBooks(books);
                filterAndDisplayBooks(); // Update UI
                updateCharts();
            }
        }
    }

    function handleExport(format) {
        const dataStr = format === 'json'
            ? JSON.stringify({ books, readingHistory, goals }, null, 2)
            : convertToCSV(books, readingHistory); // Assuming a helper function convertToCSV exists

        if (!dataStr) return; // Handle case where CSV conversion fails or is empty

        const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `book_tracker_data.${format}`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function convertToCSV(booksData, historyData) {
        // Basic CSV conversion - can be expanded
        let csv = 'Books\nID,Title,Author,TotalPages,PagesRead,Status,CoverURL,AddedDate\n';
        booksData.forEach(b => {
            csv += `${b.id},"${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}",${b.totalPages},${b.pagesRead},${b.status},${b.cover || ''},${b.addedDate}\n`;
        });

        csv += '\nReading History\nLogID,BookID,PagesRead,Date\n';
        historyData.forEach(h => {
            csv += `${h.id},${h.bookId},${h.pagesRead},${h.date}\n`;
        });
        return csv;
    }


    // --- Utility Functions ---
    function filterAndDisplayBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;

        const filteredBooks = books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) || book.author.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        UI.displayBooks(bookListContainer, filteredBooks);
    }

    function updateCharts() {
        const selectedChart = chartTypeSelect.value;
        Charts.renderChart(selectedChart, books, readingHistory);
    }


    // --- Event Listener Setup ---
    function setupEventListeners() {
        addBookForm.addEventListener('submit', handleAddBook);
        logSessionForm.addEventListener('submit', handleLogSession);
        setGoalsForm.addEventListener('submit', handleSetGoal);

        searchInput.addEventListener('input', filterAndDisplayBooks);
        filterStatusSelect.addEventListener('change', filterAndDisplayBooks);

        bookListContainer.addEventListener('click', handleBookListActions);

        exportCsvBtn.addEventListener('click', () => handleExport('csv'));
        exportJsonBtn.addEventListener('click', () => handleExport('json'));

        chartTypeSelect.addEventListener('change', updateCharts);
    }

    // --- Start the app ---
    initializeApp();

});