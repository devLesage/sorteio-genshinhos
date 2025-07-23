let players = [];
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
let currentRotation = 0;

const form = document.getElementById('participantForm');
const participantsList = document.getElementById('participants');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const weight = parseFloat(document.getElementById('weight').value.trim());
  if (name && weight > 0) {
    players.push({ name, weight });
    updateParticipantList();
    drawRouletteWheel();
    form.reset();
  }
});

document.getElementById('clearAll').addEventListener('click', function() {
  players = [];
  updateParticipantList();
  drawRouletteWheel();
  document.getElementById('winner').innerText = '';
});

document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    json.forEach(row => {
      const name = row.Nome?.toString().trim();
      const weight = parseFloat((row.Chance || '').toString().replace(',', '.'));
      if (name && !isNaN(weight)) {
        players.push({ name, weight });
      }
    });

    updateParticipantList();
    drawRouletteWheel();
  };
  reader.readAsArrayBuffer(file);
});

function updateParticipantList() {
  participantsList.innerHTML = '';
  players.forEach((p, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${p.name} (chance: ${p.weight})`;
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-outline-danger';
    btn.textContent = 'Remover';
    btn.onclick = () => {
      players.splice(index, 1);
      updateParticipantList();
      drawRouletteWheel();
    };
    li.appendChild(btn);
    participantsList.appendChild(li);
  });
}

function getRandomColor() {
  const letters = '6789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

function drawWheel() {
  if (players.length === 0) return;

  const totalWeight = players.reduce((sum, p) => sum + p.weight, 0);
  let currentAngle = 0;

  players.forEach(player => {
    const sliceAngle = (player.weight / totalWeight) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, currentAngle, currentAngle + sliceAngle);
    ctx.fillStyle = getRandomColor();
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(player.name, radius - 10, 0);
    ctx.restore();

    currentAngle += sliceAngle;
  });

  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

function spin() {
  if (players.length === 0) {
    alert("Adicione participantes primeiro!");
    return;
  }

  canvas.style.transition = 'none';
  canvas.style.transform = `rotate(${currentRotation % 360}deg)`;

  setTimeout(() => {
    const spins = 15;
    const randomAngle = Math.random() * 360;
    const finalRotation = spins * 360 + randomAngle;

    currentRotation += finalRotation;

    canvas.style.transition = 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      getWinner(randomAngle);
    }, 5100);
  }, 50);
}

function getWinner(randomAngle) {
  const totalWeight = players.reduce((sum, p) => sum + p.weight, 0);
  let normalized = (currentRotation % 360);
  let pointerAngle = (360 - normalized + 270) % 360;
  let currentAngle = 0;
  for (const p of players) {
    const sliceAngle = (p.weight / totalWeight) * 360;
    if (pointerAngle >= currentAngle && pointerAngle < currentAngle + sliceAngle) {
      document.getElementById('winner').innerText = `🎉 Vencedor: ${p.name}!`;
      return;
    }
    currentAngle += sliceAngle;
  }
}

function drawRouletteWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWheel();
}

drawRouletteWheel();
