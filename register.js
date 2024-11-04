document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    location: document.getElementById('location').value,
    weight: document.getElementById('weight').value,
    interval: document.getElementById('interval').value,
  };

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('message').innerText = result.message;
});
