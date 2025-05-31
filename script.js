// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all event listeners and functionality
  initSidebar();
  initNavigation();
  initModals();
  initConfirmationModal();
  initNotifications();
  
  // Load initial data
  loadDashboardData();
  loadProducts();
  loadOrders();
  loadUsers();
  loadCategories();
  
  // Initialize form event listeners
  initProductForm();
  initCategoryForm();
});

// API URL constant
const API_BASE_URL = ' https://junglibear.onrender.com/api';

// Global variables for modal actions
let currentItemToDelete = null;
let currentDeleteType = null;
let currentOrderId = null;
let currentOrderStatus = null;
let uploadedImages = [];
let existingImages = [];
let imageFilesToUpload = [];

// ============================================
// Navigation and Sidebar Functions
// ============================================

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  
  mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  const sectionTitle = document.getElementById('sectionTitle');
  
  // Initialize navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Get section name and activate corresponding section
      const sectionName = link.getAttribute('data-section');
      const section = document.getElementById(`${sectionName}Section`);
      section.classList.add('active');
      
      // Update section title
      sectionTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
      
      // On mobile, close sidebar after navigation
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
      }
    });
  });
  
  // Handle "View All" links in dashboard
  const viewAllLinks = document.querySelectorAll('.view-all');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Get section name and activate corresponding section
      const sectionName = link.getAttribute('data-section');
      const section = document.getElementById(`${sectionName}Section`);
      section.classList.add('active');
      
      // Add active class to correct nav link
      document.querySelector(`.nav-link[data-section="${sectionName}"]`).classList.add('active');
      
      // Update section title
      sectionTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    });
  });
}

// ============================================
// Modal Functions
// ============================================

function initModals() {
  // Product Modal
  const productModal = document.getElementById('productModal');
  const addProductBtn = document.getElementById('addProductBtn');
  const closeProductModal = document.getElementById('closeProductModal');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  
  addProductBtn.addEventListener('click', () => {
    // Reset form for new product
    resetProductForm();
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    showModal(productModal);
  });
  
  closeProductModal.addEventListener('click', () => {
    hideModal(productModal);
  });
  
  cancelProductBtn.addEventListener('click', () => {
    hideModal(productModal);
  });
  
  // Order Details Modal
  const orderDetailsModal = document.getElementById('orderDetailsModal');
  const closeOrderModal = document.getElementById('closeOrderModal');
  
  closeOrderModal.addEventListener('click', () => {
    hideModal(orderDetailsModal);
  });
  
  // User Details Modal
  const userDetailsModal = document.getElementById('userDetailsModal');
  const closeUserModal = document.getElementById('closeUserModal');
  
  closeUserModal.addEventListener('click', () => {
    hideModal(userDetailsModal);
  });
  
  // Category Modal
  const categoryModal = document.getElementById('categoryModal');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const closeCategoryModal = document.getElementById('closeCategoryModal');
  const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
  
  addCategoryBtn.addEventListener('click', () => {
    // Reset form for new category
    document.getElementById('categoryName').value = '';
    showModal(categoryModal);
  });
  
  closeCategoryModal.addEventListener('click', () => {
    hideModal(categoryModal);
  });
  
  cancelCategoryBtn.addEventListener('click', () => {
    hideModal(categoryModal);
  });
  
  // Handle carousel checkbox toggle
  const carouselCheckbox = document.getElementById('productInCarousel');
  const carouselDataFields = document.querySelector('.carousel-data');
  
  carouselCheckbox.addEventListener('change', () => {
    if (carouselCheckbox.checked) {
      carouselDataFields.style.display = 'block';
    } else {
      carouselDataFields.style.display = 'none';
    }
  });
  
  // Handle image uploads
  const productImages = document.getElementById('productImages');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  
  productImages.addEventListener('change', handleImageSelection);
}

function initConfirmationModal() {
  const confirmationModal = document.getElementById('confirmationModal');
  const closeConfirmationModal = document.getElementById('closeConfirmationModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  
  closeConfirmationModal.addEventListener('click', () => {
    hideModal(confirmationModal);
  });
  
  cancelDeleteBtn.addEventListener('click', () => {
    hideModal(confirmationModal);
  });
  
  confirmDeleteBtn.addEventListener('click', () => {
    if (currentDeleteType && currentItemToDelete) {
      switch(currentDeleteType) {
        case 'product':
          deleteProduct(currentItemToDelete);
          break;
        case 'category':
          deleteCategory(currentItemToDelete);
          break;
        default:
          break;
      }
      
      hideModal(confirmationModal);
    }
  });
}

function showModal(modal) {
  modal.classList.add('active');
}

function hideModal(modal) {
  modal.classList.remove('active');
}

function showConfirmDelete(itemId, type, message) {
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmationMessage = document.getElementById('confirmationMessage');
  
  currentItemToDelete = itemId;
  currentDeleteType = type;
  
  confirmationMessage.textContent = message || `Are you sure you want to delete this ${type}?`;
  
  showModal(confirmationModal);
}

// ============================================
// Notification Functions
// ============================================

function initNotifications() {
  // Add event listener to close notification on click
  const notification = document.getElementById('notification');
  notification.addEventListener('click', () => {
    notification.classList.remove('show');
  });
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const messageEl = notification.querySelector('.notification-message');
  
  // Remove previous classes
  notification.classList.remove('success', 'error', 'warning');
  
  // Add appropriate class
  notification.classList.add(type);
  
  // Set message
  messageEl.textContent = message;
  
  // Show notification
  notification.classList.add('show');
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ============================================
// Dashboard Functions
// ============================================

async function loadDashboardData() {
  try {
    // Fetch dashboard stats
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    
    if (!response.ok) {
      throw new Error('Failed to load dashboard data');
    }
    
    const data = await response.json();
    
    // Update dashboard cards
    document.getElementById('totalProducts').textContent = data.totalProducts || 0;
    document.getElementById('inStockProducts').textContent = data.inStockProducts || 0;
    document.getElementById('outOfStockProducts').textContent = data.outOfStockProducts || 0;
    document.getElementById('totalOrders').textContent = data.totalOrders || 0;
    document.getElementById('pendingOrders').textContent = data.pendingOrders || 0;
    document.getElementById('totalUsers').textContent = data.totalUsers || 0;
    
    // Load recent orders
    loadRecentOrders(data.recentOrders || []);
    
    // Load low stock products
    loadLowStockProducts(data.lowStockProducts || []);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
}

function loadRecentOrders(orders) {
  const recentOrdersList = document.getElementById('recentOrdersList');
  
  if (orders.length === 0) {
    recentOrdersList.innerHTML = '<p class="empty-message">No recent orders</p>';
    return;
  }
  
  let html = '';
  
  orders.forEach(order => {
    const date = new Date(order.orderDate).toLocaleDateString();
    
    html += `
      <div class="recent-item">
        <div class="item-info">
          <div class="item-title">Order #${order.orderId}</div>
          <div class="item-subtitle">${order.customerDetails.name} • ${date}</div>
        </div>
        <div class="item-value">
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
      </div>
    `;
  });

  
  recentOrdersList.innerHTML = html;
}

function loadLowStockProducts(products) {
  const lowStockList = document.getElementById('lowStockList');
  
  if (products.length === 0) {
    lowStockList.innerHTML = '<p class="empty-message">No low stock products</p>';
    return;
  }
  
  let html = '';
  
  products.forEach(product => {
    html += `
      <div class="recent-item">
        <div class="item-info">
          <div class="item-title">${product.title}</div>
          <div class="item-subtitle">${product.category}</div>
        </div>
        <div class="item-value">
          <span class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    `;
  });
  
  lowStockList.innerHTML = html;
}

// ============================================
// Products Functions
// ============================================

async function loadProducts() {
  try {
    const productsTableBody = document.getElementById('productsTableBody');
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="loading-cell">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </td>
      </tr>
    `;
    
    // Fetch products data
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Failed to load products');
    }
    
    const products = await response.json();
    
    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-cell">No products available</td>
        </tr>
      `;
      return;
    }
    
    // Render products
    productsTableBody.innerHTML = '';
    
    products.forEach(product => {
      const row = document.createElement('tr');
      
      // Get first image or placeholder
      const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://via.placeholder.com/50';
      
      row.innerHTML = `
        <td>${product.id}</td>
        <td><img src="${imageUrl}" alt="${product.title}" class="product-image"></td>
        <td>${product.title}</td>
        <td>₹${product.price}</td>
        <td>${product.category}</td>
        <td>
          <span class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>${product.inCarousel === true ? 'Yes' : 'No'}</td>
        <td class="actions-cell">
          <button class="action-btn edit-btn" title="Edit Product" data-id="${product.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete Product" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      productsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        editProduct(productId);
      });
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        showConfirmDelete(productId, 'product', 'Are you sure you want to delete this product?');
      });
    });
    
    // Add search functionality
    const productSearch = document.getElementById('productSearch');
    productSearch.addEventListener('input', filterProducts);
    
  } catch (error) {
    console.error('Error loading products:', error);
    
    const productsTableBody = document.getElementById('productsTableBody');
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="error-cell">Failed to load products. Please try again.</td>
      </tr>
    `;
    
    showNotification('Failed to load products', 'error');
  }
}

function filterProducts() {
  const searchTerm = document.getElementById('productSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#productsTableBody tr');
  
  rows.forEach(row => {
    const title = row.children[2] ? row.children[2].textContent.toLowerCase() : '';
    const category = row.children[4] ? row.children[4].textContent.toLowerCase() : '';
    
    if (title.includes(searchTerm) || category.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}


function initProductForm() {
  const productForm = document.getElementById('productForm');
  const saveProductBtn = document.getElementById('saveProductBtn');
  
  saveProductBtn.addEventListener('click', async () => {
    // Validate form
    if (!productForm.checkValidity()) {
      productForm.reportValidity();
      return;
    }
    
    try {
      // Get form data
      const formData = new FormData();
      
      // Add all form fields
      formData.append('id', document.getElementById('productId').value);
      formData.append('title', document.getElementById('productTitle').value);
      formData.append('price', document.getElementById('productPrice').value);
      formData.append('description', document.getElementById('productDescription').value);
      formData.append('category', document.getElementById('productCategory').value);
      formData.append('inStock', document.getElementById('productInStock').checked);
      formData.append('inCarousel', document.getElementById('productInCarousel').checked);
      
      // Add carousel data if applicable
      if (document.getElementById('productInCarousel').checked) {
        formData.append('carouselTitle', document.getElementById('carouselTitle').value);
        formData.append('carouselSubtitle', document.getElementById('carouselSubtitle').value);
      }
      
      // Add images
      for (const file of imageFilesToUpload) {
        formData.append('images', file);
      }
      
      // Add existing images
      formData.append('existingImages', JSON.stringify(existingImages));
      
      // Check if we're updating or creating
      const isUpdate = document.getElementById('productId').value !== '';
      
      // Send request
      const url = isUpdate 
        ? `${API_BASE_URL}/products/${document.getElementById('productId').value}`
        : `${API_BASE_URL}/products`;
      
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      // Show success notification
      showNotification(isUpdate ? 'Product updated successfully' : 'Product added successfully');
      
      // Close modal and reload products
      hideModal(document.getElementById('productModal'));
      loadProducts();
      
      // If dashboard is visible, reload it too
      if (document.getElementById('dashboardSection').classList.contains('active')) {
        loadDashboardData();
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Failed to save product', 'error');
    }
  });
}

function resetProductForm() {
  const productForm = document.getElementById('productForm');
  productForm.reset();
  
  // Clear hidden fields
  document.getElementById('productId').value = '';
  
  // Reset image previews
  document.getElementById('imagePreviewContainer').innerHTML = '';
  document.getElementById('existingImages').innerHTML = '';
  
  // Reset global variables
  uploadedImages = [];
  existingImages = [];
  imageFilesToUpload = [];
  
  // Hide carousel data fields
  document.querySelector('.carousel-data').style.display = 'none';
}

async function editProduct(productId) {
  try {
    // Fetch product data
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    
    const product = await response.json();
    
    // Set form title
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    
    // Populate form fields
    document.getElementById('productId').value = product.id;
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productInStock').checked = product.inStock;
    
    // Set carousel checkbox based on product data
    document.getElementById('productInCarousel').checked = product.inCarousel || false;
    
    // Show/hide carousel fields and pre-fill data
    const carouselFields = document.querySelector('.carousel-data');
    if (product.inCarousel) {
      carouselFields.style.display = 'block';
      
      // Pre-fill carousel fields with existing data or defaults
      document.getElementById('carouselTitle').value = product.carouselTitle || product.title;
      document.getElementById('carouselSubtitle').value = product.carouselSubtitle || (product.description ? product.description.substring(0, 50) + '...' : '');
    } else {
      carouselFields.style.display = 'none';
      document.getElementById('carouselTitle').value = '';
      document.getElementById('carouselSubtitle').value = '';
    }
    
    // Reset existing images to prevent duplication
    existingImages = [];
    
    // Display existing images
    const existingImagesContainer = document.getElementById('existingImages');
    existingImagesContainer.innerHTML = '';
    
    if (product.images && product.images.length > 0) {
      product.images.forEach((image, index) => {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'image-preview';
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Product Image';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => {
          existingImages.splice(existingImages.indexOf(image), 1);
          imageWrapper.remove();
        };
        
        imageWrapper.appendChild(img);
        imageWrapper.appendChild(removeBtn);
        existingImagesContainer.appendChild(imageWrapper);
        
        existingImages.push(image);
      });
    }
    
    // Clear new image uploads
    imageFilesToUpload = [];
    document.getElementById('imagePreviewContainer').innerHTML = '';
    
    // Show modal
    showModal(document.getElementById('productModal'));
    
  } catch (error) {
    console.error('Error fetching product details:', error);
    showNotification('Failed to load product details', 'error');
  }
}
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    showNotification('Product deleted successfully');
    loadProducts();
    
    // If dashboard is visible, reload it too
    if (document.getElementById('dashboardSection').classList.contains('active')) {
      loadDashboardData();
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Failed to delete product', 'error');
  }
}

function handleImageSelection(event) {
  const files = event.target.files;
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  
  // Clear previous uploads
  imagePreviewContainer.innerHTML = '';
  imageFilesToUpload = [];
  
  if (files.length === 0) return;
  
  // Preview selected images
  for (const file of files) {
    // Only process image files
    if (!file.type.startsWith('image/')) continue;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'image-preview';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Image Preview';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', () => {
        imageWrapper.remove();
        imageFilesToUpload = imageFilesToUpload.filter(f => f !== file);
      });
      
      imageWrapper.appendChild(img);
      imageWrapper.appendChild(removeBtn);
      imagePreviewContainer.appendChild(imageWrapper);
    };
    
    // Add to files to upload
    imageFilesToUpload.push(file);
    
    // Read the image file as a data URL
    reader.readAsDataURL(file);
  }
}

// ============================================
// Orders Functions
// ============================================

async function loadOrders() {
  try {
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-cell">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </td>
      </tr>
    `;
    
    // Get selected filter
    const statusFilter = document.getElementById('orderStatusFilter').value;
    
    // Fetch orders data
    const url = statusFilter === 'all' 
      ? `${API_BASE_URL}/orders` 
      : `${API_BASE_URL}/orders?status=${statusFilter}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to load orders');
    }
    
    const orders = await response.json();
    
    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">No orders available</td>
        </tr>
      `;
      return;
    }
    
    // Render orders
    ordersTableBody.innerHTML = '';
    
    orders.forEach(order => {
      const row = document.createElement('tr');
      const date = new Date(order.date).toLocaleDateString();
      
     row.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.customerDetails.name}</td>
      <td>${new Date(order.orderDate).toLocaleDateString()}</td>
      <td>₹${order.total}</td>
      <td>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </td>
      <td class="actions-cell">
        <button class="action-btn view-btn" title="View Order" data-id="${order.orderId}">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
      ordersTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const orderId = button.getAttribute('data-id');
        viewOrderDetails(orderId);
      });
    });
    
    // Add search functionality
    const orderSearch = document.getElementById('orderSearch');
    orderSearch.addEventListener('input', filterOrders);
    
    // Add filter change event
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    orderStatusFilter.addEventListener('change', loadOrders);
    
  } catch (error) {
    console.error('Error loading orders:', error);
    
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="error-cell">Failed to load orders. Please try again.</td>
      </tr>
    `;
    
    showNotification('Failed to load orders', 'error');
  }
}

function filterOrders() {
  const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#ordersTableBody tr');
  
  rows.forEach(row => {
    const orderId = row.children[0] ? row.children[0].textContent.toLowerCase() : '';
    const customerName = row.children[1] ? row.children[1].textContent.toLowerCase() : '';
    
    if (orderId.includes(searchTerm) || customerName.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

async function viewOrderDetails(orderId) {
  try {
    // Fetch order details
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    
    
    const order = await response.json();
    
    // Populate order details
   document.getElementById('orderDetailId').textContent = order.orderId;
    document.getElementById('orderDetailDate').textContent = new Date(order.orderDate).toLocaleString();
    document.getElementById('orderDetailStatus').textContent = order.status;
    document.getElementById('orderDetailCustomer').textContent = order.customerDetails.name;
    document.getElementById('orderDetailPhone').textContent = order.customerDetails.phoneNumber;
    document.getElementById('orderDetailAddress').textContent = order.customerDetails.address;
    document.getElementById('orderDetailDelivery').textContent = order.customerDetails.deliveryOption;
    document.getElementById('orderDetailSubtotal').textContent = `₹${order.subtotal.toFixed(2)}`;
    document.getElementById('orderDetailDeliveryFee').textContent = `₹${order.deliveryFee.toFixed(2)}`;
    document.getElementById('orderDetailTotal').textContent = `₹${order.total.toFixed(2)}`;
    
    // Set current order ID and status for update
    currentOrderId = order.orderId;
    currentOrderStatus = order.status;
    document.getElementById('updateOrderStatus').value = order.status;
    
    // Render order items
    const orderItemsList = document.getElementById('orderItemsList');
    orderItemsList.innerHTML = '';
    
    order.items.forEach(item => {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';
      
      orderItem.innerHTML = `
        <img src="${item.image || item.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyMEMyNi4xMDQ2IDIwIDI3IDIwLjg5NTQgMjcgMjJDMjcgMjMuMTA0NiAyNi4xMDQ2IDI0IDI1IDI0QzIzLjg5NTQgMjQgMjMgMjMuMTA0NiAyMyAyMkMyMyAyMC44OTU0IDIzLjg5NTQgMjAgMjUgMjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xNiAzMkwyNC41IDIzLjVMMzAgMjlMMzQuNSAyNC41TDQwIDMwVjM2SDE2VjMyWiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K'}" alt="${item.title}" class="order-item-image">
        <div class="order-item-details">
          <div class="order-item-title">${item.title}</div>
          <div class="order-item-price">₹${item.price}</div>
        </div>
        <div class="order-item-quantity">x${item.quantity}</div>
        <div class="order-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
      `;
      
      orderItemsList.appendChild(orderItem);
    });
    
    // Add event listener to update button
    const updateOrderStatusBtn = document.getElementById('updateOrderStatusBtn');
    updateOrderStatusBtn.addEventListener('click', updateOrderStatus);
    
    // Show modal
    showModal(document.getElementById('orderDetailsModal'));
    
  } catch (error) {
    console.error('Error fetching order details:', error);

  }
}

async function updateOrderStatus() {
  try {
    const newStatus = document.getElementById('updateOrderStatus').value;
    
    // Skip if status hasn't changed
    if (newStatus === currentOrderStatus) {
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders/${currentOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    
    showNotification('Order status updated successfully');
    
    // Update current status
    currentOrderStatus = newStatus;
    document.getElementById('orderDetailStatus').textContent = newStatus;
    
    // Reload orders list
    loadOrders();
    
    // If dashboard is visible, reload it too
    if (document.getElementById('dashboardSection').classList.contains('active')) {
      loadDashboardData();
    }
    
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('Failed to update order status', 'error');
  }
}

// ============================================
// Users Functions
// ============================================

async function loadUsers() {
  try {
    const usersTableBody = document.getElementById('usersTableBody');
    
    // Show loading state
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-cell">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </td>
      </tr>
    `;
    
    // Fetch users
    const response = await fetch(`${API_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error('Failed to load users');
    }
    
    const users = await response.json();
    
    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-cell">No users available</td>
        </tr>
      `;
      return;
    }
    
    // Clear users table
    usersTableBody.innerHTML = '';
    
    // Render users
    users.forEach(user => {
      const row = document.createElement('tr');
      
      // Format the last order date if available
      let lastOrderDate = 'N/A';
      if (user.lastOrderDate) {
        try {
          lastOrderDate = new Date(user.lastOrderDate).toLocaleDateString();
        } catch (e) {
          console.warn('Invalid date format for lastOrderDate:', user.lastOrderDate);
        }
      }
      
      row.innerHTML = `
        <td>${lastOrderDate}</td>
        <td>${user.name || 'N/A'}</td>
        <td>${user.phoneNumber || 'N/A'}</td>
        <td>${user.address || 'N/A'}</td>
  <td class="actions-cell">
        <td class="actions-cell">
          <button class="action-btn view-btn" title="View User">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `;
      
      usersTableBody.appendChild(row);
      
      // Add event listener to view button
      const viewButton = row.querySelector('.view-btn');
      viewButton.addEventListener('click', () => {
        console.log('User button clicked with ID:', user._id);
        viewUserDetails(user._id);
        
      });
    });
    
    // Add search functionality
    const userSearch = document.getElementById('userSearch');
    userSearch.addEventListener('input', filterUsers);
    
  } catch (error) {
    console.error('Error loading users:', error);
    
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error-cell">Failed to load users. Please try again.</td>
      </tr>
    `;
    
    showNotification('Failed to load users', 'error');
  }
}
function filterUsers() {
  const searchTerm = document.getElementById('userSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');
  
  rows.forEach(row => {
    const name = row.children[1] ? row.children[1].textContent.toLowerCase() : '';
    const phone = row.children[2] ? row.children[2].textContent.toLowerCase() : '';
    
    if (name.includes(searchTerm) || phone.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

async function viewUserDetails(userId) {
  try {
    // Add blur and disable interaction
    document.body.style.filter = 'blur(2px)';
    document.body.style.webkitFilter = 'blur(2px)';
    document.body.style.pointerEvents = 'none';

    console.log('Viewing user details for ID:', userId);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const user = await response.json();
    console.log('User data:', user);

    const userModal = document.getElementById('userDetailsModal');
    if (!userModal) {
      throw new Error('User details modal not found in the DOM');
    }

    const setElementText = (id, text) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
      } else {
        console.warn(`Element with ID "${id}" not found`);
      }
    };

    setElementText('userDetailName', user.name || 'N/A');
    setElementText('userDetailPhone', user.phoneNumber || 'N/A');
    setElementText('userDetailAddress', user.address || 'N/A');
    setElementText('userDetailSociety', user.society || 'N/A');

    let lastOrderDateText = 'N/A';
    if (user.lastOrderDate) {
      try {
        lastOrderDateText = new Date(user.lastOrderDate).toLocaleDateString();
      } catch (e) {
        console.warn('Invalid date format for lastOrderDate:', user.lastOrderDate);
      }
    }
    setElementText('userDetailLastOrder', lastOrderDateText);

    const ordersListContainer = document.getElementById('userOrdersList');
    if (!ordersListContainer) {
      console.warn('Orders list container not found. User orders will not be displayed.');
    } else {
      ordersListContainer.innerHTML = '<div class="loading">Loading orders...</div>';

      let validOrderIds = [];
      if (user.orders && Array.isArray(user.orders)) {
        validOrderIds = user.orders.filter(orderId =>
          orderId !== null && orderId !== undefined && orderId !== 0 && orderId !== ''
        );
      }

      if (validOrderIds.length === 0) {
        console.log('No valid orders found for user');
        ordersListContainer.innerHTML = '<p class="no-orders-message">No order history available</p>';
      } else {
        console.log(`Found ${validOrderIds.length} valid orders for user:`, validOrderIds);

        const ordersList = document.createElement('div');
        let hasValidOrders = false;

        for (const orderId of validOrderIds) {
          try {
            console.log('Fetching order:', orderId);
            const orderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            if (!orderResponse.ok) {
              console.warn(`Order ${orderId} not found: ${orderResponse.status}`);
              continue;
            }

            const order = await orderResponse.json();
            console.log('Order data received:', order);

            if (!order || !order.orderId) {
              console.warn('Received invalid order data:', order);
              continue;
            }

            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';

            let orderDate = 'N/A';
            if (order.orderDate) {
              try {
                orderDate = new Date(order.orderDate).toLocaleDateString();
              } catch (e) {
                console.warn('Invalid date format for order:', order.orderDate);
              }
            }

            const orderStatus = order.status
              ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
              : 'Unknown';

            orderItem.innerHTML = `
              <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-date">${orderDate}</span>
                <span class="order-status ${order.status || 'unknown'}">${orderStatus}</span>
              </div>
              <div class="order-total">
                <span>Total: ₹${(order.total || 0).toFixed(2)}</span>
              </div>
              <div class="order-actions">
                <button class="view-order-btn" data-order-id="${order.orderId}">View Details</button>
              </div>
            `;

            ordersList.appendChild(orderItem);
            hasValidOrders = true;
          } catch (err) {
            console.error(`Error processing order ${orderId}:`, err);
          }
        }

        ordersListContainer.innerHTML = '';
        if (hasValidOrders) {
          ordersListContainer.appendChild(ordersList);

          document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', event => {
              event.preventDefault();
              const orderId = btn.dataset.orderId;
              console.log('Viewing order details:', orderId);

              userModal.classList.remove('active');
              viewOrderDetails(orderId);
            });
          });
        } else {
          ordersListContainer.innerHTML = '<p class="no-orders-message">No order history available</p>';
        }
      }
    }

    userModal.classList.add('active');

  } catch (error) {
    console.error('Error in viewUserDetails:', error);
    showNotification('Failed to load user details: ' + error.message, 'error');
  } finally {
    // Always remove blur and pointer lock after everything is done
    document.body.style.filter = '';
    document.body.style.webkitFilter = '';
    document.body.style.pointerEvents = '';
  }
}

// ============================================
// Categories Functions
// ============================================

async function loadCategories() {
  try {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    `;
    
    // Also populate categories in product form
    const productCategorySelect = document.getElementById('productCategory');
    
    // Fetch categories data
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
    
    const categories = await response.json();
    
    if (categories.length === 0) {
      categoriesContainer.innerHTML = `
        <p class="empty-message">No categories available</p>
      `;
      
      // Reset product category select
      productCategorySelect.innerHTML = '<option value="">Select Category</option>';
      
      return;
    }
    
    // Render categories
    categoriesContainer.innerHTML = '';
    
    // Reset product category select
    productCategorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
      // Add to categories container
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      
      categoryCard.innerHTML = `
        <span class="category-name">${category.name}</span>
        <button class="action-btn delete-btn" title="Delete Category" data-id="${category._id}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      categoriesContainer.appendChild(categoryCard);
      
      // Add to product category select
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      productCategorySelect.appendChild(option);
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.categories-container .delete-btn');
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.getAttribute('data-id');
        showConfirmDelete(categoryId, 'category', 'Are you sure you want to delete this category?');
      });
    });
    
  } catch (error) {
    console.error('Error loading categories:', error);
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = `
      <p class="error-message">Failed to load categories. Please try again.</p>
    `;
    
    showNotification('Failed to load categories', 'error');
  }
}

function initCategoryForm() {
  const saveCategoryBtn = document.getElementById('saveCategoryBtn');
  
  saveCategoryBtn.addEventListener('click', async () => {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
      showNotification('Category name is required', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      
      showNotification('Category added successfully');
      hideModal(document.getElementById('categoryModal'));
      loadCategories();
      
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Failed to add category', 'error');
    }
  });
}

async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
    
    showNotification('Category deleted successfully');
    loadCategories();
    
  } catch (error) {
    console.error('Error deleting category:', error);
    showNotification('Failed to delete category', 'error');
  }
}

// ============================================
// Utility Functions
// ============================================

function truncateText(text, maxLength) {
  if (!text) return 'N/A';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}
