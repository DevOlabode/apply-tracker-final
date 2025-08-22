let currentStep = 1;
const totalSteps = 3;

function changeStep(direction) {
  const steps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  
  // Hide current step
  steps[currentStep - 1].classList.remove('active');
  progressSteps[currentStep - 1].classList.remove('active');
  
  // Update step
  currentStep += direction;
  
  // Show new step
  steps[currentStep - 1].classList.add('active');
  progressSteps[currentStep - 1].classList.add('active');
  
  // Update navigation buttons
  document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'inline-block';
  document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'inline-block';
  document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
}

// Password strength indicator
document.getElementById('password').addEventListener('input', function(e) {
  const password = e.target.value;
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  
  strengthFill.style.width = strength + '%';
  
  if (strength < 50) {
    strengthText.textContent = 'Weak';
    strengthFill.style.background = 'var(--danger-color)';
  } else if (strength < 75) {
    strengthText.textContent = 'Medium';
    strengthFill.style.background = 'var(--warning-color)';
  } else {
    strengthText.textContent = 'Strong';
    strengthFill.style.background = 'var(--success-color)';
  }
});

// Form validation
document.getElementById('signupForm').addEventListener('submit', function(e) {
  if (!this.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
  }
  this.classList.add('was-validated');
});

// Social login functions
function socialLogin(provider) {
  console.log(`Logging in with ${provider}`);
}