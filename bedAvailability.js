/**
 * bedAvailability.js
 * Simulates real-time live data updates for the Hospital Bed Availability section.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial data matching the HTML
    const bedData = {
        icu: { available: 4, total: 45, type: 'critical' },
        general: { available: 42, total: 150, type: 'normal' },
        maternity: { available: 12, total: 60, type: 'moderate' },
        private: { available: 8, total: 30, type: 'normal' }
    };

    // Update the DOM elements based on data
    function updateBedUI(wardCode) {
        const data = bedData[wardCode];
        const countSpan = document.getElementById(`${wardCode}-available`);
        if (!countSpan) return;

        // Update number
        countSpan.textContent = data.available;
        
        // Calculate percentage (100 - % available is occupancy)
        const occupancyPercent = ((data.total - data.available) / data.total) * 100;
        
        // Find the specific ward card to update its progress bar width
        const cardContainer = countSpan.closest('.bed-card');
        if (cardContainer) {
            const progressBar = cardContainer.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${occupancyPercent}%`;
            }
        }
        
        // Brief pulse animation to show update
        countSpan.classList.add('pulse-update');
        setTimeout(() => {
            countSpan.classList.remove('pulse-update');
        }, 1000);
    }

    // Process random fluctuations in bed availability to simulate live environment
    function simulateFluctuation() {
        const wards = Object.keys(bedData);
        // Pick 1 or 2 random wards to fluctuate
        const numToChange = Math.random() > 0.5 ? 2 : 1;
        
        for (let i = 0; i < numToChange; i++) {
            const targetWard = wards[Math.floor(Math.random() * wards.length)];
            const data = bedData[targetWard];
            
            // Randomly increase or decrease available beds by 1 (if within bounds)
            const change = Math.random() > 0.5 ? 1 : -1;
            
            let newAvail = data.available + change;
            
            // Boundary checks
            if (newAvail < 0) newAvail = 0;
            if (newAvail > data.total) newAvail = data.total;
            
            // Extra constraint for ICU - keep it low
            if (targetWard === 'icu' && newAvail > 10) newAvail = 10;
            
            if (newAvail !== data.available) {
                data.available = newAvail;
                updateBedUI(targetWard);
            }
        }
    }

    // Start simulation loop (update every 3 to 8 seconds)
    function loopSimulation() {
        const nextUpdateTiming = Math.random() * 5000 + 3000;
        setTimeout(() => {
            simulateFluctuation();
            loopSimulation();
        }, nextUpdateTiming);
    }

    // Initialize
    loopSimulation();
});