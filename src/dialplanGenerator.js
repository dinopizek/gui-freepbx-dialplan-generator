const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

function generateDialplan(minPrefix, maxPrefix, maskPairs = [], patterns) {
    // Validate input
    if (typeof minPrefix !== 'number' || isNaN(minPrefix)) throw new Error('minPrefix must be a number');
    if (typeof maxPrefix !== 'number' || isNaN(maxPrefix)) throw new Error('maxPrefix must be a number');
    if (!Array.isArray(patterns) || patterns.length === 0) throw new Error('You must provide at least one match pattern.');

    const data = [];

    // Build cosmetic prepend map from maskPairs
    const cosmeticPrependMap = {};
    if (Array.isArray(maskPairs)) {
        maskPairs.forEach(pair => {
            if (
                pair &&
                typeof pair.from === 'number' &&
                typeof pair.to === 'number' &&
                !isNaN(pair.from) &&
                !isNaN(pair.to)
            ) {
                cosmeticPrependMap[pair.from] = pair.to;
            }
        });
    }

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

module.exports = { generateDialplan }; 