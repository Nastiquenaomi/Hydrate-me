document.getElementById('locationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('city').value;

  const response = await fetch('/calculate-water-goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });

  const result = await response.json();
  if (result.waterGoal) {
    sessionStorage.setItem('waterGoal', result.waterGoal);
    window.location.href = 'result.html';
  } else {
    document.getElementById('message').innerText = result.message;
  }
});
