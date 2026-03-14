document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeReportBtn');
    const reportText = document.getElementById('reportText');
    const reportFile = document.getElementById('reportFile');
    const dropArea = document.getElementById('dropArea');
    const resultsArea = document.getElementById('analysisResults');

    // Drag and Drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('dragover');
        }, false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            reportFile.files = files;
            updateDropAreaText(files[0].name);
        }
    }, false);

    reportFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            updateDropAreaText(e.target.files[0].name);
        }
    });

    function updateDropAreaText(filename) {
        const p = dropArea.querySelector('p');
        p.textContent = `Selected file: ${filename}`;
        p.style.color = 'var(--primary)';
        p.style.fontWeight = '600';
    }

    // Analysis Simulation Logic
    analyzeBtn.addEventListener('click', () => {
        const hasText = reportText.value.trim().length > 0;
        const hasFile = reportFile.files.length > 0;

        if (!hasText && !hasFile) {
            alert('Please paste a report or upload a file to analyze.');
            return;
        }

        // Show Initial Loading State (Optional: Add a loader element to index.html to make it spin, here we just change btn text)
        const originalBtnText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with AI...';
        analyzeBtn.disabled = true;
        
        // Hide previous results if any
        resultsArea.style.display = 'none';

        // Simulate API call delay (1.5 seconds)
        setTimeout(() => {
            simulateAIResponse();
            
            // Restore button
            analyzeBtn.innerHTML = originalBtnText;
            analyzeBtn.disabled = false;
            
            // Show results
            resultsArea.style.display = 'block';
            
            // Scroll to results smoothly
            resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        }, 1500);
    });

    function simulateAIResponse() {
        // Pre-defined set of responses to make it look dynamic based on random chance or text length
        const responses = [
            {
                summary: "Your report indicates mildly elevated cholesterol levels and slightly high blood pressure. All other major markers, including liver and kidney functions, are within normal ranges.",
                findings: [
                    "LDL Cholesterol is 140 mg/dL (slightly high)",
                    "Blood Pressure reading noted at 135/85 mmHg",
                    "Blood Glucose levels are normal (92 mg/dL)"
                ],
                nextSteps: "Schedule a routine follow-up in the next few weeks to discuss lifestyle and dietary changes. No immediate emergency.",
                department: "Cardiology",
                urgency: { text: "Routine Review", class: "ra-badge-success" }
            },
            {
                summary: "The MRI scan results show mild inflammation in the lower lumbar region (L4-L5). There is no sign of severe disc herniation or nerve compression.",
                findings: [
                    "Mild facet joint hypertrophy at L4-L5",
                    "No significant spinal stenosis observed",
                    "Surrounding soft tissues appear normal"
                ],
                nextSteps: "Rest, avoid heavy lifting, and consider physical therapy. Follow up with an orthopedist if pain worsens.",
                department: "Orthopedics",
                urgency: { text: "Review Next Week", class: "ra-badge-warning" }
            },
            {
                summary: "Blood work reveals a lower than normal red blood cell count and low ferritin levels, which strongly indicates iron deficiency anemia.",
                findings: [
                    "Hemoglobin: 10.5 g/dL (Below normal)",
                    "Ferritin: 12 ng/mL (Significantly low)",
                    "White blood cell count is within normal limits"
                ],
                nextSteps: "You likely need an iron supplement. Consult with a general physician for the correct dosage and dietary advice within the next few days.",
                department: "General Medicine",
                urgency: { text: "Consult Soon", class: "ra-badge-warning" }
            }
        ];

        // Pick a random response for simulation
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        // Populate the DOM
        document.getElementById('plainSummary').textContent = randomResponse.summary;
        
        const findingsList = document.getElementById('keyFindings');
        findingsList.innerHTML = '';
        randomResponse.findings.forEach(finding => {
            const li = document.createElement('li');
            li.style.marginBottom = '0.5rem';
            li.innerHTML = `<i class="fa-solid fa-check text-primary" style="margin-right:0.5rem"></i> ${finding}`;
            findingsList.appendChild(li);
        });

        document.getElementById('nextSteps').textContent = randomResponse.nextSteps;
        document.getElementById('recDepartment').textContent = randomResponse.department;
        
        const badge = document.getElementById('urgencyBadge');
        badge.textContent = randomResponse.urgency.text;
        badge.className = `ra-badge ${randomResponse.urgency.class}`;
    }
});