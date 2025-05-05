let progressChart = null;
let pomodoroHistory = {}; // { 'YYYY-MM-DD': count }

const CHART_DAYS_TO_SHOW = 7; // Show the last 7 days

function getFormattedDate(date = new Date()) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadChartData() {
    const storedHistory = localStorage.getItem('pomodoroHistory');
    if (storedHistory) {
        try {
            pomodoroHistory = JSON.parse(storedHistory);
            // Basic validation if needed (e.g., check if it's an object)
            if (typeof pomodoroHistory !== 'object' || pomodoroHistory === null) {
                 pomodoroHistory = {};
            }
        } catch (e) {
            console.error("Error parsing pomodoro history from localStorage:", e);
            pomodoroHistory = {};
        }
    } else {
        pomodoroHistory = {};
    }
}

function saveChartData() {
    try {
        localStorage.setItem('pomodoroHistory', JSON.stringify(pomodoroHistory));
    } catch (e) {
        console.error("Error saving pomodoro history to localStorage:", e);
    }
}

function addPomodoroData() {
    const today = getFormattedDate();
    pomodoroHistory[today] = (pomodoroHistory[today] || 0) + 1;
    saveChartData();
    updateChart(); // Update the chart display
}

function prepareChartData() {
    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = CHART_DAYS_TO_SHOW - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = getFormattedDate(date);
        const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }); // e.g., "Mon 15"

        labels.push(dayLabel);
        data.push(pomodoroHistory[formattedDate] || 0);
    }

    return { labels, data };
}


function updateChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas || typeof Chart === 'undefined') {
        // Don't try to update if canvas or Chart.js isn't ready
        return;
    }
    const ctx = canvas.getContext('2d');
    const { labels, data } = prepareChartData();

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Completed Pomodoros',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Teal color
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            borderRadius: 4, // Rounded bars
            barThickness: 'flex', // Adjust bar thickness based on available space
            maxBarThickness: 50 // Maximum thickness
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allow chart to fill container height
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Ensure integer ticks for counts
                     color: '#4b5563' // Gray-600 for tick labels
                },
                 grid: {
                    color: '#e5e7eb' // Gray-200 for grid lines
                }
            },
            x: {
                 ticks: {
                     color: '#4b5563' // Gray-600 for tick labels
                 },
                 grid: {
                    display: false // Hide vertical grid lines
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hide the legend as it's obvious
            },
            tooltip: {
                 backgroundColor: '#4b5563', // Gray-600 background
                 titleColor: '#ffffff',
                 bodyColor: '#ffffff',
                 displayColors: false // Don't show the color box in tooltip
            }
        }
    };

    if (progressChart) {
        // Update existing chart
        progressChart.data = chartData;
        progressChart.options = chartOptions; // Update options too if they change
        progressChart.update();
    } else {
        // Create new chart
        progressChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }
}


function setupCharts() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) {
        console.error("Chart canvas element not found.");
        return;
    }
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded.");
        return;
    }

    loadChartData();
    updateChart(); // Initial render
}

// Make functions globally accessible
window.setupCharts = setupCharts;
window.addPomodoroData = addPomodoroData;