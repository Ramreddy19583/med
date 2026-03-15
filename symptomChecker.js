const symptomsDatabase = [
    {
        keywords: ['fever', 'cold', 'cough', 'flu', 'headache', 'fatigue', 'tired', 'weak', 'body ache'],
        specialist: 'General Physician',
        department: 'General Medicine',
        description: 'For general ailments, fever, and common infections, a General Physician is the best starting point.',
        icon: 'fa-stethoscope'
    },
    {
        keywords: ['heart', 'chest pain', 'palpitations', 'blood pressure', 'breathless', 'dizzy'],
        specialist: 'Cardiologist',
        department: 'Cardiology',
        description: 'Symptoms related to the heart or chest require immediate attention from a Cardiologist.',
        icon: 'fa-heart-pulse'
    },
    {
        keywords: ['tooth', 'teeth', 'gum', 'jaw', 'bleeding gum', 'cavity', 'toothache'],
        specialist: 'Dentist',
        department: 'Dental Care',
        description: 'For any issues related to your teeth, gums, or oral health, please consult our Dental experts.',
        icon: 'fa-tooth'
    },
    {
        keywords: ['bone', 'joint', 'knee', 'back pain', 'fracture', 'muscle', 'sprain', 'arthritis'],
        specialist: 'Orthopedic Doctor',
        department: 'Orthopedics',
        description: 'Bone, joint, or muscle issues are best evaluated by an Orthopedic specialist.',
        icon: 'fa-bone'
    },
    {
        keywords: ['eye', 'vision', 'blur', 'red eye', 'dry eye', 'cataract', 'glasses'],
        specialist: 'Ophthalmologist',
        department: 'Ophthalmology',
        description: 'Any concerns with your vision or eyes should be checked by an Ophthalmologist.',
        icon: 'fa-eye'
    },
    {
        keywords: ['head', 'migraine', 'seizure', 'memory', 'numbness', 'tingling', 'brain', 'nerve'],
        specialist: 'Neurologist',
        department: 'Neurology',
        description: 'Conditions affecting the brain, nerves, or spinal cord require a Neurological evaluation.',
        icon: 'fa-brain'
    }
];

const localizedStrings = {
    enterSymptoms: {
        'en-IN': 'Please enter your symptoms to get a recommendation.',
        'hi-IN': 'कृपया सिफ़ारिश पाने के लिए अपने लक्षण दर्ज करें।',
        'te-IN': 'దయచేసి మీ లక్షణాలను నమోదు చేసి సిఫార్సు పొందండి.'
    },
    fallback: {
        'en-IN': "We couldn't perfectly match your symptoms to a specialty. A General Physician is the best person to consult first.",
        'hi-IN': 'हम आपके लक्षणों को किसी विशेष विशेषज्ञता से पूरी तरह मेल नहीं कर पाए। सबसे पहले एक जनरल फिजिशियन से परामर्श करना सबसे अच्छा है।',
        'te-IN': 'మేము మీ లక్షణాలను ప్రత్యేక విభాగానికి పూర్తిగా అనుకూలంగా కనుగొనలేకపోయాము. మొదటగా జనరల్ ఫిజిషియన్ ను సంప్రదించడం ఉత్తమం.'
    },
    recommendation: {
        'en-IN': 'Based on your symptoms, we recommend consulting a',
        'hi-IN': 'आपके लक्षणों के आधार पर, हम सलाह देते हैं कि आप से परामर्श लें',
        'te-IN': 'మీ లక్షణాల ఆధారంగా, మేము సంప్రదించడానికి సిఫార్సు చేస్తున్నాము'
    }
};

function getLocalizedString(key, lang) {
    if (!lang) lang = (window.getResponseLanguage ? window.getResponseLanguage() : 'en-IN');
    const bucket = localizedStrings[key];
    return (bucket && bucket[lang]) ? bucket[lang] : bucket['en-IN'];
}

function speakMessage(text, lang) {
    if (!text) return;
    if (!lang) lang = (window.getResponseLanguage ? window.getResponseLanguage() : 'en-IN');
    if (typeof window.speakText === 'function') {
        window.speakText(text, lang);
    }
}

const symptomInput = document.getElementById('symptomInput');
const checkBtn = document.getElementById('checkSymptomsBtn');
const resultContainer = document.getElementById('symptomResult');
const micBtn = document.getElementById('scMicBtn');

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        isRecording = true;
        if(micBtn) micBtn.classList.add('listening');
        symptomInput.placeholder = "Listening...";
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        symptomInput.value = transcript;
        analyzeSymptoms(); // Auto trigger analysis
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        stopRecording();
        symptomInput.placeholder = "E.g., I have a severe toothache and fever...";
    };

    recognition.onend = function() {
        stopRecording();
    };
}

function stopRecording() {
    isRecording = false;
    if(micBtn) micBtn.classList.remove('listening');
    symptomInput.placeholder = "E.g., I have a severe toothache and fever...";
}

if (micBtn) {
    micBtn.addEventListener('click', () => {
        if (!recognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (isRecording) {
            recognition.stop();
        } else {
            // Set language dynamically
            const lang = (window.getResponseLanguage ? window.getResponseLanguage() : 'en-IN');
            recognition.lang = lang;
            recognition.start();
        }
    });
}

if (checkBtn && symptomInput && resultContainer) {
    checkBtn.addEventListener('click', analyzeSymptoms);
    symptomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') analyzeSymptoms();
    });
}

function analyzeSymptoms() {
    const input = symptomInput.value.toLowerCase().trim();
    
    if (!input) {
        const lang = (window.getResponseLanguage ? window.getResponseLanguage() : 'en-IN');
        const message = getLocalizedString('enterSymptoms', lang);
        showResult(message, 'fa-circle-exclamation', 'var(--accent)');
        speakMessage(message, lang);
        return;
    }

    // Hide previous results and show loading state
    resultContainer.classList.remove('active');
    resultContainer.innerHTML = '';
    
    // Inject loader if it doesn't exist
    let loader = document.getElementById('scLoader');
    if (!loader) {
        const loaderHTML = `
            <div class="sc-loading" id="scLoader">
                <div class="loader-ring"></div>
                <p>MedCare AI is analyzing your symptoms...</p>
            </div>
        `;
        document.querySelector('.sc-container').insertAdjacentHTML('beforeend', loaderHTML);
        loader = document.getElementById('scLoader');
    }
    
    loader.classList.add('active');
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

    // Simulate AI processing time (1.5 seconds)
    setTimeout(() => {
        loader.classList.remove('active');
        checkBtn.disabled = false;
        checkBtn.innerHTML = 'Analyze Symptoms';
        
        // Simple keyword matching logic with percentage
        let highestMatch = null;
        let maxMatches = 0;
        let totalInputWords = input.split(' ').filter(w => w.length > 2).length;
        if(totalInputWords === 0) totalInputWords = 1;

        symptomsDatabase.forEach(category => {
            let matchCount = 0;
            category.keywords.forEach(keyword => {
                if (input.includes(keyword)) {
                    matchCount++;
                }
            });

            if (matchCount > maxMatches) {
                maxMatches = matchCount;
                highestMatch = category;
            }
        });

        // Calculate a simulated confidence score based on matches
        let confidenceScore = 45; // base score for generic fallback
        if (maxMatches > 0) {
            // Rough heuristic: more keyword matches = higher confidence
            confidenceScore = Math.min(98, 60 + (maxMatches * 15));
            // Add slight randomness for realism
            confidenceScore += Math.floor(Math.random() * 5); 
        }

        if (highestMatch && maxMatches > 0) {
            renderPremiumResult(highestMatch, confidenceScore);
        } else {
            // Fallback
            const fallbackCat = {
                specialist: 'General Physician',
                department: 'General Medicine',
                description: "We couldn't perfectly match your specific symptoms to a specialty. A General Physician is the best person to consult for an initial comprehensive diagnosis.",
                icon: 'fa-user-doctor'
            };
            renderPremiumResult(fallbackCat, confidenceScore);
        }
    }, 1500);
}

function renderPremiumResult(match, score) {
    const htmlContent = `
        <div class="premium-result-card">
            <div class="result-header">
                <div class="sc-result-icon" style="margin:0;"><i class="fa-solid ${match.icon}"></i></div>
                <div>
                    <h3 style="margin:0; font-size:1.5rem; color:var(--secondary)">Recommended Specialist</h3>
                    <div style="font-size:1.25rem; font-weight:700; color:var(--primary)">${match.specialist}</div>
                </div>
            </div>
            
            <div class="result-match-score">
                <div class="score-header">
                    <span>AI Match Confidence</span>
                    <span>${score}%</span>
                </div>
                <div class="score-bar-bg">
                    <div class="score-bar-fill" style="width: 0%" id="confidenceBar"></div>
                </div>
            </div>
            
            <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;">${match.description}</p>
            
            <div class="result-disclaimer">
                <i class="fa-solid fa-triangle-exclamation" style="margin-right: 0.5rem;"></i>
                <strong>Disclaimer:</strong> This is an AI-generated suggestion based on keywords and is not a substitute for professional medical advice. For emergencies, please call our 24/7 hotline.
            </div>
            
            <div class="result-actions">
                <a href="#appointment" class="btn btn-primary" onclick="setDepartment('${match.department}')">
                    Book ${match.department} Appointment
                </a>
                <button class="btn btn-outline" onclick="resetSymptomChecker()">Clear</button>
            </div>
        </div>
    `;
    
    showResultHTML(htmlContent);

    // Speak the recommendation in the detected/selected language
    const lang = (window.getResponseLanguage ? window.getResponseLanguage() : 'en-IN');
    const base = getLocalizedString('recommendation', lang);
    const speechText = `${base} ${match.specialist} (${match.department}).`;
    speakMessage(speechText, lang);
    
    // Animate the confidence bar
    setTimeout(() => {
        const bar = document.getElementById('confidenceBar');
        if (bar) {
            // Change color based on score
            if (score > 80) {
                bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)'; // green
            } else if (score > 60) {
                bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)'; // yellow
            } else {
                bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)'; // red
            }
            bar.style.width = `${score}%`;
        }
    }, 100);
}

function resetSymptomChecker() {
    symptomInput.value = '';
    resultContainer.classList.remove('active');
    setTimeout(() => {
        resultContainer.innerHTML = '';
    }, 300);
}

function showResult(message, iconClass, color) {
    resultContainer.innerHTML = `
        <div style="font-size: 2rem; color: ${color}; margin-bottom: 1rem;"><i class="fa-solid ${iconClass}"></i></div>
        <p>${message}</p>
    `;
    resultContainer.classList.add('active');
}

function showResultHTML(htmlContent) {
    resultContainer.innerHTML = htmlContent;
    resultContainer.classList.add('active');
}

// Helper to pre-fill the booking form based on recommendation
function setDepartment(deptName) {
    const select = document.getElementById('pDepartment');
    if (select) {
        // Find the option and select it
        Array.from(select.options).forEach(option => {
            if (option.value === deptName) {
                option.selected = true;
            }
        });
        
        // Ensure form success message is hidden if linking from symptom checker
        const msg = document.getElementById('formSuccessMessage');
        if(msg) msg.style.display = 'none';
        
        // Smooth scroll happens via the <a> href anchor automatically
    }
}
