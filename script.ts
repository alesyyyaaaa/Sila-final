interface SliderConfig {
  autoSlideDelay?: number;
}

interface FavoriteItem {
  id: string;
  title: string;
  price: string;
}

class AutoSlider {
  private sliderWrapper: HTMLDivElement | null;
  private slides: NodeListOf<HTMLDivElement>;
  private prevBtn: HTMLButtonElement | null;
  private nextBtn: HTMLButtonElement | null;
  private dotsContainer: HTMLDivElement | null;
  private autoSlideDelay: number;
  private currentIndex: number = 0;
  private autoSlideInterval: number | undefined;

  constructor(config: SliderConfig = {}) {
    this.sliderWrapper = document.getElementById('sliderWrapper') as HTMLDivElement | null;
    this.slides = document.querySelectorAll('.slide') as NodeListOf<HTMLDivElement>;
    this.prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
    this.nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
    this.dotsContainer = document.getElementById('dots') as HTMLDivElement | null;
    this.autoSlideDelay = config.autoSlideDelay || 3000;
  }

  private createDots(): void {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = index === this.currentIndex ? 'dot active' : 'dot';
      dot.type = 'button';
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer?.appendChild(dot);
    });
  }

  private updateDots(): void {
    document.querySelectorAll<HTMLButtonElement>('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  private goToSlide(index: number): void {
    if (!this.sliderWrapper || this.slides.length === 0) return;

    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;

    this.currentIndex = index;
    this.sliderWrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    this.updateDots();
    this.startAutoSlide();
  }

  private startAutoSlide(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = window.setInterval(() => {
      this.goToSlide(this.currentIndex + 1);
    }, this.autoSlideDelay);
  }

  public init(): void {
    if (!this.sliderWrapper || this.slides.length === 0) return;

    this.createDots();
    this.startAutoSlide();

    this.prevBtn?.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
    this.nextBtn?.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));

    this.sliderWrapper.parentElement?.addEventListener('mouseenter', () => {
      if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    });

    this.sliderWrapper.parentElement?.addEventListener('mouseleave', () => this.startAutoSlide());
  }
}

function initBurgerMenu(): void {
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

function initFavorites(): void {
  const favoriteButtons = document.querySelectorAll<HTMLButtonElement>('.favorite-btn');
  const favoritesContainer = document.getElementById('favorites-list');
  const emptyText = document.getElementById('favorites-empty');

  const getFavorites = (): FavoriteItem[] => {
    return JSON.parse(localStorage.getItem('favoriteSubscriptions') || '[]') as FavoriteItem[];
  };

  const saveFavorites = (favorites: FavoriteItem[]): void => {
    localStorage.setItem('favoriteSubscriptions', JSON.stringify(favorites));
  };

  const renderFavorites = (): void => {
    const favorites = getFavorites();

    favoriteButtons.forEach((button) => {
      const card = button.closest<HTMLElement>('.card');
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
        <button class="remove-favorite" type="button" data-id="${item.id}">Удалить</button>
      `;
      favoritesContainer.appendChild(favoriteItem);
    });

    favoritesContainer.querySelectorAll<HTMLButtonElement>('.remove-favorite').forEach((button) => {
      button.addEventListener('click', () => {
        saveFavorites(getFavorites().filter((item) => item.id !== button.dataset.id));
        renderFavorites();
      });
    });
  };

  favoriteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest<HTMLElement>('.card');
      if (!card || !card.dataset.id) return;

      const newFavorite: FavoriteItem = {
        id: card.dataset.id,
        title: card.querySelector('h2')?.textContent?.trim() || 'Абонемент',
        price: card.querySelector('.price')?.textContent?.trim() || ''
      };

      const favorites = getFavorites();
      const isFavorite = favorites.some((item) => item.id === newFavorite.id);

      saveFavorites(
        isFavorite
          ? favorites.filter((item) => item.id !== newFavorite.id)
          : [...favorites, newFavorite]
      );

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

function initBuyPopup(): void {
  const buyForm = document.getElementById('buyForm') as HTMLFormElement | null;
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');

  if (!buyForm || !popup) return;

  buyForm.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    popup.classList.add('active');
    buyForm.reset();
  });

  closePopup?.addEventListener('click', () => popup.classList.remove('active'));

  popup.addEventListener('click', (event: MouseEvent) => {
    if (event.target === popup) {
      popup.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', initBuyPopup);
