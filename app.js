//  API 
const PRODUCTS_API = "https://fakestoreapi.com/products";
const CATEGORIES_API = "https://fakestoreapi.com/products/categories";

// DOM References 
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const productsGrid = document.getElementById("productsGrid");
const productModal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
//State variables
let allProducts = [];    
let visibleProducts = []; 

//  Initialization
async function init() {
  try {
    const categories = await fetchCategories();
    populateCategorySelect(categories);

    allProducts = await fetchProducts();
    visibleProducts = [...allProducts];
    renderProducts(visibleProducts);

    setupSearchAndFilter();

    setupProductClick();

    setupModalEvents();
  } catch (err) {
    console.error("Init error:", err);
    productsGrid.innerHTML = `<p class="text-red-600">حدث خطأ أثناء تحميل المنتجات.</p>`;
  }
}

//  Fetch helpers
async function fetchProducts() {
  const res = await fetch(PRODUCTS_API);
  if (!res.ok) throw new Error("فشل تحميل المنتجات");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch(CATEGORIES_API);
  if (!res.ok) throw new Error("فشل تحميل الفئات");
  const cats = await res.json();
  return ["all", ...cats]; 
}

// ===== Render helpers =====
function populateCategorySelect(categories) {
  categorySelect.innerHTML = categories
    .map(cat => {
      const label = cat === "all" ? "All Categories" : capitalize(cat);
      return `<option value="${escapeHtml(cat)}">${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderProducts(productsArray) {
  if (!productsArray.length) {
    productsGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">لا توجد منتجات مطابقة.</p>`;
    return;
  }

  productsGrid.innerHTML = productsArray
    .map(p => productCardHTML(p))
    .join("");
}

function productCardHTML(product) {
  return `
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer" data-id="${product.id}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="w-full h-48 object-contain mb-3" />
      
      <h3 class="text-sm font-semibold mb-1 truncate">${escapeHtml(product.title)}</h3>
      
      <p class="text-green-600 font-bold">$${product.price}</p>

      <p class="text-yellow-500 text-sm">⭐ ${product.rating.rate} (${product.rating.count})</p>

      <p class="text-xs text-gray-400 mt-2">${escapeHtml(product.category)}</p>
    </div>
  `;
}


//  Search && Filter 
function setupSearchAndFilter() {
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  categorySelect.addEventListener("change", () => {
    applyFilters();
  });
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  visibleProducts = allProducts.filter(p => {
    const matchesQuery = p.title.toLowerCase().includes(query);
    const matchesCategory = category === "all" ? true : p.category === category;
    return matchesQuery && matchesCategory;
  });

  renderProducts(visibleProducts);
}

function setupProductClick() {
  productsGrid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    const id = card.getAttribute("data-id");
    const product = allProducts.find(p => String(p.id) === String(id));
    if (product) showProductModal(product);
  });
}

function showProductModal(product) {
  modalImage.src = product.image;
  modalTitle.textContent = product.title;
  modalPrice.textContent = `$${product.price}`;
  modalDescription.textContent = product.description;

  productModal.classList.remove("hidden");
}

function setupModalEvents() {
  closeModalBtn.addEventListener("click", closeModal);

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !productModal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function closeModal() {
  modalImage.src = "";
  modalTitle.textContent = "";
  modalPrice.textContent = "";
  modalDescription.textContent = "";
  productModal.classList.add("hidden");
}

function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
 