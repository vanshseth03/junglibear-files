

// Global function to prevent reference errors
window.setupPriceFilter = function() {

};

// Variables for image navigation
let currentImageIndex = 0;
let productImages = [];
let categoriesInitialized = false;
// DOM elements
const carouselTrackEl = document.getElementById("carouselTrack");
const prevButtonEl = document.getElementById("prevButton");
const nextButtonEl = document.getElementById("nextButton");
const productGridEl = document.getElementById("productGrid");
const loadMoreBtnEl = document.getElementById("loadMoreBtn");
const currentYearEl = document.getElementById("currentYear");
const cartIconEl = document.getElementById("cartIcon");
const cartCountEl = document.getElementById("cartCount");

// Filter elements
const filterBtnEl = document.getElementById("filterBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
const filterModalEl = document.getElementById("filterModal");
const closeFilterButtonEl = document.getElementById("closeFilterButton");
const resetFilterBtnEl = document.getElementById("resetFilter");
const applyFilterBtnEl = document.getElementById("applyFilterButton");
const filterOptionsEl = document.getElementById("filterOptions");

// Modal elements
const cartModalEl = document.getElementById("cartModal");
const closeCartButtonEl = document.getElementById("closeCartButton");
const cartItemsEl = document.getElementById("cartItems");
const emptyCartMessageEl = document.getElementById("emptyCartMessage");
const checkoutFormEl = document.getElementById("checkoutForm");
const subtotalEl = document.getElementById("subtotal");
const deliveryTotalEl = document.getElementById("deliveryTotal");
const orderTotalEl = document.getElementById("orderTotal");
const checkoutButtonEl = document.getElementById("checkoutButton");

const productModalEl = document.getElementById("productModal");
const closeProductButtonEl = document.getElementById("closeProductButton");
const productModalTitleEl = document.getElementById("productModalTitle");
const productModalImageEl = document.getElementById("productModalImage");
const productModalPriceEl = document.getElementById("productModalPrice");
const productModalDescriptionEl = document.getElementById("productModalDescription");
const productModalCategoryEl = document.getElementById("productModalCategory");
const productModalAvailabilityEl = document.getElementById("productModalAvailability");
const decreaseQuantityEl = document.getElementById("decreaseQuantity");
const productQuantityEl = document.getElementById("productQuantity");
const increaseQuantityEl = document.getElementById("increaseQuantity");
const addToCartButtonEl = document.getElementById("addToCartButton");
const shareProductButtonEl = document.getElementById("shareProductButton");

const confirmationModalEl = document.getElementById("confirmationModal");
const closeConfirmationButtonEl = document.getElementById("closeConfirmationButton");
const confirmationDetailsEl = document.getElementById("confirmationDetails");
const continueShoppingEl = document.getElementById("continueShopping");

// Form elements
const nameEl = document.getElementById("name");
const nameErrorEl = document.getElementById("nameError");
const phoneEl = document.getElementById("phone");
const phoneErrorEl = document.getElementById("phoneError");
const addressEl = document.getElementById("address");
const addressErrorEl = document.getElementById("addressError");
const deliveryOptionEls = document.getElementsByName("deliveryOption");
const deliveryOptionErrorEl = document.getElementById("deliveryOptionError");
const homeDeliveryDetailsEl = document.getElementById("homeDeliveryDetails");
const societyEl = document.getElementById("society");
const societyErrorEl = document.getElementById("societyError");
const deliveryFeeEl = document.getElementById("deliveryFee");

// Global state variables
let currentSlide = 0;
let selectedCategory = "all";
let priceFilter = 1000;
let selectedProduct = null;
let visibleProductCount = 8;
let cartItems = [];
let deliveryFee = 0;
let selectedCategories = [];
const API_BASE_URL = ' https://junglibear.onrender.com/api';
let products = [];
let carouselItems = [];
let nextOrderID= 1
let orderId = 0
async function fetchProducts() {
    try {
        // Show loading state
        if (productGridEl) {
            productGridEl.innerHTML = '<div class="loading-spinner"></div>';
        }
        
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        products = data;

        // Ensure there are products to work with
        if (!products || products.length === 0) {
            throw new Error("No products found");
        }
        
        // Find max product price and round up to nearest 100
        const maxProductPrice = Math.max(...products.map(p => p.price || 0));
        priceFilter = Math.ceil(maxProductPrice / 100) * 100;
        // Extract carousel items
        carouselItems = products
            .filter(item => item.inCarousel === true)
            .map(item => ({
                id: item.id,
                image: item.images && item.images.length > 0 ? item.images[0] : 'placeholder.jpg',
                title: item.carouselTitle || item.title || "No Title",
                subtitle: item.carouselSubtitle || "Quality Product",
                productId: item.id
            }));

        // Make them globally available
        window.products = products;
        window.carouselItems = carouselItems;

        // Preload carousel images
        if (carouselItems.length > 0) {
            const carouselImageUrls = carouselItems.map(item => item.image);
            try {
                await Promise.all(carouselImageUrls.map(url => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => resolve();
                        img.onerror = () => resolve(); // Continue even if image fails to load
                        img.src = url;
                    });
                }));
            } catch (error) {
                console.warn("Error preloading carousel images:", error);
            }
        }

        // Fire a custom event once data is ready
        window.dispatchEvent(new Event('productsReady'));
        
        // Initialize the application with the fetched data
        init();
    } catch (err) {
        console.error("Fetch error:", err);
        if (productGridEl) {
            productGridEl.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem;">
                    <p>Failed to load products. Please try again later.</p>
                    <button class="button" onclick="fetchProducts()">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize the application
function init() {
  // Set current year in footer
  currentYearEl.textContent = new Date().getFullYear();
  
  // Initialize carousel
  setupCarousel();
  
  // Initialize category filter
  populateCategories();
  
  // Check for product ID in URL
  checkForProductInURL();
  
  // Render initial products
  filterAndRenderProducts();
  
  // Load cart from local storage if available
  loadCartFromStorage();
   const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  updateProductCardsFromCart();
  // Set up event listeners
  setupEventListeners();
  
}

// Check for product ID in URL
function checkForProductInURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    const id = parseInt(productId);
    const product = findProductById(id);
    
    if (product) {
      // Open the product modal after a short delay to ensure DOM is ready
      setTimeout(() => {
        openProductModal(product);
      }, 300);
    }
  }
}

// Handle popstate event for back/forward browser navigation
// Handle popstate event for back/forward browser navigation
window.addEventListener('popstate', (event) => {
  // Check if there's a product ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    const id = parseInt(productId);
    const product = findProductById(id);
    
    if (product) {
      // Open the product modal
      openProductModal(product);
    }
  } else {
    // If no product ID in URL, close any open product modal
    closeProductModal();
  }
  
  // Don't reset search when browser back button is pressed
  // Keep current search state intact
});

// Find product by ID
function findProductById(id) {
  return products.find(product => product.id === id);
}

// Carousel setup and functions
function setupCarousel() {
  // Check if carouselTrackEl exists and we have carousel items
  if (!carouselTrackEl) {
    console.warn("Carousel track element not found");
    return;
  }
  
  if (!carouselItems || carouselItems.length === 0) {
    console.warn("No carousel items to display");
    carouselTrackEl.innerHTML = `
      <div class="carousel-slide">
        <div class="carousel-content" style="color: #333; text-shadow: none; position: static; transform: none; margin: auto; text-align: center;">
          <h2>Welcome to JungliBear</h2>
          <p>Quality products for your home</p>
        </div>
      </div>
    `;
    return;
  }
  
  
  // Clear existing slides
  carouselTrackEl.innerHTML = '';
  
  // Create carousel slides
  carouselItems.forEach(item => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="eager">
      <div class="carousel-content">
        <h2>${item.title}</h2>
        <p>${item.subtitle}</p>
        <button class="button" data-product-id="${item.productId}">View Product</button>
      </div>
    `;
    carouselTrackEl.appendChild(slide);
  });
  
  // Set initial slide position
  currentSlide = 0; // Reset to first slide
  updateCarouselPosition();
  
  // Set up carousel buttons
  if (prevButtonEl) {
    prevButtonEl.removeEventListener("click", previousSlide);
    prevButtonEl.addEventListener("click", previousSlide);
  }
  
  if (nextButtonEl) {
    nextButtonEl.removeEventListener("click", nextSlide);
    nextButtonEl.addEventListener("click", nextSlide);
  }
  
  // Add click event for buttons in carousel
  const carouselButtons = carouselTrackEl.querySelectorAll('button[data-product-id]');
  carouselButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(button.getAttribute('data-product-id'));
      const product = findProductById(productId);
      if (product) {
        openProductModal(product);
      }
    });
  });
  
  // Start carousel auto-rotation
  startCarouselAutoRotation();
}

function startCarouselAutoRotation() {
  setInterval(nextSlide, 5000);
}

function previousSlide() {
  // Get the number of slides by checking how many carousel slides are in the DOM
  const numSlides = document.querySelectorAll('.carousel-slide').length;
  currentSlide = (currentSlide === 0) ? numSlides - 1 : currentSlide - 1;
  updateCarouselPosition();
}

function nextSlide() {
  // Get the number of slides by checking how many carousel slides are in the DOM
  const numSlides = document.querySelectorAll('.carousel-slide').length;
  currentSlide = (currentSlide === numSlides - 1) ? 0 : currentSlide + 1;
  updateCarouselPosition();
}

function updateCarouselPosition() {
  if (carouselTrackEl) {
    carouselTrackEl.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

// Filter functions
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Add filter buttons for horizontal scrolling categories
  const filterButtonsContainer = document.querySelector('.filter-buttons');
  
  if (filterButtonsContainer) {
    // Clear existing category buttons except the first two
    const existingButtons = filterButtonsContainer.querySelectorAll('.filter-btn');
    existingButtons.forEach((btn, index) => {
      if (index > 1) { // Skip the Filter and All buttons
        btn.remove();
      }
    });
    
    // Add category buttons after the first two buttons (Filter and All)
    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-btn';
      button.dataset.category = category;
      button.textContent = capitalizeFirstLetter(category);
      filterButtonsContainer.appendChild(button);
      
      // Add click event
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        // Add active class to clicked button
        button.classList.add('active');
        selectedCategory = category;
        filterAndRenderProducts();
      });
    });
    
    // Add event listener to filter buttons
    const allButton = document.querySelector('.filter-btn[data-category="all"]');
    if (allButton) {
      allButton.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        allButton.classList.add('active');
        selectedCategory = 'all';
        filterAndRenderProducts();
      });
    }
    
    // Set up filter modal
    setupFilterModal(categories);
  }
}

// Setup filter modal
function setupFilterModal(categories) {
  // Get modal elements
  if (filterModalEl) {
    const filterOptionsEl = document.getElementById('filterOptions');
        
    // Insert price filter at the top of filter options
    if (filterOptionsEl) {
      // Remove old price filter if it exists
      // Setup price slider events
      const minPriceRange = document.getElementById('minPriceRange');
      const maxPriceRange = document.getElementById('maxPriceRange');
      const minPriceValue = document.getElementById('minPriceValue');
      const maxPriceValue = document.getElementById('maxPriceValue');
      
      if (minPriceRange && maxPriceRange) {
        // Setup min price slider
        minPriceRange.addEventListener('input', () => {
          const minVal = parseInt(minPriceRange.value);
          const maxVal = parseInt(maxPriceRange.value);
          
          // Prevent min from exceeding max
          if (minVal > maxVal) {
            minPriceRange.value = maxVal;
          }
          
          // Update display value
          if (minPriceValue) {
            minPriceValue.textContent = minPriceRange.value;
          }
        });
        
        // Setup max price slider
        maxPriceRange.addEventListener('input', () => {
          const minVal = parseInt(minPriceRange.value);
          const maxVal = parseInt(maxPriceRange.value);
          
          // Prevent max from being less than min
          if (maxVal < minVal) {
            maxPriceRange.value = minVal;
          }
          
          // Update display value
          if (maxPriceValue) {
            maxPriceValue.textContent = maxPriceRange.value;
          }
        });
      }
    }
    
    // Add category checkboxes if element exists
    if (filterOptionsEl) {
      // Create categories section
      const categoriesSection = document.createElement('div');
      categoriesSection.className = 'filter-section';
      
      // Add category options
      categories.forEach(category => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.innerHTML = `
          <input type="checkbox" id="filter-${category}" value="${category}">
          <label for="filter-${category}">${capitalizeFirstLetter(category)}</label>
        `;
        categoriesSection.appendChild(option);
      });
      
      // Add categories section to filter options
      filterOptionsEl.appendChild(categoriesSection);
    }
    
    // Set up filter modal buttons
    if (filterBtnEl) {
      filterBtnEl.addEventListener('click', () => {
        filterModalEl.classList.add('show');
      });
    }
    
    if (closeFilterButtonEl) {
      closeFilterButtonEl.addEventListener('click', () => {
        filterModalEl.classList.remove('show');
      });
    }
    
    // Apply filters button
    if (applyFilterBtnEl) {
      applyFilterBtnEl.addEventListener('click', () => {
        // Get selected categories if element exists
        if (filterOptionsEl) {
          selectedCategories = Array.from(
            document.querySelectorAll('#filterOptions input[type="checkbox"]:checked')
          ).map(checkbox => checkbox.value);
        }
        
        filterModalEl.classList.remove('show');
        filterAndRenderProducts();
      });
    }
    
    // Reset filter button
    if (resetFilterBtnEl) {
      resetFilterBtnEl.addEventListener('click', () => {
        // Reset price slider if element exists
        if (modalPriceRangeEl && modalPriceRangeValueEl) {
          modalPriceRangeEl.value = 1000;
          priceFilter = 1000;
          modalPriceRangeValueEl.textContent = `₹1000`;
        }
        
        // Clear all checkboxes if elements exist
        if (filterOptionsEl) {
          const checkboxes = filterModalEl.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            checkbox.checked = false;
          });
        }
        
        selectedCategories = [];
      });
    }
  }
}

// Product rendering functions
function filterAndRenderProducts() {
  // Get values from price range inputs and sliders
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const minPriceSlider = document.getElementById('minPriceSlider');
  const maxPriceSlider = document.getElementById('maxPriceSlider');
  
  // Set default min/max price values
  let minPrice = 0;
  let maxPrice = priceFilter || 10000;
  
  // Get values from inputs or sliders
  if (minPriceInput && maxPriceInput) {
    minPrice = parseInt(minPriceInput.value) || 0;
    maxPrice = parseInt(maxPriceInput.value) || 10000;
  } else if (minPriceSlider && maxPriceSlider) {
    minPrice = parseInt(minPriceSlider.value) || 0;
    maxPrice = parseInt(maxPriceSlider.value) || 10000;
  }

  // Apply filters
  const filtered = products.filter(product => {
    // Hide out-of-stock products
    if (product.inStock === false) {
      return false;
    }

    // Handle dual price filter
    const productPrice = product.price || 0;
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

    // Handle category filter
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      matchesCategory = product.category === selectedCategory;
    }

    // Handle selected categories from modal
    let matchesSelectedCategories = true;
    if (selectedCategories.length > 0) {
      matchesSelectedCategories = selectedCategories.includes(product.category);
    }

    return matchesPrice && matchesCategory && matchesSelectedCategories;
  });

  // Clear product grid
  if (productGridEl) {
    productGridEl.innerHTML = '';

    // Render products
    if (filtered.length === 0) {
      productGridEl.innerHTML = `
        <div class="no-products-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>No products found matching your criteria.</p>
        </div>
      `;
      return;
    }

    // Make grid responsive based on screen size
    updateGridLayout();

    // Reverse the order to show newest/latest first
    const reversedFiltered = filtered.reverse();

    // Show only a certain number of products
    const productsToShow = reversedFiltered.slice(0, visibleProductCount);

    // Render products
    productsToShow.forEach(product => {
      const productCard = renderProductCard(product);
      productGridEl.appendChild(productCard);
    });
    // Show or hide load more button (only for normal filtering, not search)
    if (loadMoreBtnEl) {
      const searchInput = document.getElementById('searchInput');
      const isSearching = searchInput && searchInput.value.trim().length >= 3;
      
      if (!isSearching && filtered.length > visibleProductCount) {
        loadMoreBtnEl.style.display = 'block';
      } else {
        loadMoreBtnEl.style.display = 'none';
      }
    }
  }
}

function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product-id', product.id);

  // Prepare product image
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg';

  // CHECK CART STATE WHEN CREATING CARD
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = cartItem && cartItem.quantity > 0;
  const quantity = cartItem ? cartItem.quantity : 1;

  // Set initial button state based on cart
  const addButtonStyle = isInCart ? 'style="display: none;"' : '';
  const qtyControlsStyle = isInCart ? 'style="display: flex;"' : 'style="display: none;"';
  const qtyCount = isInCart ? quantity : 1;

  card.innerHTML = `
    <div class="product-image">
      <img src="${imageUrl}" alt="${product.title}">
      <button class="share-button" data-product-id="${product.id}" aria-label="Share product">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
    </div>
    <div class="product-card-content">
      <h3 class="product-title">${product.title}</h3>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      <div class="product-card-actions">
        <button class="button view-product-button" data-product-id="${product.id}">View Product</button>
        <div class="cart-controls">
          <button class="button button-outline add-to-cart-button" data-product-id="${product.id}" ${addButtonStyle}>Add to Cart</button>
          <div class="quantity-controls" ${qtyControlsStyle}>
            <button class="qty-btn qty-decrease">-</button>
            <span class="qty-count">${qtyCount}</span>
            <button class="qty-btn qty-increase">+</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  card.querySelector('.view-product-button').addEventListener('click', () => {
    openProductModal(product);
  });

  card.querySelector('.add-to-cart-button').addEventListener('click', () => {
    addToCart(product, 1);
    showAddedToCartNotification(product.title);
    toggleCartControls(card, true, 1);
  });

  // Quantity decrease button
  card.querySelector('.qty-decrease').addEventListener('click', (e) => {
    e.stopPropagation();
    const currentQty = parseInt(card.querySelector('.qty-count').textContent);
    if (currentQty > 1) {
      updateCartQuantity(product.id, currentQty - 1);
      card.querySelector('.qty-count').textContent = currentQty - 1;
    } else {
      removeFromCart(product.id);
      toggleCartControls(card, false);
    }
  });

  // Quantity increase button
  card.querySelector('.qty-increase').addEventListener('click', (e) => {
    e.stopPropagation();
    const currentQty = parseInt(card.querySelector('.qty-count').textContent);
    updateCartQuantity(product.id, currentQty + 1);
    card.querySelector('.qty-count').textContent = currentQty + 1;
  });

  card.querySelector('.share-button').addEventListener('click', (e) => {
    e.stopPropagation();
    shareProduct(product);
  });

  // Make the entire card clickable to open product modal
  card.addEventListener('click', (e) => {
    // Only open modal if not clicking a button
    if (!e.target.closest('button')) {
      openProductModal(product);
    }
  });

  return card;
}

// Open product modal
function toggleCartControls(productCard, isInCart, quantity = 1) {
  const addButton = productCard.querySelector('.add-to-cart-button');
  const qtyControls = productCard.querySelector('.quantity-controls');
  const qtyCount = productCard.querySelector('.qty-count');
  
  if (isInCart && addButton && qtyControls && qtyCount) {
    addButton.style.display = 'none';
    qtyControls.style.display = 'flex';
    qtyCount.textContent = quantity;
  } else if (!isInCart && addButton && qtyControls) {
    addButton.style.display = 'block';
    qtyControls.style.display = 'none';
  }
}

function getCartItemQuantity(productId) {
  const cartItem = cartItems.find(item => item.id === productId);
  return cartItem ? cartItem.quantity : 0;
}

function openProductModal(product) {
  selectedProduct = product;
  
  // Update product details in modal
  if (productModalTitleEl) productModalTitleEl.textContent = product.title;
  if (productModalPriceEl) productModalPriceEl.textContent = `₹${product.price.toFixed(2)}`;
  if (productModalDescriptionEl) productModalDescriptionEl.textContent = product.description || 'No description available.';
  if (productModalCategoryEl) productModalCategoryEl.textContent = capitalizeFirstLetter(product.category || 'Uncategorized');
  
  // Update availability
  if (productModalAvailabilityEl) {
    const availabilityText = product.inStock ? 'In Stock' : 'Out of Stock';
    const availabilityClass = product.inStock ? 'in-stock' : 'out-of-stock';
    productModalAvailabilityEl.textContent = availabilityText;
    productModalAvailabilityEl.className = `product-availability ${availabilityClass}`;
  }
  
  // Reset quantity
  if (productQuantityEl) productQuantityEl.value = 1;
  
  // Set product images
  productImages = product.images || [];
  currentImageIndex = 0;
  
  // Create thumbnails
  const thumbnailsContainer = document.getElementById('productThumbnails');
  if (thumbnailsContainer) {
    thumbnailsContainer.innerHTML = '';
    
    productImages.forEach((imgUrl, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = `product-thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.innerHTML = `<img src="${imgUrl}" alt="${product.title} - Image ${index + 1}">`;
      thumbnail.addEventListener('click', () => {
        currentImageIndex = index;
        updateModalImage();
        updateActiveThumbnail();
      });
      thumbnailsContainer.appendChild(thumbnail);
    });
  }
  
  // Update main product image
  updateModalImage();
  
  // Update URL with product ID
  updateURLWithProductId(product.id);
  
  // Show modal
  if (productModalEl) {
    productModalEl.classList.add('show');
    
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
  }
}

// Close product modal
function closeProductModal() {
  if (productModalEl) {
    productModalEl.classList.remove('show');
    document.body.style.overflow = '';
    
    // Update URL to remove product ID
    updateURLWithoutProductId();
  }
}

// Navigate to previous image
function navigateToPreviousImage(e) {
  e.stopPropagation();
  if (productImages.length <= 1) return;
  
  currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
  updateModalImage();
  updateActiveThumbnail();
}

// Navigate to next image
function navigateToNextImage(e) {
  e.stopPropagation();
  if (productImages.length <= 1) return;
  
  currentImageIndex = (currentImageIndex + 1) % productImages.length;
  updateModalImage();
  updateActiveThumbnail();
}

// Update modal image
function updateModalImage() {
  if (productModalImageEl) {
    if (productImages.length === 0) {
      productModalImageEl.src = 'placeholder.jpg';
      return;
    }
    
    productModalImageEl.src = productImages[currentImageIndex];
    productModalImageEl.alt = `${selectedProduct.title} - Image ${currentImageIndex + 1}`;
  }
}

// Update active thumbnail
function updateActiveThumbnail() {
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  thumbnails.forEach((thumb, index) => {
    if (index === currentImageIndex) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

// Add to cart
function addToCart(product, quantity) {
  // Find if product already exists in cart
  const existingItem = cartItems.find(item => item.id === product.id);
  
  if (existingItem) {
    // Update quantity if product already in cart
    existingItem.quantity += quantity;
  } else {
    // Add new item to cart
    cartItems.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg',
      quantity: quantity
    });
  }
  
  // Update cart UI and save to storage
  updateCartQuantity(product.id, quantity);
  saveCartToStorage();
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
  // Find and update the cart item
  const cartItem = cartItems.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity = quantity;
  }
  
  // Save to storage
  saveCartToStorage();
  
  // Update cart count in UI
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Remove from cart
function removeFromCart(productId) {
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
}

// Clear cart
function clearCart() {
  cartItems = [];
  saveCartToStorage();
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  // Update cart count
  updateCartQuantity();
  
  // Update cart items display if cart modal is open
  if (cartModalEl && cartModalEl.classList.contains('show')) {
    renderCartItems();
    updateCartTotals();
  }
}

// Render cart items
function renderCartItems() {
  if (!cartItemsEl) return;
  
  if (cartItems.length === 0) {
    cartItemsEl.innerHTML = '';
    if (emptyCartMessageEl) emptyCartMessageEl.style.display = 'block';
    if (checkoutFormEl) checkoutFormEl.style.display = 'none';
    return;
  }
  
  if (emptyCartMessageEl) emptyCartMessageEl.style.display = 'none';
  if (checkoutFormEl) checkoutFormEl.style.display = 'block';
  
  cartItemsEl.innerHTML = '';
  
  cartItems.forEach(item => {
    const cartItemEl = document.createElement('div');
    cartItemEl.className = 'cart-item';
    cartItemEl.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
        <div class="cart-item-quantity">
          <button class="quantity-button decrease" data-id="${item.id}">-</button>
          <span class="qty-count">${item.quantity}</span>
          <button class="quantity-button increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="remove-item-button" data-id="${item.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    cartItemsEl.appendChild(cartItemEl);
  });
  
  // Add event listeners
  const decreaseButtons = cartItemsEl.querySelectorAll('.quantity-button.decrease');
decreaseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const id = parseInt(button.dataset.id);
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      item.quantity--;
      saveCartToStorage();
      renderCartItems();
      updateCartTotals();
      updateProductCardStates();
    } else if (item && item.quantity === 1) {
      // Remove item when quantity would go to 0
      removeFromCart(id);
      renderCartItems();
      updateCartTotals();
      
    }
  });
});
  
  const increaseButtons = cartItemsEl.querySelectorAll('.quantity-button.increase');
  increaseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.dataset.id);
      const item = cartItems.find(item => item.id === id);
      if (item && item.quantity < 10) {
        item.quantity++;
        saveCartToStorage();
        renderCartItems();
        updateCartTotals();
        updateProductCardStates();
      }
    });
  });
  
  const removeButtons = cartItemsEl.querySelectorAll('.remove-item-button');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = parseInt(button.dataset.id);
      removeFromCart(id);
      updateProductCardStates();
    });
  });
  
  updateCartTotals();
}

// Update cart totals
function updateCartTotals(isOthers = false) {
  if (!subtotalEl || !deliveryTotalEl || !orderTotalEl) return;
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  
  // Handle delivery fee
  let deliveryFee = 0;
  
  // Check if any delivery option is selected
  const deliveryOption = Array.from(deliveryOptionEls || []).find(opt => opt.checked);
  
  if (deliveryOption && deliveryOption.value === 'home-delivery') {
  if (societyEl && societyEl.value) {
    switch(societyEl.value) {
      case 'rajnagar-extn':
        deliveryFee = 0; // FREE
        break;
      case 'ghaziabad':
      case 'noida':
      case 'greater-noida':
      case 'delhi':
        deliveryFee = 50;
        break;
      case 'others':
        deliveryFee = 100;
        break;
      default:
        deliveryFee = 50;
    }
  }
} else {
    // Hide home delivery details
    if (homeDeliveryDetailsEl) {
      homeDeliveryDetailsEl.classList.add('hidden');
    }
  }
  
  // Update delivery fee display
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`;
  }
  
  deliveryTotalEl.textContent = deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`;
  
  // Update total
  const total = subtotal + deliveryFee;
  orderTotalEl.textContent = `₹${total.toFixed(2)}`;
}

// Save cart to storage
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Load cart from storage
function loadCartFromStorage() {
  const savedCart = localStorage.getItem('cart');
  
  if (savedCart) {
    try {
      cartItems = JSON.parse(savedCart);
      return cartItems; // Add this return statement
    } catch (error) {
      console.error('Error parsing saved cart:', error);
      cartItems = [];
      return []; // Return empty array on error
    }
  } else {
    cartItems = []; // Initialize if no saved cart
    return []; // Return empty array if no saved cart
  }
}
// Handle delivery option change
function handleDeliveryOptionChange() {
  const selectedOption = Array.from(deliveryOptionEls || []).find(opt => opt.checked);
  
  if (selectedOption && selectedOption.value === 'home-delivery') {
    if (homeDeliveryDetailsEl) {
      homeDeliveryDetailsEl.classList.remove('hidden');
    }
  } else {
    if (homeDeliveryDetailsEl) {
      homeDeliveryDetailsEl.classList.add('hidden');
    }
  }
  
  updateCartTotals();
}

// Handle society change
function handleSocietyChange() {
  updateCartTotals();
}

// Validate checkout form
function validateCheckoutForm() {
  let isValid = true;
  

  // Validate name if field exists
  if (nameEl) {
    if (!nameEl.value.trim()) {
      if (nameErrorEl) nameErrorEl.textContent = 'Please enter your name';
      isValid = false;
    } else {
      if (nameErrorEl) nameErrorEl.textContent = '';
    }
  }
  
  // Validate phone if field exists
  if (phoneEl) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneEl.value.trim()) {
      if (phoneErrorEl) phoneErrorEl.textContent = 'Please enter your phone number';
      isValid = false;
    } else if (!phoneRegex.test(phoneEl.value.trim())) {
      if (phoneErrorEl) phoneErrorEl.textContent = 'Please enter a valid 10-digit phone number';
      isValid = false;
    } else {
      if (phoneErrorEl) phoneErrorEl.textContent = '';
    }
  }
  
  // Check if any delivery option is selected
  const deliveryOption = Array.from(deliveryOptionEls || []).find(opt => opt.checked);
  
  if (!deliveryOption) {
    if (deliveryOptionErrorEl) deliveryOptionErrorEl.textContent = 'Please select a delivery option';
    isValid = false;
  } else {
    if (deliveryOptionErrorEl) deliveryOptionErrorEl.textContent = '';
    
    // If home delivery selected, validate address and society
    if (deliveryOption.value === 'home-delivery') {
      if (addressEl && !addressEl.value.trim()) {
        if (addressErrorEl) addressErrorEl.textContent = 'Please enter your delivery address';
        isValid = false;
      } else {
        if (addressErrorEl) addressErrorEl.textContent = '';
      }
      
      if (societyEl && !societyEl.value) {
        if (societyErrorEl) societyErrorEl.textContent = 'Please select your society/locality';
        isValid = false;
      } else {
        if (societyErrorEl) societyErrorEl.textContent = '';
      }
    }
  }
  
  return isValid;
}

// Process checkout
async function processCheckout() {
  if (!validateCheckoutForm()) {
    return;
  }
  
  // Show full-screen loading overlay
  document.body.insertAdjacentHTML('beforeend', 
    '<div class="loading-overlay"><i class="fas fa-spinner fa-spin loading-spinner-large"></i></div>'
  );
  
  try {
    nextOrderID = Date.now();
    
    // Create order object
    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const deliveryOption = Array.from(deliveryOptionEls || []).find(opt => opt.checked)?.value || '';
    const society = societyEl ? societyEl.value : '';

    // Calculate subtotal and total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let deliveryFee = 0;
    
    if (deliveryOption === 'home-delivery' && society) {
      switch(society) {
        case 'rajnagar-extn':
          deliveryFee = 0; // FREE
          break;
        case 'ghaziabad':
        case 'noida':
        case 'greater-noida':
        case 'delhi':
          deliveryFee = 50;
          break;
        case 'others':
          deliveryFee = 100;
          break;
        default:
          deliveryFee = 50;
      }
    }
    
    const total = subtotal + deliveryFee;
    
    // Create user data
    const userData = {
      name,
      phoneNumber: phone,
      address,
      OrderID: nextOrderID,
      society: deliveryOption === 'home-delivery' ? society : '',
      lastOrderDate: new Date().toISOString()
    };

    // Create order data
    const orderData = {
      orderId: nextOrderID, 
      customerDetails: {
        name: name || "",
        phoneNumber: phone || "",
        address: address || "",
        deliveryOption: deliveryOption || "pickup",
        society: deliveryOption === 'home-delivery' ? (society || "") : ""
      },
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity)
      })),
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    // Save user data to API
    const userResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    }).catch(error => {
      console.warn('Could not save user data, but continuing with order:', error);
    });

    // Submit order to API
    const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    if (!orderResponse.ok) {
      throw new Error('Failed to place order');
    }
    
    const result = await orderResponse.json();
    
    // Clear cart and update product cards
    clearCart();
    updateProductCardStates();
    
    // Remove loading overlay
    document.querySelector('.loading-overlay')?.remove();
    
    // Show confirmation
    openConfirmationModal(orderData, result.orderNumber);
    
  } catch (error) {
    console.error('Error processing checkout:', error);
    
    // Remove loading overlay
    document.querySelector('.loading-overlay')?.remove();
    
    alert('There was an error processing your order. Please try again.');
  }
}
// Open confirmation modal
function openConfirmationModal(orderData,orderId  ) {
  // Close cart modal
  if (cartModalEl) {
    cartModalEl.classList.remove('show');
  }
  
  // Format order details
  if (confirmationDetailsEl) {
    confirmationDetailsEl.innerHTML = `
      <h4>Order Details</h4>
      <p><strong>Order Number:</strong> ${orderId || 'N/A'}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Name:</strong> ${orderData.customerDetails.name}</p>
      <p><strong>Phone:</strong> ${orderData.customerDetails.phoneNumber}</p>
      <p><strong>Delivery Method:</strong> ${orderData.customerDetails.deliveryOption === 'store-pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
      
      ${orderData.customerDetails.deliveryOption === 'home-delivery' ? 
        `<p><strong>Address:</strong> ${orderData.customerDetails.address}</p>
         <p><strong>Locality:</strong> ${getSocietyName(orderData.customerDetails.society)}</p>` : 
        '<p><strong>Pickup Location:</strong> label i002 ajnara integrity</p>'}
      
      <h4>Order Summary</h4>
      <ul class="order-summary-list">
        ${orderData.items.map(item => `
          <li>
            <span>${item.title} x ${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        `).join('')}
        <li>
          <span>Subtotal</span>
          <span>₹${orderData.subtotal.toFixed(2)}</span>
        </li>
        <li>
          <span>Delivery</span>
          <span>${orderData.deliveryFee === 0 ? 'Free' : `₹${orderData.deliveryFee.toFixed(2)}`}</span>
        </li>
        <li style="font-weight: 700;">
          <span>Total</span>
          <span>₹${orderData.total.toFixed(2)}</span>
        </li>
      </ul>
    `;
  }
  
  // Show confirmation modal
  if (confirmationModalEl) {
    confirmationModalEl.classList.add('show');
  }
}

// Close confirmation modal
function closeConfirmationModal() {
  if (confirmationModalEl) {
    confirmationModalEl.classList.remove('show');
  
  }
  
  // Enable scrolling
  document.body.style.overflow = '';
}

// Get society name
function getSocietyName(value) {
  switch(value) {
    case 'rajnagar-extn': return 'Rajnagar Extension';
    case 'ghaziabad': return 'Ghaziabad';
    case 'noida': return 'Noida';
    case 'greater-noida': return 'Greater Noida';
    case 'delhi': return 'Delhi';
    case 'others': return 'Others';
    default: return value;
  }
}
// Update URL with product ID
function updateURLWithProductId(productId) {
  const url = new URL(window.location);
  url.searchParams.set('product', productId);
  window.history.pushState({}, '', url);
}

// Update URL without product ID
function updateURLWithoutProductId() {
  const url = new URL(window.location);
  url.searchParams.delete('product');
  window.history.pushState({}, '', url);
}

// Share product
async function shareProduct(product) {

  
  const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  
  if (product.images && product.images.length > 0) {
    try {
      const response = await fetch(product.images[0]);
      const blob = await response.blob();
      const file = new File([blob], `${product.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${product.title} - JungliBear`,
            text: `🛍️ ${product.title}\n\n${product.description}\n\n💰 Price: ₹${product.price}`,
            url: url,
            files: [file]
          });
          showShareNotification('Product shared successfully!');
          return;
        } catch (err) {
          console.error('File sharing failed:', err);
        }
      }
    } catch (error) {
      console.log('Failed to fetch image:', error);
    }
  }
  
  // Text-only sharing
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${product.title} - JungliBear`,
        text: `🛍️ ${product.title}\n\n${product.description}\n\n💰 Price: ₹${product.price}`,
        url: url
      });
      showShareNotification('Product shared successfully!');
    } catch (error) {
      console.error('Text sharing failed:', error);
      showShareNotification('Sharing cancelled or failed');
    }
  } else {

    showShareNotification('Sharing not available on this device');
  }
}

// Copy to clipboard
function copyToClipboard(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

// Show share notification
function showShareNotification(message) {
  // Use the existing notification element
  const notification = document.getElementById('shareNotification');
  const text = document.getElementById('shareNotificationText');
  
  if (!notification || !text) {
    console.error("Share notification elements not found");
    return;
  }
  
  // Set the text
  text.textContent = message;
  
  // Show the notification
  notification.style.display = "block";
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}
// Show "Added to cart" notification
function showAddedToCartNotification(productTitle) {
  // Use the existing notification element
  const notification = document.getElementById('simpleNotification');
  const text = document.getElementById('notificationText');
  
  if (!notification || !text) {
    console.error("Notification elements not found");
    return;
  }
  
  // Set the text
  text.textContent = productTitle + " added to cart!";
  
  // Show the notification
  notification.style.display = "block";
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}
// Helper function: Capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Set up event listeners
function setupEventListeners() {
  function initPriceRange() {
  const minInput = document.getElementById('minPriceInput');
  const maxInput = document.getElementById('maxPriceInput');
  const minSlider = document.getElementById('minPriceSlider');
  const maxSlider = document.getElementById('maxPriceSlider');
  const priceMin = document.querySelector('.price-min');
  const priceMax = document.querySelector('.price-max');
  const sliderRange = document.querySelector('.slider-range');

  function updateSliderRange() {
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    const percent1 = (min / minSlider.max) * 100;
    const percent2 = (max / maxSlider.max) * 100;
    
    sliderRange.style.left = percent1 + '%';
    sliderRange.style.width = (percent2 - percent1) + '%';
  }

  function updatePriceDisplay() {
    priceMin.textContent = '₹' + minSlider.value;
    priceMax.textContent = '₹' + maxSlider.value;
  }

  // Sync input fields with sliders
  minInput.addEventListener('input', () => {
    minSlider.value = minInput.value;
    updateSliderRange();
    updatePriceDisplay();
  });

  maxInput.addEventListener('input', () => {
    maxSlider.value = maxInput.value;
    updateSliderRange();
    updatePriceDisplay();
  });

  // Sync sliders with input fields
  minSlider.addEventListener('input', () => {
    minInput.value = minSlider.value;
    updateSliderRange();
    updatePriceDisplay();
  });

  maxSlider.addEventListener('input', () => {
    maxInput.value = maxSlider.value;
    updateSliderRange();
    updatePriceDisplay();
  });

  // Initialize
  updateSliderRange();
  updatePriceDisplay();
}
initPriceRange();
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  // Search functionality
  if (searchButton && searchInput) {
    // Search button click
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      searchInput.blur(); // Close keyboard
      
      if (query.length >= 3) {
        performSearch(query);
      } else if (query.length === 0) {
        filterAndRenderProducts();
      }
    });
    
    // Enter key press
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        searchInput.blur(); // Close keyboard
        
        if (query.length >= 3) {
          performSearch(query);
        }
      }
    });
    
    // Search as you type with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    if (query.length >= 3) {
      performSearch(query);
    }
    // Remove the else if clause that resets to all products
    // Don't automatically render all products when search is empty
  }, 300);
});
// Only reset to all products when user explicitly clears search
  searchInput.addEventListener('change', () => {
    const query = searchInput.value.trim();
    if (query.length === 0) {
      // Only reset if user manually cleared the field
      filterAndRenderProducts();
    }
  });
  }
    
  // Load more button
  if (loadMoreBtnEl) {
    loadMoreBtnEl.addEventListener('click', () => {
      visibleProductCount += 8;
      filterAndRenderProducts();
    });
  }

  // Filter modal events
  if (filterBtnEl) {
    filterBtnEl.addEventListener('click', () => {
      if (filterModalEl) {
        filterModalEl.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (closeFilterButtonEl) {
    closeFilterButtonEl.addEventListener('click', () => {
      if (filterModalEl) {
        filterModalEl.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  if (resetFilterBtnEl) {
    resetFilterBtnEl.addEventListener('click', () => {
      selectedCategories = [];
      const checkboxes = document.querySelectorAll('#filterOptions input[type="checkbox"]');
      checkboxes.forEach(checkbox => checkbox.checked = false);
      
      const minPriceRange = document.getElementById('minPriceRange');
      const maxPriceRange = document.getElementById('maxPriceRange');
      if (minPriceRange) minPriceRange.value = 0;
      if (maxPriceRange) maxPriceRange.value = priceFilter;
      
      const minPriceValue = document.getElementById('minPriceValue');
      const maxPriceValue = document.getElementById('maxPriceValue');
      if (minPriceValue) minPriceValue.textContent = '0';
      if (maxPriceValue) maxPriceValue.textContent = priceFilter;
    });
  }

  if (applyFilterBtnEl) {
    applyFilterBtnEl.addEventListener('click', () => {
      filterAndRenderProducts();
      if (filterModalEl) {
        filterModalEl.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // Cart icon click
  if (cartIconEl) {
    cartIconEl.addEventListener('click', () => {
      if (cartModalEl) {
        cartModalEl.classList.add('show');
        renderCartItems();
        document.body.style.overflow = 'hidden';
      }
    });
  }
  
  // Close cart modal
  if (closeCartButtonEl) {
    closeCartButtonEl.addEventListener('click', () => {
      
      if (cartModalEl) {
        cartModalEl.classList.remove('show');
        document.body.style.overflow = '';
      }
      
    });
  }
  
  // Close product modal
  if (closeProductButtonEl) {
    closeProductButtonEl.addEventListener('click', closeProductModal);
  }
  
  // Product quantity controls
  if (decreaseQuantityEl && productQuantityEl) {
    decreaseQuantityEl.addEventListener('click', () => {
      let value = parseInt(productQuantityEl.value);
      if (value > 1) {
        productQuantityEl.value = value - 1;
      }
    });
  }
  
  if (increaseQuantityEl && productQuantityEl) {
    increaseQuantityEl.addEventListener('click', () => {
      let value = parseInt(productQuantityEl.value);
      if (value < 10) {
        productQuantityEl.value = value + 1;
      }
    });
  }
  
  // Add to cart button in product modal
  if (addToCartButtonEl) {
    addToCartButtonEl.addEventListener('click', () => {
      if (selectedProduct && productQuantityEl) {
        const quantity = parseInt(productQuantityEl.value);
        addToCart(selectedProduct, quantity);
        showAddedToCartNotification(selectedProduct.title);
        
        if (productModalEl) {
          setTimeout(() => {
            productModalEl.classList.remove('show');
            document.body.style.overflow = '';
          }, 1000);
        }
      }
    });
  }
  
  // Share product button
  if (shareProductButtonEl) {
    shareProductButtonEl.addEventListener('click', () => {
      if (selectedProduct) {
        shareProduct(selectedProduct);
      }
    });
  }
  
  // Image navigation in product modal
  const prevImageButton = document.getElementById('prevImageButton');
  const nextImageButton = document.getElementById('nextImageButton');
  
  if (prevImageButton) {
    prevImageButton.addEventListener('click', navigateToPreviousImage);
  }
  
  if (nextImageButton) {
    nextImageButton.addEventListener('click', navigateToNextImage);
  }
  
  // Delivery option change
  if (deliveryOptionEls && deliveryOptionEls.length > 0) {
    Array.from(deliveryOptionEls).forEach(radio => {
      radio.addEventListener('change', handleDeliveryOptionChange);
    });
  }
  
  // Society change
  if (societyEl) {
    societyEl.addEventListener('change', handleSocietyChange);
  }
  
  // Checkout button
  if (checkoutButtonEl) {
    checkoutButtonEl.addEventListener('click', processCheckout);
  }
  
  // Close confirmation modal
  if (closeConfirmationButtonEl) {
    closeConfirmationButtonEl.addEventListener('click', closeConfirmationModal);
  }
  
  // Continue shopping
  if (continueShoppingEl) {
    continueShoppingEl.addEventListener('click', closeConfirmationModal);
  }
  
  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === cartModalEl) {
      cartModalEl.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (e.target === productModalEl) {
      closeProductModal();
    }
    if (e.target === filterModalEl) {
      filterModalEl.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (e.target === confirmationModalEl) {
      closeConfirmationModal();
    }
  });
}
// Add window resize event to update the grid layout
window.addEventListener('resize', () => {
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    updateGridLayout();
  }, 250);
});

function updateGridLayout() {
  if (!productGridEl) return;
  
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1200) {
    productGridEl.style.gridTemplateColumns = 'repeat(5, 1fr)';
  } else if (screenWidth >= 992) {
    productGridEl.style.gridTemplateColumns = 'repeat(4, 1fr)';
  } else if (screenWidth >= 768) {
    productGridEl.style.gridTemplateColumns = 'repeat(3, 1fr)';
  } else if (screenWidth >= 576) {
    productGridEl.style.gridTemplateColumns = 'repeat(2, 1fr)';
  } else {
    productGridEl.style.gridTemplateColumns = 'repeat(1, 1fr)';
  }
}
// Start fetching products when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts().catch(err => console.error("Fetch error:", err));
});

// Add this function to your scripthome.js file
function performSearch(query) {
  if (!query || query.trim() === '') {
    return;
  }

  query = query.toLowerCase().trim();

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.title?.toLowerCase().includes(query) || 
    product.description?.toLowerCase().includes(query) ||
    product.category?.toLowerCase().includes(query)
  );

  // Display search results
  if (productGridEl) {
    if (filteredProducts.length === 0) {
      productGridEl.innerHTML = `
        <div class="no-results" style="text-align: center; padding: 2rem; width: 100%;">
          <p>No products found for "${query}"</p>
          <button class="button" onclick="filterAndRenderProducts()">Show All Products</button>
        </div>
      `;
    } else {
      // Clear current products
      productGridEl.innerHTML = '';

      // Update grid layout
      updateGridLayout();

      // Render ALL filtered products (no limit)
      filteredProducts.forEach(product => {
        const productCard = renderProductCard(product);
        productGridEl.appendChild(productCard);
      });
    }

    // Hide load more button during search
    if (loadMoreBtnEl) {
      loadMoreBtnEl.style.display = 'none';
    }
  }
}
function updateProductCardsFromCart() {
  const cartItems = loadCartFromStorage();
  
  // Add safety check - if cartItems is undefined or not an array, use empty array
  if (!cartItems || !Array.isArray(cartItems)) {
    return;
  }
  
  cartItems.forEach(cartItem => {
    const productCard = document.querySelector(`[data-product-id="${cartItem.id}"]`);
    if (productCard) {
      const cardContainer = productCard.closest('.product-card');
      if (cardContainer) {
        toggleCartControls(cardContainer, true, cartItem.quantity);
      }
    }
  });
}
function updateProductCardStates() {
  console.log('Updating product cards, cart has', cartItems.length, 'items');
  
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.getAttribute('data-product-id');
    if (!productId) return;
    
    const cartItem = cartItems.find(item => item.id == productId); // Use == for type flexibility
    const addBtn = card.querySelector('.add-to-cart-button');
    const qtyControls = card.querySelector('.quantity-controls');
    const qtyCount = card.querySelector('.qty-count');
    
    if (cartItem && cartItem.quantity > 0) {
      // Item is in cart - show quantity controls
      if (addBtn) addBtn.style.display = 'none';
      if (qtyControls) qtyControls.style.display = 'flex';
      if (qtyCount) qtyCount.textContent = cartItem.quantity;
    } else {
      // Item not in cart - show add to cart button
      if (addBtn) addBtn.style.display = 'block';
      if (qtyControls) qtyControls.style.display = 'none';
    }
  });
  
  // Update cart count
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}
