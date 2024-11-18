const form = document.getElementById('signupForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = form.username.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // Validate if passwords match
  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match!";
    message.style.color = 'red';
    return;
  }

  const formData = {
    username,
    email,
    password,
  };

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const responseMessage = await response.text();
    message.textContent = responseMessage;

    if (response.ok) {
      message.style.color = 'green';
      // Optionally, redirect to login after successful signup
      window.location.href = '/login.html';
    } else {
      message.style.color = 'red';
    }
  } catch (error) {
    message.textContent = 'An error occurred. Please try again.';
    message.style.color = 'red';
  }
});
