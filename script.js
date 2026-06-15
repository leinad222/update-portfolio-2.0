// ============================================
// HEADER BACKGROUND ON SCROLL
// ============================================
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.background = 'var(--container-color)';
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  } else {
    header.style.background = 'transparent';
    header.style.boxShadow = 'none';
  }
});

// ============================================
// ACTIVE LINK HIGHLIGHTING
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active-link');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active-link');
    }
  });
});

// ============================================
// LIGHT & DARK MODE TOGGLE
// ============================================
const themeToggle = document.getElementById('change-theme');
const html = document.documentElement;
const THEME_KEY = 'portfolio-theme';

// Load saved theme or default to dark
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'light') {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
}

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
  updateThemeIcon(newTheme);
});

// ============================================
// MOBILE MENU TOGGLE & CLOSE
// ============================================
const navToggle = document.querySelector('.nav-toggle');
const navClose = document.querySelector('.nav-close');
const navMenu = document.getElementById('nav-menu');
const navLinksAll = document.querySelectorAll('.nav-link');

// Open menu
navToggle.addEventListener('click', () => {
  navMenu.classList.add('active');
});

// Close menu button
navClose.addEventListener('click', () => {
  navMenu.classList.remove('active');
});

// Close menu when clicking on a link
navLinksAll.forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav') && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
  }
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
  }
});

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
window.addEventListener("load", () => {
  if (window.location.hash === "#menu") {
    history.replaceState(null, null, window.location.pathname);
  }
});

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  // Text gradient animation
  gsap.utils.toArray('.text-gradient').forEach((span) => {
    gsap.to(span, {
      backgroundSize: '100%, 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: span,
        start: 'top bottom',
        end: 'top center',
        scrub: true,
      }
    });
  });

  // Fade-in animation for cards and sections
  gsap.utils.toArray('.services-card, .skill-item, .contact-item').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    });
  });

  // Stagger animation for home section
  gsap.from('.home-data > *', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.2,
  });
});

// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// --- Minimal cart/paypal and quote handling (safe defaults) ---
// Simple in-memory cart
let cart = [];

const CART_KEY = 'portfolio_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error('Failed to load cart', e);
  }
  return [];
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart', e);
  }
}

function formatEuro(value) {
  return '€' + Number(value).toFixed(2);
}

function updateCartUI() {
  const paypalContainer = document.getElementById('paypal-button-container');
  const quoteNotice = document.getElementById('quote-notice');
  const subtotalEl = document.getElementById('cart-subtotal');

  const subtotal = cart.reduce((s, it) => s + Number(it.price || 0), 0);
  if (subtotalEl) subtotalEl.innerText = formatEuro(subtotal);

  if (subtotal > 0) {
    if (paypalContainer) paypalContainer.style.display = 'block';
    if (quoteNotice) quoteNotice.style.display = 'none';
  } else {
    if (paypalContainer) paypalContainer.style.display = 'none';
    if (quoteNotice) quoteNotice.style.display = 'block';
  }
}

function addToCart(name, price) {
  cart.push({ name: name || 'Item', price: Number(price) || 0 });
  updateCartUI();
  renderCart();
  saveCart();
  initPayPal();
}

function renderCart() {
  const list = document.getElementById('cart-items');
  const count = document.getElementById('cart-count');
  if (!list) return;
  list.innerHTML = '';
  cart.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-meta">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">${formatEuro(item.price)}</div>
      </div>
      <div>
        <button class="cart-remove" data-index="${idx}" aria-label="Remove item">&times;</button>
      </div>`;
    list.appendChild(li);
  });
  if (count) count.innerText = String(cart.length);
  // attach remove handlers
  list.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(btn.getAttribute('data-index'));
      removeFromCart(i);
    });
  });
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  updateCartUI();
  renderCart();
  initPayPal();
  saveCart();
}

function clearCart() {
  cart = [];
  updateCartUI();
  renderCart();
  initPayPal();
  saveCart();
}

function toggleCart(open) {
  const panel = document.getElementById('cart-panel');
  if (!panel) return;
  const shouldOpen = typeof open === 'boolean' ? open : !panel.classList.contains('open');
  panel.classList.toggle('open', shouldOpen);
  panel.setAttribute('aria-hidden', String(!shouldOpen));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[c]; });
}

function initPayPal() {
  const container = document.getElementById('paypal-button-container');
  if (!container || typeof paypal === 'undefined') return;
  function getSubtotalAmount() {
    const el = document.getElementById('cart-subtotal');
    if (!el) return '0.00';
    const raw = el.innerText || '';
    const cleaned = raw.replace(/[^0-9.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return (isNaN(num) ? 0 : num).toFixed(2);
  }

  try {
    container.innerHTML = '';
    paypal.Buttons({
      createOrder: function (data, actions) {
        const amount = getSubtotalAmount();
        if (parseFloat(amount) <= 0) {
          alert('Your subtotal is €0.00 — add items before paying.');
          return actions.reject();
        }
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: 'EUR', value: amount } }]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert('Payment received — thank you ' + (details.payer.name?.given_name || '') + '!');
          // clear cart and update UI
          cart = [];
          saveCart();
          updateCartUI();
          renderCart();
          // re-render PayPal (will hide if subtotal is zero)
          initPayPal();
        });
      },
      onError: function (err) {
        console.error('PayPal error', err);
        alert('Payment error — check the console for details.');
      }
    }).render('#paypal-button-container');
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const quoteButtons = document.querySelectorAll('.quote-trigger');
  const subjectInput = document.getElementById('product-subject');
  const quoteSection = document.getElementById('quote-section');
  // load cart from storage
  cart = loadCart();
  quoteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productName = button.getAttribute('data-product') || '';
      const price = button.getAttribute('data-price') || '0';
      // fill quote subject
      if (subjectInput) subjectInput.value = `Quote for: ${productName}`;
      if (quoteSection) quoteSection.scrollIntoView({ behavior: 'smooth' });
      if (subjectInput) {
        subjectInput.style.backgroundColor = '#fff9c4';
        setTimeout(() => subjectInput.style.backgroundColor = '', 1000);
      }
      // add to cart and update subtotal
      addToCart(productName, price);
    });
  });

  document.querySelectorAll('.pricing-card').forEach((card) => {
    const nameEl = card.querySelector('h3, h4');
    const priceEl = card.querySelector('.price');
    if (!nameEl || !priceEl) return;

    const priceValue = parseFloat(priceEl.textContent.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    const name = nameEl.textContent.trim();

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'button add-to-cart';
    addButton.textContent = 'Add to Cart';
    addButton.addEventListener('click', () => {
      addToCart(name, priceValue);
      renderCart();
    });

    card.appendChild(addButton);
  });

  updateCartUI();
  // Initialize PayPal buttons on load (if PayPal SDK is available)
  initPayPal();
  // render initial cart state and wire cart controls
  renderCart();
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const clearBtn = document.getElementById('clear-cart');
  if (cartToggle) cartToggle.addEventListener('click', () => toggleCart(true));
  if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));
  if (clearBtn) clearBtn.addEventListener('click', () => clearCart());
});
