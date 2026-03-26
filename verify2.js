const fs = require('fs');
const vm = require('vm');

// Test pathways.js
console.log('=== Testing pathways.js ===');
const pathwaysContent = fs.readFileSync('./js/data/pathways.js', 'utf8');
const pathwaysContext = { console };
vm.createContext(pathwaysContext);
vm.runInContext(pathwaysContent, pathwaysContext);
console.log('PATHWAY_GROUPS.length:', PATHWAY_GROUPS.length);
console.log('PATHWAYS.length:', PATHWAYS.length);
console.log('Expected: PATHWAY_GROUPS.length = 7, PATHWAYS.length = 22');
console.log('PATHWAY_GROUPS.length correct:', PATHWAY_GROUPS.length === 7);
console.log('PATHWAYS.length correct:', PATHWAYS.length === 22);

// Test stages.js
console.log('\n=== Testing stages.js ===');
const stagesContent = fs.readFileSync('./js/data/stages.js', 'utf8');
const stagesContext = { console };
vm.createContext(stagesContext);
vm.runInContext(stagesContent, stagesContext);
console.log('STAGES.length:', STAGES.length);
console.log('Expected: STAGES.length = 30 (3 chapters × 10 levels)');
console.log('STAGES.length correct:', STAGES.length === 30);
console.log('First stage:', JSON.stringify(STAGES[0]));
console.log('Last stage:', JSON.stringify(STAGES[STAGES.length - 1]));