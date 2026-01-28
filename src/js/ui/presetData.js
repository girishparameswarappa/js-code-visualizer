/**
 * PresetData - Algorithm preset code samples
 */

export const PRESETS = {
  'bubble-sort': {
    name: 'Bubble Sort',
    category: 'sorting',
    code: `// Bubble Sort Algorithm
let arr = [64, 34, 25, 12, 22, 11, 90];
let n = arr.length;

console.log("Initial array:", arr.join(", "));

for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      let temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}

console.log("Sorted array:", arr.join(", "));`
  },

  'merge-sort': {
    name: 'Merge Sort',
    category: 'sorting',
    code: `// Merge Sort Algorithm
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  console.log("Splitting:", arr.join(", "));

  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);

  return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  result = result.concat(left.slice(leftIndex));
  result = result.concat(right.slice(rightIndex));
  
  console.log("Merged:", result.join(", "));
  return result;
}

let arr = [38, 27, 43, 3, 9, 82, 10];
console.log("Initial:", arr.join(", "));
let sorted = mergeSort(arr);
console.log("Result:", sorted.join(", "));`
  },

  'quicksort': {
    name: 'Quicksort',
    category: 'sorting',
    code: `// Quicksort Algorithm
function quicksort(arr, low, high) {
  if (low < high) {
    let pivotIndex = partition(arr, low, high);
    quicksort(arr, low, pivotIndex - 1);
    quicksort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  let pivot = arr[high];
  console.log("Pivot:", pivot);
  
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  let temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;

  console.log("After partition:", arr.join(", "));
  return i + 1;
}

let arr = [10, 7, 8, 9, 1, 5];
console.log("Initial:", arr.join(", "));
quicksort(arr, 0, arr.length - 1);
console.log("Sorted:", arr.join(", "));`
  },

  'binary-search': {
    name: 'Binary Search',
    category: 'searching',
    code: `// Binary Search Algorithm
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  console.log("Searching for:", target);
  console.log("Array:", arr.join(", "));

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    console.log("Checking index", mid, "value:", arr[mid]);

    if (arr[mid] === target) {
      console.log("Found at index:", mid);
      return mid;
    }

    if (arr[mid] < target) {
      console.log("Target is larger, search right half");
      left = mid + 1;
    } else {
      console.log("Target is smaller, search left half");
      right = mid - 1;
    }
  }

  console.log("Target not found");
  return -1;
}

let sortedArr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
let target = 23;
let result = binarySearch(sortedArr, target);`
  },

  'fibonacci': {
    name: 'Fibonacci (Recursive)',
    category: 'recursion',
    code: `// Fibonacci - Recursive
function fibonacci(n) {
  console.log("fibonacci(" + n + ")");
  
  if (n <= 1) {
    console.log("Base case: returning", n);
    return n;
  }
  
  let result = fibonacci(n - 1) + fibonacci(n - 2);
  console.log("fibonacci(" + n + ") = " + result);
  return result;
}

let n = 6;
console.log("Computing fibonacci(" + n + ")");
let result = fibonacci(n);
console.log("Final result:", result);`
  },

  'factorial': {
    name: 'Factorial (Recursive)',
    category: 'recursion',
    code: `// Factorial - Recursive
function factorial(n) {
  console.log("factorial(" + n + ")");
  
  if (n <= 1) {
    console.log("Base case: returning 1");
    return 1;
  }
  
  let result = n * factorial(n - 1);
  console.log("factorial(" + n + ") = " + result);
  return result;
}

let n = 5;
console.log("Computing", n + "!");
let result = factorial(n);
console.log("Result:", result);`
  },

  'tree-traversal': {
    name: 'Binary Tree Traversal',
    category: 'recursion',
    code: `// Binary Tree Traversal
let tree = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4, left: null, right: null },
    right: { value: 5, left: null, right: null }
  },
  right: {
    value: 3,
    left: { value: 6, left: null, right: null },
    right: { value: 7, left: null, right: null }
  }
};

function inOrder(node) {
  if (node === null) return;
  inOrder(node.left);
  console.log("Visit:", node.value);
  inOrder(node.right);
}

function preOrder(node) {
  if (node === null) return;
  console.log("Visit:", node.value);
  preOrder(node.left);
  preOrder(node.right);
}

console.log("In-order traversal:");
inOrder(tree);

console.log("\\nPre-order traversal:");
preOrder(tree);`
  },

  'custom': {
    name: 'Custom Code',
    category: 'custom',
    code: `// Write your own JavaScript code here!
// 
// Tips:
// - Use console.log() to output messages
// - Arrays will be visualized automatically
// - Recursive functions will show a call tree

let numbers = [5, 2, 8, 1, 9];
console.log("Original:", numbers);

for (let i = 0; i < numbers.length; i++) {
  for (let j = i + 1; j < numbers.length; j++) {
    if (numbers[i] > numbers[j]) {
      let temp = numbers[i];
      numbers[i] = numbers[j];
      numbers[j] = temp;
    }
  }
}

console.log("Sorted:", numbers);`
  }
};

export default PRESETS;
