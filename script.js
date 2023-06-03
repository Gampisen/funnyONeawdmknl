window.onload = function() {
  const board = document.querySelector('.board');
  const numBoxesInput = document.getElementById('numBoxesInput');
  let pressedBoxes = [];

  // Dynamically create the 5x5 board
  for (let i = 0; i < 25; i++) {
    const box = document.createElement('div');
    box.classList.add('box');
    box.addEventListener('click', function() {
      toggleBox(box);
    });
    board.appendChild(box);
  }

  function toggleBox(box) {
    if (pressedBoxes.includes(box)) {
      return;
    }

    box.classList.add('pressed');
    pressedBoxes.push(box);
  }

  function generateBoxes() {
    const numBoxes = parseInt(numBoxesInput.value);
    if (numBoxes < 1 || numBoxes > 24) {
      alert('Please enter a number between 1 and 24.');
      return;
    }
  
    // Reset all boxes to their default state
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(function(box) {
      box.classList.remove('pressed', 'marked');
    });
  
    // Clear the pressedBoxes array
    pressedBoxes = [];
  
    // Randomly mark the desired number of boxes
    const markedBoxes = getRandomBoxes(boxes, numBoxes);
    markedBoxes.forEach(function(box) {
      box.classList.add('marked');
    });
  
    // Reattach click event listener to all boxes
    boxes.forEach(function(box) {
      box.addEventListener('click', function() {
        toggleBox(box);
      });
    });
  }
  

  function getRandomBoxes(boxes, num) {
  const randomBoxes = [];
  const totalBoxes = boxes.length;
  const markedIndices = new Set();

  while (randomBoxes.length < num) {
    const randomIndex = Math.floor(Math.random() * totalBoxes);
    if (!markedIndices.has(randomIndex)) {
      const randomBox = boxes[randomIndex];
      randomBoxes.push(randomBox);
      markedIndices.add(randomIndex);
    }
  }

  return randomBoxes;
}

  
  

  const generateButton = document.querySelector('.controls button');
  generateButton.addEventListener('click', generateBoxes);
};
