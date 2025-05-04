const Charts = (() => {
    let currentChartInstance = null;
    const chartCanvas = document.getElementById('readingChart');

    if (!chartCanvas) {
        console.error("Chart canvas element with ID 'readingChart' not found.");
        // Return a dummy object if canvas isn't found to prevent errors elsewhere
        return {
            renderChart: () => {}
        };
    }

    const ctx = chartCanvas.getContext('2d');

    const destroyCurrentChart = () => {
        if (currentChartInstance) {
            currentChartInstance.destroy();
            currentChartInstance = null;
        }
    };

    // --- Data Preparation Functions ---

    const preparePagesPerDayData = (history, days = 7) => {
        const labels = [];
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of the day

        const dailyPages = {}; // Store pages read per day { 'YYYY-MM-DD': pages }

        // Initialize last 'days' days
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            labels.unshift(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })); // Format like 'Jan 5'
            dailyPages[dateString] = 0;
        }

        // Aggregate pages from history
        history.forEach(log => {
            const logDate = new Date(log.date);
            const logDateString = logDate.toISOString().split('T')[0];

            if (dailyPages.hasOwnProperty(logDateString)) {
                dailyPages[logDateString] += log.pagesRead;
            }
        });

        // Populate data array in the correct order
        labels.forEach((_, index) => {
             const date = new Date(today);
             date.setDate(today.getDate() - (days - 1 - index));
             const dateString = date.toISOString().split('T')[0];
             data.push(dailyPages[dateString]);
        });


        return {
            labels,
            datasets: [{
                label: 'Pages Read',
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                tension: 0.1 // Slight curve for line chart if used
            }]
        };
    };

    const prepareBooksPerMonthData = (books, history, months = 12) => {
        const labels = [];
        const data = [];
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11

        const monthlyCompletions = {}; // { 'YYYY-MM': count }

        // Initialize last 'months' months
        for (let i = 0; i < months; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-11
            const monthString = `${year}-${String(month + 1).padStart(2, '0')}`; // YYYY-MM
            labels.unshift(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })); // Format like 'Jan 2023'
            monthlyCompletions[monthString] = 0;
        }

        // Find completion dates (approximated by the last log date for completed books)
        const completedBooks = books.filter(book => book.status === 'completed');
        completedBooks.forEach(book => {
            // Find the latest reading log for this specific book
            const bookLogs = history
                .filter(log => log.bookId === book.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort descending by date

            if (bookLogs.length > 0) {
                const lastLogDate = new Date(bookLogs[0].date);
                const year = lastLogDate.getFullYear();
                const month = lastLogDate.getMonth();
                const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;

                if (monthlyCompletions.hasOwnProperty(monthString)) {
                    monthlyCompletions[monthString]++;
                }
            }
            // Edge case: If a book was marked completed without logs (e.g., imported),
            // we might use book.addedDate, but that's less accurate for *when* it was read.
            // Sticking to history-based completion for now.
        });

         // Populate data array in the correct order
        labels.forEach((_, index) => {
             const date = new Date(currentYear, currentMonth - (months - 1 - index), 1);
             const year = date.getFullYear();
             const month = date.getMonth();
             const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;
             data.push(monthlyCompletions[monthString]);
        });

        return {
            labels,
            datasets: [{
                label: 'Books Completed',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
    };


    // --- Main Render Function ---

    const renderChart = (chartType, books, history) => {
        destroyCurrentChart(); // Clear previous chart

        let chartData;
        let chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // Ensure whole numbers on y-axis
                    }
                }
            },
            plugins: {
                legend: {
                    display: true // Show legend
                },
                tooltip: {
                    enabled: true // Show tooltips on hover
                }
            }
        };
        let selectedChartType = 'bar'; // Default to bar chart

        switch (chartType) {
            case 'pagesPerDay':
                chartData = preparePagesPerDayData(history, 7); // Last 7 days
                chartOptions.plugins.title = { display: true, text: 'Pages Read Per Day (Last 7 Days)' };
                selectedChartType = 'bar'; // Or 'line'
                break;
            case 'booksPerMonth':
                chartData = prepareBooksPerMonthData(books, history, 12); // Last 12 months
                chartOptions.plugins.title = { display: true, text: 'Books Completed Per Month (Last 12 Months)' };
                selectedChartType = 'bar';
                break;
            // Add more cases for other chart types here
            default:
                console.warn(`Unsupported chart type: ${chartType}`);
                // Optionally render a default chart or nothing
                 chartData = { labels: [], datasets: [] }; // Empty chart
                 chartOptions.plugins.title = { display: true, text: 'Select a chart type' };

        }

         if (!chartData || !chartData.labels || !chartData.datasets) {
            console.error("Failed to prepare chart data.");
            return;
        }

        currentChartInstance = new Chart(ctx, {
            type: selectedChartType,
            data: chartData,
            options: chartOptions
        });
    };

    return {
        renderChart
    };

})();