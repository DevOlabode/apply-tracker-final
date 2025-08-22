      document.addEventListener('DOMContentLoaded', function() {
        const elements = document.querySelectorAll('.card, .list-group-item, .btn');
        elements.forEach((el, index) => {
          el.style.animationDelay = `${index * 0.1}s`;
          el.classList.add('fade-in');
        });
      });