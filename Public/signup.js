const form = document.getElementById('signupForm');
const responseMessage = document.getElementById('responseMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const formData = {
    username: form.username.value,
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const message = await response.text();
    responseMessage.textContent = message;

    if (response.ok) {
      responseMessage.style.color = 'green';
    } else {
      responseMessage.style.color = 'red';
    }
  } catch (error) {
    responseMessage.textContent = 'An error occurred. Please try again.';
    responseMessage.style.color = 'red';
  }
});
