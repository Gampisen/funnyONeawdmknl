window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Create a WebSocket connection
  const socket = new WebSocket('ws://localhost:3000'); // Replace with your server URL

  // Adjust canvas size to match viewport
  resizeCanvas();

  function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }

  // Handle zooming using scroll wheel
  window.addEventListener('wheel', handleZoom);

  function handleZoom(event) {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const wheelDelta = event.deltaY;
      if (wheelDelta > 0) {
          scale -= zoomSpeed;
      } else {
          scale += zoomSpeed;
      }
      applyZoom();
      // Send the scale value to the server for synchronization
      sendScale(scale);
  }

  function applyZoom() {
      canvas.style.transform = `scale(${scale})`;
  }

  // Adjust canvas size when the window is resized
  window.addEventListener('resize', () => {
      resizeCanvas();
      applyZoom();
  });

  // Handle drawing
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  function startDrawing(event) {
      isDrawing = true;
      [lastX, lastY] = getMousePosition(event);
      // Notify the server that drawing has started
      sendDrawData({ type: 'start', x: lastX, y: lastY });
  }

  function draw(event) {
      if (!isDrawing) return;

      const [x, y] = getMousePosition(event);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      [lastX, lastY] = [x, y];
      // Send the drawing data to the server for synchronization
      sendDrawData({ type: 'draw', x, y });
  }

  function stopDrawing() {
      isDrawing = false;
      // Notify the server that drawing has stopped
      sendDrawData({ type: 'stop' });
  }

  function getMousePosition(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return [
          (event.clientX - rect.left) * scaleX,
          (event.clientY - rect.top) * scaleY
      ];
  }

  // Send drawing data to the server for synchronization
  function sendDrawData(data) {
      socket.send(JSON.stringify(data));
  }

  // Receive drawing data from the server and update the canvas
  socket.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      if (data.type === 'start') {
          [lastX, lastY] = [data.x, data.y];
      } else if (data.type === 'draw') {
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(data.x, data.y);
          ctx.stroke();
          [lastX, lastY] = [data.x, data.y];
      }
  });

  // Notify the server that a new client has connected
  socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'new-client' }));
  });

  // Close the WebSocket connection when the window is unloaded
  window.addEventListener('beforeunload', () => {
      socket.close();
  });
});
