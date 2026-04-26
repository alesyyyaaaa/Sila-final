class AutoSlider {
  constructor(config = {}) {
    this.sliderWrapper = document.getElementById('sliderWrapper');
    this.slides = document.querySelectorAll('.slide');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.dotsContainer = document.getElementById('dots');

    this.config = {
      autoSlideDelay: 3000,
      transitionDuration: 500,
      ...config
    };

    this.currentIndex = 0;
    this.slideCount = this.slides.length;
    this.autoSlideInterval = null;
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    for (let i = 0; i < this.slideCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === this.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.appendChild(dot);
    }
  }

  updateDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  goToSlide(index) {
    if (!this.sliderWrapper || this.slideCount === 0) return;

    if (index < 0) index = this.slideCount - 1;
    if (index >= this.slideCount) index = 0;

    this.currentIndex = index;
    this.sliderWrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    this.updateDots();
    this.resetAutoSlide();
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextSlide(), this.config.autoSlideDelay);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  resetAutoSlide() {
    this.startAutoSlide();
  }

  stopAutoSlideOnHover() {
    const container = document.querySelector('.slider-container');
    if (!container) return;

    container.addEventListener('mouseenter', () => this.stopAutoSlide());
    container.addEventListener('mouseleave', () => this.startAutoSlide());
  }

  init() {
    if (!this.sliderWrapper || this.slideCount === 0) return;

    this.createDots();
    this.startAutoSlide();
    this.stopAutoSlideOnHover();

    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
  }
}

function initBurgerMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');

  if (!menuToggle || !menu) return;

  menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => menu.classList.remove('active'));
  });
}

function initFavorites() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  const favoritesContainer = document.getElementById('favorites-list');
  const emptyText = document.getElementById('favorites-empty');

  if (!favoriteButtons.length) return;

  const getFavorites = () => JSON.parse(localStorage.getItem('favoriteSubscriptions') || '[]');
  const saveFavorites = (favorites) => localStorage.setItem('favoriteSubscriptions', JSON.stringify(favorites));

  const renderFavorites = () => {
    const favorites = getFavorites();

    favoriteButtons.forEach((button) => {
      const card = button.closest('.card');
      const id = card?.dataset.id;
      const isFavorite = favorites.some((item) => item.id === id);
      button.classList.toggle('active', isFavorite);
      button.textContent = isFavorite ? 'Удалить из избранного' : 'В избранное';
    });

    if (!favoritesContainer || !emptyText) return;

    favoritesContainer.innerHTML = '';
    emptyText.style.display = favorites.length ? 'none' : 'block';

    favorites.forEach((item) => {
      const favoriteItem = document.createElement('div');
      favoriteItem.className = 'favorite-item';
      favoriteItem.innerHTML = `
        <div>
          <h3>${item.title}</h3>
          <p>${item.price}</p>
        </div>
        <button class="remove-favorite" data-id="${item.id}">Удалить</button>
      `;
      favoritesContainer.appendChild(favoriteItem);
    });

    favoritesContainer.querySelectorAll('.remove-favorite').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        saveFavorites(getFavorites().filter((item) => item.id !== id));
        renderFavorites();
      });
    });
  };

  favoriteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      if (!card) return;

      const id = card.dataset.id;
      const title = card.querySelector('h2')?.textContent.trim() || 'Абонемент';
      const price = card.querySelector('.price')?.textContent.trim() || '';
      let favorites = getFavorites();

      if (favorites.some((item) => item.id === id)) {
        favorites = favorites.filter((item) => item.id !== id);
      } else {
        favorites.push({ id, title, price });
      }

      saveFavorites(favorites);
      renderFavorites();
    });
  });

  renderFavorites();
}

document.addEventListener('DOMContentLoaded', () => {
  new AutoSlider().init();
  initBurgerMenu();
  initFavorites();
});

function initBuyPopup() {
  const buyForm = document.getElementById('buyForm');
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');

  if (!buyForm || !popup) return;

  buyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    popup.classList.add('active');
    buyForm.reset();
  });

  if (closePopup) {
    closePopup.addEventListener('click', () => popup.classList.remove('active'));
  }

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', initBuyPopup);
