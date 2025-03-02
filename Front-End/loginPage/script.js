const signInBtn = document.getElementById('signIn');
const signUpBtn = document.getElementById('signUp');
const fistForm = document.getElementById('form1');
const secondForm = document.getElementById('form2');
const container = document.querySelector('.container');

signInBtn.addEventListener('click', () => {
  container.classList.remove('right-panel-active');
});

signUpBtn.addEventListener('click', () => {
  container.classList.add('right-panel-active');
});

document.getElementById('signupForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Collect the form data
  const formData = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  console.log("Form data from the frontend:", formData); // Debugging log

  // Make a POST request to the backend
  fetch('/signUp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        // Handle non-2xx responses (e.g., 404, 500)
        return response.text().then((text) => {
          throw new Error(`Server error: ${response.status} - ${text}`);
        });
      }
      return response.json(); // Parse JSON response
    })
    .then((data) => {
      console.log('Success:', data);
      alert('Sign up successful!');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    });
});

document.getElementById('signinForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Collect the form data
  const formData = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value,
  };

  console.log("Form data from the frontend:", formData); // Debugging log

  // Make a POST request to the backend
  fetch('/SingIn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        // Handle non-2xx responses (e.g., 404, 500)
        return response.text().then((text) => {
          throw new Error(`Server error: ${response.status} - ${text}`);
        });
      }
      return response.json(); // Parse JSON response
    })
    .then((data) => {
      console.log('Success:', data);
      // Handle success (e.g., redirect or show a message)
      alert('Login successful!');
      // Redirect to the dashboard or home page
      window.location.href = '/dashboard'; // Change this to your desired redirect URL
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
      alert(`Error: ${error.message}`);
    });
});

fistForm.addEventListener('submit', (e) => e.preventDefault());
secondForm.addEventListener('submit', (e) => e.preventDefault());