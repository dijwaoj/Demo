const fs = require('fs');
const vm = require('vm');

console.log('=== Final Data Verification ===\n');

// 1. Verify pathways.js
console.log('1. Checking pathways.js:');
try {
    const pathwaysCode = fs.readFileSync('./js/data/pathways.js', 'utf8');
    // Create a context that mimics browser globals
    const pathwaysContext = { 
        console: console,
        // Add any globals the code might expect
    };
    vm.createContext(pathwaysContext);
    vm.runInContext(pathwaysCode, pathwaysContext);
    
    console.log('   PATHWAY_GROUPS.length:', PATHWAY_GROUPS.length);
    console.log('   PATHWAYS.length:', PATHWAYS.length);
    console.log('   ✓ PATHWAY_GROUPS length correct:', PATHWAY_GROUPS.length === 7 ? 'PASS' : 'FAIL');
    console.log('   ✓ PATHWAYS length correct:', PATHWAYS.length === 22 ? 'PASS' : 'FAIL');
    
    // Show first and last pathway
    console.log('   First pathway:', PATHWAYS[0].name);
    console.log('   Last pathway:', PATHWAYS[PATHWAYS.length-1].name);
    console.log();
    
} catch (error) {
    console.error('   Error verifying pathways.js:', error.message);
    console.log();
}

// 2. Verify stages.js
console.log('2. Checking stages.js:');
try {
    const stagesCode = fs.readFileSync('./js/data/stages.js', 'utf8');
    const stagesContext = { 
        console: console,
    };
    vm.createContext(stagesContext);
    vm.runInContext(stagesCode, stagesContext);
    
    console.log('   STAGES.length:', STAGES.length);
    console.log('   ✓ STAGES length correct:', STAGES.length === 30 ? 'PASS' : 'FAIL');
    
    // Show first and last stage
    console.log('   First stage:', STAGES[0].name);
    console.log('   Last stage:', STAGES[STAGES.length-1].name);
    console.log();
    
} catch (error) {
    console.error('   Error verifying stages.js:', error.message);
    console.log();
}

console.log('=== Verification Complete ===');