// Default patterns for Croatian numbers
const DEFAULT_PATTERNS = ["00385Z.", "385Z.", "X.", "Z.", "X."];

// Pattern management
const patternList = document.getElementById('patternList');
const addPatternBtn = document.getElementById('addPatternBtn');
const resetPatternsBtn = document.getElementById('resetPatternsBtn');

function createPatternInput(pattern = '') {
    const patternDiv = document.createElement('div');
    patternDiv.className = 'pattern-input';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter pattern (e.g., 00385Z.)';
    input.className = 'pattern-text';
    input.value = pattern;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'red-btn';
    removeBtn.onclick = () => {
        patternDiv.remove();
        updateFullPreview();
    };

    input.addEventListener('input', updateFullPreview);

    patternDiv.appendChild(input);
    patternDiv.appendChild(removeBtn);

    return patternDiv;
}

function getPatterns() {
    return Array.from(patternList.querySelectorAll('.pattern-text'))
        .map(input => input.value)
        .filter(value => value.trim() !== '');
}

function initializePatterns() {
    patternList.innerHTML = '';
    DEFAULT_PATTERNS.forEach(pattern => {
        patternList.appendChild(createPatternInput(pattern));
    });
}

addPatternBtn.addEventListener('click', () => {
    patternList.appendChild(createPatternInput());
    updateFullPreview();
});

resetPatternsBtn.addEventListener('click', () => {
    initializePatterns();
    maskingPairsDiv.innerHTML = '';
    updateFullPreview();
});

// Dynamic masking pairs logic
const maskingPairsDiv = document.getElementById('maskingPairs');
const addMaskBtn = document.getElementById('addMaskBtn');

function createMaskingPair(from = '', to = '') {
    const pairDiv = document.createElement('div');
    pairDiv.className = 'masking-pair';

    const fromInput = document.createElement('input');
    fromInput.type = 'number';
    fromInput.placeholder = 'From';
    fromInput.className = 'mask-from';
    fromInput.value = from;

    const arrow = document.createElement('span');
    arrow.textContent = '→';

    const toInput = document.createElement('input');
    toInput.type = 'number';
    toInput.placeholder = 'To';
    toInput.className = 'mask-to';
    toInput.value = to;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'red-btn';
    removeBtn.onclick = () => {
        pairDiv.remove();
        updateFullPreview();
    };

    fromInput.addEventListener('input', updateFullPreview);
    toInput.addEventListener('input', updateFullPreview);

    pairDiv.appendChild(fromInput);
    pairDiv.appendChild(arrow);
    pairDiv.appendChild(toInput);
    pairDiv.appendChild(removeBtn);

    return pairDiv;
}

addMaskBtn.addEventListener('click', () => {
    maskingPairsDiv.appendChild(createMaskingPair());
    updateFullPreview();
});

// Preview generation
function generatePreviewData(showFull = false) {
    const minPrefix = document.getElementById('minPrefix').value;
    const maxPrefix = document.getElementById('maxPrefix').value;
    
    if (!minPrefix || !maxPrefix) return [];

    const maskPairs = [];
    maskingPairsDiv.querySelectorAll('.masking-pair').forEach(pair => {
        const from = pair.querySelector('.mask-from').value;
        const to = pair.querySelector('.mask-to').value;
        if (from && to) {
            maskPairs.push({ from: parseInt(from), to: parseInt(to) });
        }
    });

    const patterns = getPatterns();
    if (patterns.length === 0) return [];

    const maxPrepend = maxPrefix - minPrefix;
    const data = [];
    const cosmeticPrependMap = {};

    maskPairs.forEach(pair => {
        if (pair && typeof pair.from === 'number' && typeof pair.to === 'number' && !isNaN(pair.from) && !isNaN(pair.to)) {
            cosmeticPrependMap[pair.from] = pair.to;
        }
    });

    // Generate data for all prefixes if showFull is true, otherwise just the first one
    const startPrepend = showFull ? 1 : 1;
    const endPrepend = showFull ? maxPrepend : 1;

    for (let originalPrepend = startPrepend; originalPrepend <= endPrepend; originalPrepend++) {
        const prepend = cosmeticPrependMap[originalPrepend] || originalPrepend;
        const prefix = parseInt(minPrefix) + originalPrepend;
        const baseNumber = prepend * 100000 + 385;

        patterns.forEach(pattern => {
            data.push({ 
                prepend: pattern.includes('385') ? baseNumber : prepend, 
                prefix, 
                matchPattern: pattern, 
                callerid: "" 
            });
        });
    }

    return data;
}

const rangeToggle = document.getElementById('rangeToggle');
const maxPrefixGroup = document.getElementById('maxPrefixGroup');
const rangeGroup = document.getElementById('rangeGroup');
const prefixRange = document.getElementById('prefixRange');
const minPrefixInput = document.getElementById('minPrefix');
const maxPrefixInput = document.getElementById('maxPrefix');

function updateMaxPrefixFromRange() {
    const min = parseInt(minPrefixInput.value);
    const range = parseInt(prefixRange.value);
    if (!isNaN(min) && !isNaN(range) && range > 0) {
        maxPrefixInput.value = min + range - 1;
    }
}

rangeToggle.addEventListener('change', () => {
    if (rangeToggle.checked) {
        maxPrefixGroup.style.display = 'none';
        rangeGroup.style.display = '';
        prefixRange.required = true;
        maxPrefixInput.required = false;
        updateMaxPrefixFromRange();
        updateFullPreview();
    } else {
        maxPrefixGroup.style.display = '';
        rangeGroup.style.display = 'none';
        prefixRange.required = false;
        maxPrefixInput.required = true;
        updateFullPreview();
    }
});

minPrefixInput.addEventListener('input', () => {
    if (rangeToggle.checked) {
        updateMaxPrefixFromRange();
        updateFullPreview();
    }
});

prefixRange.addEventListener('input', () => {
    updateMaxPrefixFromRange();
    updateFullPreview();
});

// Update full preview on any relevant change
['minPrefix', 'maxPrefix'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        if (!rangeToggle.checked) updateFullPreview();
    });
});

async function updateFullPreview() {
    const minPrefix = parseInt(minPrefixInput.value);
    const maxPrefix = parseInt(maxPrefixInput.value);
    const maskPairs = [];
    maskingPairsDiv.querySelectorAll('.masking-pair').forEach(pair => {
        const from = parseInt(pair.querySelector('.mask-from').value);
        const to = parseInt(pair.querySelector('.mask-to').value);
        if (!isNaN(from) && !isNaN(to)) {
            maskPairs.push({ from, to });
        }
    });
    const patterns = getPatterns().filter(pattern => pattern.trim() !== '');

    // Validate inputs
    if (isNaN(minPrefix) || isNaN(maxPrefix) || minPrefix > maxPrefix) {
        console.error('Invalid prefix range');
        displayPreview([], 'fullPreview');
        displaySimCardTable([], 'simCardPreview');
        return;
    }
    if (patterns.length === 0) {
        console.error('No patterns provided');
        displayPreview([], 'fullPreview');
        displaySimCardTable([], 'simCardPreview');
        return;
    }

    // Update SIM card prefixes
    const simCardData = [];
    for (let prepend = 1; prepend <= maxPrefix - minPrefix + 1; prepend++) {
        const prefix = minPrefix + prepend - 1;
        simCardData.push({ simCard: prepend, prefix });
    }
    displaySimCardTable(simCardData, 'simCardPreview');

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                minPrefix, 
                maxPrefix, 
                maskPairs,
                patterns
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            displayPreview(result.data, 'fullPreview');
            document.getElementById('downloadBtn').style.display = 'block';
        } else {
            console.error('Server error:', result.error);
            displayPreview([], 'fullPreview');
            document.getElementById('downloadBtn').style.display = 'none';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        displayPreview([], 'fullPreview');
        document.getElementById('downloadBtn').style.display = 'none';
    }
}

function displayPreview(data, targetId) {
    const preview = document.getElementById(targetId);
    preview.innerHTML = ''; // Clear existing content

    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Prepend', 'Prefix', 'Match Pattern'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        [row.prepend, row.prefix, row.matchPattern].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    preview.appendChild(table);
}

// Form submission logic
document.getElementById('dialplanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Optionally, you can trigger download here or just show the preview (already shown)
});

// On page load, initialize and show preview
initializePatterns();
updateFullPreview();

// Download functionality
document.getElementById('downloadBtn').addEventListener('click', () => {
    const data = document.querySelector('#fullPreview table');
    const csv = convertTableToCSV(data);
    downloadCSV(csv);
});

function convertTableToCSV(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map(row => {
        // Only include the first 3 columns (Prepend, Prefix, Match Pattern)
        const cells = Array.from(row.querySelectorAll('th, td')).slice(0, 3);
        return cells.map(cell => `"${cell.textContent}"`).join(',');
    }).join('\n');
}

function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'generated_dialplan.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function generateDialplan(minPrefix, maxPrefix, maskPairs = [], patterns) {
    // Validate input
    if (typeof minPrefix !== 'number' || isNaN(minPrefix)) throw new Error('minPrefix must be a number');
    if (typeof maxPrefix !== 'number' || isNaN(maxPrefix)) throw new Error('maxPrefix must be a number');
    if (!Array.isArray(patterns) || patterns.length === 0) throw new Error('You must provide at least one match pattern.');
    if (!Array.isArray(maskPairs)) throw new Error('maskPairs must be an array');

    const data = [];

    // Build cosmetic prepend map from maskPairs
    const cosmeticPrependMap = {};
    maskPairs.forEach(pair => {
        if (
            pair &&
            typeof pair.from === 'number' &&
            typeof pair.to === 'number' &&
            !isNaN(pair.from) &&
            !isNaN(pair.to)
        ) {
            cosmeticPrependMap[pair.from] = pair.to;
        } else {
            throw new Error('Invalid mask pair: each pair must have numeric "from" and "to" values');
        }
    });

    for (let prefix = minPrefix; prefix <= maxPrefix; prefix++) {
        const originalPrepend = prefix - minPrefix + 1;
        const prepend = cosmeticPrependMap[originalPrepend] || originalPrepend;
        const baseNumber = prepend * 100000 + 385;
        for (let i = 0; i < patterns.length; i++) {
            let rowPrepend = prepend;
            let rowPrefix = prefix;
            if (i === 1) {
                rowPrepend = prepend * 100;
            } else if (i > 1) {
                rowPrepend = baseNumber;
            }
            if (i === patterns.length - 1 && patterns.length > 2) {
                rowPrefix = prefix * 10;
            }
            data.push({ prepend: rowPrepend, prefix: rowPrefix, matchPattern: patterns[i] });
        }
    }

    return data;
}

// Add new button for SIM card prefix display
document.getElementById('simCardBtn').addEventListener('click', () => {
    const minPrefix = parseInt(minPrefixInput.value);
    const maxPrefix = parseInt(maxPrefixInput.value);

    // Validate inputs
    if (isNaN(minPrefix) || isNaN(maxPrefix) || minPrefix > maxPrefix) {
        return;
    }

    const simCardData = [];
    for (let prepend = 1; prepend <= maxPrefix - minPrefix + 1; prepend++) {
        const prefix = minPrefix + prepend - 1;
        simCardData.push({ simCard: prepend, prefix });
    }

    displaySimCardTable(simCardData, 'simCardPreview');
});

function displaySimCardTable(data, targetId) {
    const preview = document.getElementById(targetId);
    preview.innerHTML = ''; // Clear existing content

    const table = document.createElement('table');

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['SIM Card', 'Prefix'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        [row.simCard, row.prefix].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    preview.appendChild(table);
}