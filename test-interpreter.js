// Quick test to understand js-interpreter scope structure
const Interpreter = require('js-interpreter');

const code = `
var x = 5;
var arr = [1, 2, 3];
var y = x + 10;
`;

const interpreter = new Interpreter(code);

// Step through
for (let i = 0; i < 20; i++) {
  const done = !interpreter.step();
  
  if (i >= 10) {
    console.log(`\n=== Step ${i} ===`);
    console.log('stateStack length:', interpreter.stateStack.length);
    
    const state = interpreter.stateStack[interpreter.stateStack.length - 1];
    if (state) {
      console.log('current state scope:', state.scope);
      if (state.scope) {
        console.log('scope keys:', Object.keys(state.scope));
        console.log('scope.properties:', state.scope.properties ? Object.keys(state.scope.properties) : 'none');
      }
    }
  }
  
  if (done) break;
}
