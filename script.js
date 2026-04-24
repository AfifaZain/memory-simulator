let comparisonData = {
    labels: [],
    datasets: [{
        label: 'Page Faults',
        data: [],
        backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
        ]
    }]
};

let chartInstance = null;

function parseInput() {
    const refStr = document.getElementById('refString').value;
    const frames = parseInt(document.getElementById('frameCount').value);
    return {
        pages: refStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)),
        frameCount: frames
    };
}

function updateMetrics(hits, faults, total) {
    document.getElementById('totalRefs').innerText = total;
    document.getElementById('pageHits').innerText = hits;
    document.getElementById('pageFaults').innerText = faults;
    document.getElementById('hitRatio').innerText = ((hits / total) * 100).toFixed(2) + '%';
}

function logStatus(msg, type = 'normal') {
    const log = document.getElementById('statusLog');
    const color = type === 'fault' ? '#ef4444' : (type === 'hit' ? '#10b981' : '#10b981');
    log.innerHTML += `<div style="color:${color}">> ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
}

function renderFrames(frames, highlightIndex = -1, status = '') {
    const container = document.getElementById('memoryFrames');
    container.innerHTML = '';
    
    // Create fixed number of slots based on max possible frames (or current config)
    // For simplicity, we render exactly the frameCount slots
    const frameCount = parseInt(document.getElementById('frameCount').value);
    
    for(let i=0; i<frameCount; i++) {
        const div = document.createElement('div');
        div.className = 'frame';
        if (i < frames.length) {
            div.innerText = frames[i] === null ? '-' : frames[i];
            if (i === highlightIndex) {
                div.classList.add(status); // 'hit' or 'fault'
            }
        } else {
            div.innerText = '-';
            div.style.opacity = '0.5';
        }
        container.appendChild(div);
    }
}

// --- Algorithms ---

function runFIFO(pages, frameCount) {
    let frames = new Array(frameCount).fill(null);
    let faults = 0;
    let hits = 0;
    let ptr = 0; // Circular pointer

    logStatus(`Starting FIFO Simulation...`);
    renderFrames(frames);

    pages.forEach((page, index) => {
        if (frames.includes(page)) {
            hits++;
            logStatus(`Step ${index+1}: Page ${page} found (Hit)`, 'hit');
            // In FIFO, hit doesn't change pointer usually, but visual highlight helps
            const idx = frames.indexOf(page);
            renderFrames(frames, idx, 'hit');
        } else {
            faults++;
            logStatus(`Step ${index+1}: Page ${page} not found (Fault) - Replacing ${frames[ptr]}`, 'fault');
            frames[ptr] = page;
            renderFrames(frames, ptr, 'fault');
            ptr = (ptr + 1) % frameCount;
        }
    });
    return { faults, hits, total: pages.length };
}

function runLRU(pages, frameCount) {
    let frames = [];
    let faults = 0;
    let hits = 0;

    logStatus(`Starting LRU Simulation...`);
    renderFrames(frames);

    pages.forEach((page, index) => {
        if (frames.includes(page)) {
            hits++;
            logStatus(`Step ${index+1}: Page ${page} Hit`, 'hit');
            // Move to end (most recently used)
            frames = frames.filter(f => f !== page);
            frames.push(page);
            renderFrames(frames, frames.length - 1, 'hit');
        } else {
            faults++;
            logStatus(`Step ${index+1}: Page ${page} Fault`, 'fault');
            if (frames.length >= frameCount) {
                frames.shift(); // Remove oldest (index 0)
            }
            frames.push(page);
            renderFrames(frames, frames.length - 1, 'fault');
        }
    });
    return { faults, hits, total: pages.length };
}

function runOptimal(pages, frameCount) {
    let frames = [];
    let faults = 0;
    let hits = 0;

    logStatus(`Starting Optimal Simulation...`);
    renderFrames(frames);

    pages.forEach((page, index) => {
        if (frames.includes(page)) {
            hits++;
            logStatus(`Step ${index+1}: Page ${page} Hit`, 'hit');
            renderFrames(frames, frames.indexOf(page), 'hit');
        } else {
            faults++;
            logStatus(`Step ${index+1}: Page ${page} Fault`, 'fault');
            
            if (frames.length < frameCount) {
                frames.push(page);
            } else {
                // Find page to replace: the one used furthest in future
                let farthestIndex = -1;
                let replaceIdx = -1;

                for (let i = 0; i < frames.length; i++) {
                    let futureUse = pages.slice(index + 1).indexOf(frames[i]);
                    if (futureUse === -1) {
                        replaceIdx = i; // Not used again, perfect candidate
                        break;
                    }
                    if (futureUse > farthestIndex) {
                        farthestIndex = futureUse;
                        replaceIdx = i;
                    }
                }
                frames[replaceIdx] = page;
            }
            renderFrames(frames, frames.indexOf(page), 'fault');
        }
    });
    return { faults, hits, total: pages.length };
}

function runLFU(pages, frameCount) {
    let frames = [];
    let freq = {}; // Map page -> frequency
    let faults = 0;
    let hits = 0;

    logStatus(`Starting LFU Simulation...`);
    renderFrames(frames);

    pages.forEach((page, index) => {
        if (frames.includes(page)) {
            hits++;
            freq[page]++;
            logStatus(`Step ${index+1}: Page ${page} Hit`, 'hit');
            renderFrames(frames, frames.indexOf(page), 'hit');
        } else {
            faults++;
            logStatus(`Step ${index+1}: Page ${page} Fault`, 'fault');
            freq[page] = 1;

            if (frames.length < frameCount) {
                frames.push(page);
            } else {
                // Find LFU
                let minFreq = Infinity;
                let replaceIdx = -1;
                
                // Tie-breaking: usually LRU, here we just pick first found for simplicity
                for (let i = 0; i < frames.length; i++) {
                    if (freq[frames[i]] < minFreq) {
                        minFreq = freq[frames[i]];
                        replaceIdx = i;
                    }
                }
                
                delete freq[frames[replaceIdx]];
                frames[replaceIdx] = page;
            }
            renderFrames(frames, frames.indexOf(page), 'fault');
        }
    });
    return { faults, hits, total: pages.length };
}

function runClock(pages, frameCount) {
    // Clock uses a circular buffer and a reference bit
    let frames = new Array(frameCount).fill(null);
    let refBits = new Array(frameCount).fill(0);
    let ptr = 0;
    let faults = 0;
    let hits = 0;

    logStatus(`Starting Clock (Second Chance) Simulation...`);
    renderFrames(frames);

    pages.forEach((page, index) => {
        let existingIdx = frames.indexOf(page);
        
        if (existingIdx !== -1) {
            hits++;
            refBits[existingIdx] = 1; // Give second chance
            logStatus(`Step ${index+1}: Page ${page} Hit`, 'hit');
            renderFrames(frames, existingIdx, 'hit');
        } else {
            faults++;
            logStatus(`Step ${index+1}: Page ${page} Fault`, 'fault');
            
            while (true) {
                if (frames[ptr] === null) {
                    // Empty slot
                    frames[ptr] = page;
                    refBits[ptr] = 1;
                    renderFrames(frames, ptr, 'fault');
                    ptr = (ptr + 1) % frameCount;
                    break;
                } else if (refBits[ptr] === 0) {
                    // Replace this one
                    frames[ptr] = page;
                    refBits[ptr] = 1;
                    renderFrames(frames, ptr, 'fault');
                    ptr = (ptr + 1) % frameCount;
                    break;
                } else {
                    // Give second chance
                    refBits[ptr] = 0;
                    ptr = (ptr + 1) % frameCount;
                }
            }
        }
    });
    return { faults, hits, total: pages.length };
}

// --- Main Controller ---

function runSimulation(algo) {
    const { pages, frameCount } = parseInput();
    if (pages.length === 0) { alert("Please enter a reference string"); return; }
    
    document.getElementById('statusLog').innerHTML = ''; // Clear log
    
    let result;
    if (algo === 'FIFO') result = runFIFO(pages, frameCount);
    else if (algo === 'LRU') result = runLRU(pages, frameCount);
    else if (algo === 'Optimal') result = runOptimal(pages, frameCount);
    else if (algo === 'LFU') result = runLFU(pages, frameCount);
    else if (algo === 'Clock') result = runClock(pages, frameCount);

    updateMetrics(result.hits, result.faults, result.total);
    updateChart(algo, result.faults);
}

function enableThrashingMode() {
    // Generate a reference string larger than frame count with low locality
    const frameCount = parseInt(document.getElementById('frameCount').value) || 3;
    let thrashString = [];
    // Create a pattern that accesses more unique pages than available frames repeatedly
    for(let i=0; i<20; i++) {
        for(let j=0; j<=frameCount + 1; j++) {
            thrashString.push(j);
        }
    }
    document.getElementById('refString').value = thrashString.join(', ');
    document.getElementById('thrashMsg').classList.remove('hidden');
    alert("Thrashing Mode Enabled: Reference string updated to cause maximum page faults.");
}

function updateChart(algo, faults) {
    // Check if algorithm already exists in data
    const existingIndex = comparisonData.labels.indexOf(algo);
    
    if (existingIndex === -1) {
        comparisonData.labels.push(algo);
        comparisonData.datasets[0].data.push(faults);
    } else {
        // Update existing
        comparisonData.datasets[0].data[existingIndex] = faults;
    }

    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: comparisonData,
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Page Faults' } }
                }
            }
        });
    }
}
