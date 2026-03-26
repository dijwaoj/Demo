const fs = require('fs');
const vm = require('vm');

console.log('=== Final Verification ===\n');

// Verify pathways.js
try {
    const pathwaysCode = fs.readFileSync('./js/data/pathways.js', 'utf8');
    const pathwaysContext = { console };
    vm.createContext(pathwaysContext);
    vm.runInContext(pathwaysCode, pathwaysContext);
    
    console.log('PATHWAY_GROUPS.length:', PATHWAY_GROUPS.length);
    console.log('PATHWAYS.length:', PATHWAYS.length);
    console.log('✓ PATHWAY_GROUPS length correct:', PATHWAY_GROUPS.length === 7);
    console.log('✓ PATHWAYS length correct:', PATHWAYS.length === 22);
    console.log();
    
    // Show sample pathway data
    console.log('Sample pathway data:');
    console.log('- First pathway:', PATHWAYS[0].name);
    console.log('- Last pathway:', PATHWAYS[PATHWAYS.length - 1].name);
    console.log();
    
} catch (error) {
    console.error('Error verifying pathways.js:', error.message);
}

// Verify stages.js
try {
    const stagesCode = fs.readFileSync('./js/data/stages.js', 'utf8');
    const stagesContext = { console };
    vm.createContext(stagesContext);
    vm.runInContext(stagesCode, stagesContext);
    
    console.log('STAGES.length:', STAGES.length);
    console.log('✓ STAGES length correct:', STAGES.length === 30);
    console.log();
    
    // Show sample stage data
    console.log('Sample stage data:');
    console.log('- First stage:', STAGES[0].name);
    console.log('- Last stage:', STAGES[STAGES.length - 1].name);
    console.log();
    
} catch (error) {
    console.error('Error verifying stages.js:', error.message);
}

console.log('=== Verification Complete ===');