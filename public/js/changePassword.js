document.addEventListener('DOMContentLoaded', function() {
  const newPasswordInput = document.getElementById('newPassword');
  const strengthFill = document.createElement('div');
  const strengthText = document.createElement('span');
  const strengthContainer = document.createElement('div');
  
  strengthContainer.className = 'password-strength';
  strengthFill.className = 'strength-fill';
  strengthText.className = 'strength-text';
  
  const strengthBar = document.createElement('div');
  strengthBar.className = 'strength-bar';
  strengthBar.appendChild(strengthFill);
  
  strengthContainer.appendChild(strengthBar);
  strengthContainer.appendChild(strengthText);
  
  newPasswordInput.parentNode.appendChild(strengthContainer);
  
  newPasswordInput.addEventListener('input', function(e) {
    const password = e.target.value;
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    strengthFill.style.width = Math.min(strength, 100) + '%';
    
    if (strength < 50) {
      strengthText.textContent = 'Weak password';
      strengthFill.style.background = 'var(--danger-color)';
    } else if (strength < 75) {
      strengthText.textContent = 'Medium strength';
      strengthFill.style.background = 'var(--warning-color)';
    } else {
      strengthText.textContent = 'Strong password!';
      strengthFill.style.background = 'var(--success-color)';
    }
  });
});

// Form validation
document.querySelector('.password-form').addEventListener('submit', function(e) {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    e.preventDefault();
    alert('Passwords do not match!');
    return false;
  }
  
  if (!this.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  this.classList.add('was-validated');
});