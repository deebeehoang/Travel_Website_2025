let currentPage = 1;
let hasMore = true;
let isLoading = false;
let currentSort = 'default';
let currentFilter = null;

// ===================== DOM ELEMENTS =====================
const filterAllBtn = document.getElementById('filterAllBtn');
const filterHotBtn = document.getElementById('filterHotBtn');
const filterSaleBtn = document.getElementById('filterSaleBtn');
const filterCityBtn = document.getElementById('filterCityBtn');
// Advanced filter elements
const priceMinInput = document.getElementById('filterPriceMin');
const priceMaxInput = document.getElementById('filterPriceMax');
const destinationInput = document.getElementById('filterDestination');
const statusSelect = document.getElementById('filterStatus');
const ratingSelect = document.getElementById('filterRating');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const tourTypeFilter = document.getElementById('tourTypeFilter');
const heroSearchInput = document.getElementById('heroSearchInput');
const heroTourTypeBtn = document.getElementById('heroTourTypeBtn');
const heroTourTypeDropdown = document.getElementById('heroTourTypeDropdown');
const heroTourTypeFilter = document.getElementById('heroTourTypeFilter');
const heroSearchBtn = document.getElementById('heroSearchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const sortBtn = document.getElementById('sortBtn');
const sortDropdown = document.getElementById('sortDropdown');
const sortBtnText = document.getElementById('sortBtnText');
const sortOptions = document.querySelectorAll('.sort-option');
const toursContainer = document.getElementById('toursContainer');

// ===================== EVENT LISTENERS =====================
// Filter All
if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
        currentFilter = null;
        resetPagination();
        loadTours();
    });
    // Tự động kích hoạt khi vào trang
    document.addEventListener('DOMContentLoaded', () => {
        filterAllBtn.click();
    });
}
// Filter Hot
if (filterHotBtn) {
    filterHotBtn.addEventListener('click', () => {
        currentFilter = 'hot';
        resetPagination();
        loadTours();
    });
}
// Filter Sale
if (filterSaleBtn) {
    filterSaleBtn.addEventListener('click', () => {
        currentFilter = 'sale';
        resetPagination();
        loadTours();
    });
}
// Filter City
if (filterCityBtn) {
    filterCityBtn.addEventListener('click', () => {
        currentFilter = 'city';
        resetPagination();
        loadTours();
    });
}
// Advanced filter listeners
if (priceMinInput) priceMinInput.addEventListener('input', () => { resetPagination(); loadTours(); });
if (priceMaxInput) priceMaxInput.addEventListener('input', () => { resetPagination(); loadTours(); });
if (destinationInput) destinationInput.addEventListener('input', () => { resetPagination(); loadTours(); });
if (statusSelect) statusSelect.addEventListener('change', () => { resetPagination(); loadTours(); });
if (ratingSelect) ratingSelect.addEventListener('change', () => { resetPagination(); loadTours(); });

// Search form submit
if (searchForm) {
    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        resetPagination();
        loadTours();
    });
}

// reveal static images on initial load
document.addEventListener('DOMContentLoaded', () => {
    try { revealNonLazyImages(); } catch (e) { /* ignore */ }
});

// Search input debounce
if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
        resetPagination();
        loadTours();
    }, 500));
}

// Tour type filter change
if (tourTypeFilter) {
    tourTypeFilter.addEventListener('change', () => {
        resetPagination();
        loadTours();
    });
}

// Hero search input
if (heroSearchInput && searchInput) {
    heroSearchInput.addEventListener('input', function() {
        searchInput.value = this.value;
        resetPagination();
        loadTours();
    });
    heroSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchInput.value = this.value;
            resetPagination();
            loadTours();
        }
    });
}

// Hero search button click
if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
        searchInput.value = heroSearchInput.value;
        resetPagination();
        loadTours();
    });
}

// Hero tour type dropdown toggle
if (heroTourTypeBtn && heroTourTypeDropdown) {
    heroTourTypeBtn.addEventListener('click', () => {
        heroTourTypeDropdown.style.display = heroTourTypeDropdown.style.display === 'block' ? 'none' : 'block';
    });
}

// Hero tour type filter selection
if (heroTourTypeFilter && tourTypeFilter) {
    heroTourTypeFilter.addEventListener('change', () => {
        tourTypeFilter.value = heroTourTypeFilter.value;
        heroTourTypeDropdown.style.display = 'none';
        resetPagination();
        loadTours();
    });
}

// Load more button
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        if (!isLoading && hasMore) {
            currentPage++;
            loadTours();
        }
    });
}

// Sort dropdown toggle
if (sortBtn && sortDropdown) {
    sortBtn.addEventListener('click', e => {
        e.stopPropagation();
        sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', e => {
        if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.style.display = 'none';
        }
    });
}

// Sort options selection
sortOptions.forEach(option => {
    option.addEventListener('click', e => {
        e.preventDefault();
        currentSort = option.dataset.sort || 'default';
        sortOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        if (sortBtnText) sortBtnText.textContent = option.textContent;
        resetPagination();
        loadTours();
    });
});

// ===================== FUNCTIONS =====================

// Reset pagination state
function resetPagination() {
    currentPage = 1;
    hasMore = true;
    if (toursContainer) toursContainer.innerHTML = '';
}

// Load tours from API
async function loadTours() {
    if (isLoading || !hasMore) return;
    try {
        isLoading = true;
        showLoading(true);

        const searchQuery = searchInput?.value.trim() || '';
        const tourType = tourTypeFilter?.value || '';
        const perPage = 12;
        const queryParams = new URLSearchParams({ page: currentPage, limit: perPage });
        if (searchQuery) queryParams.append('search', searchQuery);
        if (tourType) {
            const apiTourType = tourType === 'Trong nước' ? 'trong_nuoc' : tourType === 'Nước ngoài' ? 'nuoc_ngoai' : tourType;
            queryParams.append('tourType', apiTourType);
        }

        let url = `${CONFIG.API_BASE_URL}/tours?${queryParams}`;
        // Nếu filter là 'hot' hoặc 'sale', gọi API chuyên biệt
        if (currentFilter === 'hot') {
            url = `${CONFIG.API_BASE_URL}/tours/hot?${queryParams}`;
        } else if (currentFilter === 'sale') {
            url = `${CONFIG.API_BASE_URL}/tours/sale?${queryParams}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách tour');
        const data = await response.json();
        if (data.status !== 'success') throw new Error('API trả về lỗi');

        let tours = data.data.tours || [];
        tours = filterTours(tours);
        hasMore = data.pagination?.hasMore ?? (tours.length >= perPage);

        if (currentPage === 1) toursContainer.innerHTML = '';

        const sortedTours = sortTours(tours, currentSort);
        if (sortedTours.length === 0 && currentPage === 1) {
            toursContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Không tìm thấy tour nào phù hợp với tiêu chí tìm kiếm.</p></div>';
            hasMore = false;
        } else {
            sortedTours.forEach(displayTour);
            // Initialize lazy image observer after inserting tours
            initLazyImages();
            // Reveal any non-lazy images (example/static cards)
            revealNonLazyImages();
        }
    } catch (error) {
        console.error(error);
        showAlert('Không thể tải danh sách tour. Vui lòng thử lại sau.', 'danger');
    } finally {
        isLoading = false;
        showLoading(false);
        updateLoadMoreButton();
    }
}

// Filter tours by availability and type
function filterTours(tours) {
    const tourType = tourTypeFilter?.value || '';
    const priceMin = priceMinInput ? parseInt(priceMinInput.value) : null;
    const priceMax = priceMaxInput ? parseInt(priceMaxInput.value) : null;
    const destination = destinationInput ? destinationInput.value.trim().toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : '';
    const rating = ratingSelect ? parseFloat(ratingSelect.value) : null;
    // Nếu đang ở filter 'hot' hoặc 'sale', không filter lại với điều kiện tour.Hot/tour.Giam_gia
    if (currentFilter === 'hot' || currentFilter === 'sale') {
        return tours;
    }
    return tours.filter(tour => {
        if (tourType) {
            const apiTourType = tourType === 'Trong nước' ? 'trong_nuoc' : tourType === 'Nước ngoài' ? 'nuoc_ngoai' : tourType;
            if (tour.Loai_tour !== apiTourType) return false;
        }
        if (priceMin && tour.Gia_nguoi_lon < priceMin) return false;
        if (priceMax && tour.Gia_nguoi_lon > priceMax) return false;
        if (destination && (!tour.Diem_den || !tour.Diem_den.toLowerCase().includes(destination))) return false;
        if (status && tour.Tinh_trang !== status) return false;
        if (rating && (!tour.Diem_danh_gia_trung_binh || tour.Diem_danh_gia_trung_binh < rating)) return false;
        if (currentFilter === 'city' && (!tour.Diem_den || tour.Diem_den.length === 0)) return false;
        return true;
    });
}

// Display a single tour card
function displayTour(tour) {
    const tourCard = document.createElement('div');
    tourCard.className = 'col-md-4 mb-4';

    const displayTourType = tour.Loai_tour === 'trong_nuoc' ? 'Trong nước' :
                            tour.Loai_tour === 'nuoc_ngoai' ? 'Nước ngoài' : tour.Loai_tour;

    const soNgay = tour.Thoi_gian || 0;
    const soDem = soNgay > 0 ? soNgay - 1 : 0;
    const durationText = soDem > 0 ? `${soNgay} ngày ${soDem} đêm` : `${soNgay} ngày`;

    let badge = displayTourType;
    // Nếu đang ở filter hot, hiển thị badge Hot
    if (currentFilter === 'hot') badge = '<span class="badge-hot"><i class="fas fa-fire text-danger"></i> Hot</span>';
    // Nếu có trường giảm giá từ backend, hiển thị badge Sale và số tiền giảm
    else if (tour.Gia_tri_khuyen_mai && tour.Gia_nguoi_lon) {
        const giamGia = Math.round((tour.Gia_nguoi_lon * tour.Gia_tri_khuyen_mai) / 100);
        badge = `<span class="badge-sale"><i class="fas fa-tags text-warning"></i> Sale - Giảm ${giamGia.toLocaleString()}đ</span>`;
    }
    else if (tour.Gia_nguoi_lon < tour.Gia_tre_em) badge = '<span class="badge-sale"><i class="fas fa-tags text-warning"></i> Sale</span>';
    else if (tour.Moi) badge = '<span class="badge-new"><i class="fas fa-clock text-info"></i> New</span>';

    let imageUrl = tour.Hinh_anh || '';
    // Nếu không có ảnh, dùng ảnh mặc định (SVG placeholder)
    if (!imageUrl) imageUrl = '/images/default-tour.svg';
    else if (!imageUrl.startsWith('http')) imageUrl = `${CONFIG.IMAGE_URL}/${imageUrl.replace(/^\/+/, '')}`;

    // Tạo thẻ img để lazy-load bằng IntersectionObserver: dùng data-src và lớp lazy-img
    const imgTag = `<img data-src="${imageUrl}" src="/images/default-tour.svg" class="tour-card-image lazy-img blur" alt="${escapeHtml(tour.Ten_tour)}" loading="lazy" onerror="this.onerror=null;this.src='/images/default-tour.svg';">`;

    // Hiển thị giá gốc và giá sale nếu có giảm giá
    let priceHtml = formatCurrency(tour.Gia_nguoi_lon);
    if (tour.Gia_tri_khuyen_mai && tour.Gia_nguoi_lon) {
        const giamGia = Math.round((tour.Gia_nguoi_lon * tour.Gia_tri_khuyen_mai) / 100);
        const giaGoc = tour.Gia_nguoi_lon + giamGia;
        priceHtml = `<span class="price-old">${formatCurrency(giaGoc)}</span> <span class="price-sale">${formatCurrency(tour.Gia_nguoi_lon)}</span>`;
    }

    const icons = `
        ${tour.Bua_an ? '<span class="tour-icon"><i class="fas fa-utensils"></i></span>' : ''}
        ${tour.Huong_dan_vien ? '<span class="tour-icon"><i class="fas fa-user-tie"></i></span>' : ''}
        ${tour.Bao_hiem ? '<span class="tour-icon"><i class="fas fa-shield-alt"></i></span>' : ''}
    `;

    // Kiểm tra trạng thái yêu thích
    const favoriteTours = JSON.parse(localStorage.getItem('favoriteTours') || '[]');
    const isFavorite = favoriteTours.includes(tour.Ma_tour);
    tourCard.innerHTML = `
        <div class="tour-card-modern" tabindex="0" aria-label="${tour.Ten_tour}">
            <div class="tour-card-image-container">
                ${imgTag}
                <div class="tour-card-badge">${badge}</div>
                <button class="favorite-btn${isFavorite ? ' active' : ''}" title="Yêu thích" data-tour-id="${tour.Ma_tour}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="tour-card-content">
                <h3 class="tour-card-title">${tour.Ten_tour}</h3>
                <div class="tour-card-info">
                    <span class="tour-info-item"><i class="fas fa-clock"></i> ${durationText}</span>
                    <span class="tour-info-item"><i class="fas fa-map-marker-alt"></i> ${tour.Diem_den || ''}</span>
                    ${tour.So_cho_con_lai ? `<span class="tour-seat"><i class="fas fa-users"></i> ${tour.So_cho_con_lai} chỗ</span>` : ''}
                    ${icons}
                </div>
                ${getRatingDisplayModern(tour)}
                <a href="detailtour.html?tour=${tour.Ma_tour}" class="tour-card-price-btn">${priceHtml}</a>
            </div>
        </div>
    `;
    // Gắn event cho nút yêu thích
    const favBtn = tourCard.querySelector('.favorite-btn');
    if (favBtn) {
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const tourId = this.getAttribute('data-tour-id');
            let favs = JSON.parse(localStorage.getItem('favoriteTours') || '[]');
            if (favs.includes(tourId)) {
                favs = favs.filter(id => id !== tourId);
                this.classList.remove('active');
                this.setAttribute('aria-pressed', 'false');
                this.setAttribute('aria-label', 'Thêm yêu thích');
                this.innerHTML = '<i class="far fa-heart"></i>';
                showAlert('Đã bỏ khỏi danh sách yêu thích!', 'info');
            } else {
                favs.push(tourId);
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                this.setAttribute('aria-label', 'Bỏ yêu thích');
                this.innerHTML = '<i class="fas fa-heart"></i>';
                showAlert('Đã thêm vào danh sách yêu thích!', 'success');
            }
            localStorage.setItem('favoriteTours', JSON.stringify(favs));
        });
    }
    toursContainer.appendChild(tourCard);
    // Initialize tilt interaction for this card
    const cardEl = tourCard.querySelector('.tour-card-modern');
    if (cardEl) initCardTilt(cardEl);
}

// Reveal images that are not using lazy loading (static examples)
function revealNonLazyImages() {
    document.querySelectorAll('.tour-card-image').forEach(img => {
        if (!img.classList.contains('lazy-img')) {
            img.classList.add('revealed');
            img.classList.remove('blur');
        }
    });
}

// Lightweight 3D tilt for tour cards (per-card)
function initCardTilt(cardEl) {
    if (!cardEl || typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    let rect = null;
    let rafId = null;
    let mouseX = 0, mouseY = 0, tx = 0, ty = 0;

    function onMove(e) {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        mouseX = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        mouseY = (clientY - rect.top) / rect.height - 0.5;
        if (!rafId) rafId = requestAnimationFrame(update);
    }

    function update() {
        tx = mouseX * 8; // rotateY degrees
        ty = -mouseY * 6; // rotateX degrees
        cardEl.style.transform = `translateZ(0px) rotateX(${ty}deg) rotateY(${tx}deg)`;
        rafId = null;
    }

    function onEnter() {
        rect = cardEl.getBoundingClientRect();
        cardEl.style.transition = 'transform 0.12s ease-out, box-shadow 0.12s ease-out';
        cardEl.style.willChange = 'transform';
        cardEl.addEventListener('mousemove', onMove);
        cardEl.addEventListener('touchmove', onMove, { passive: true });
    }

    function onLeave() {
        cardEl.style.transition = 'transform 0.4s cubic-bezier(.2,.9,.3,1)';
        cardEl.style.transform = '';
        cardEl.removeEventListener('mousemove', onMove);
        cardEl.removeEventListener('touchmove', onMove);
    }

    cardEl.addEventListener('mouseenter', onEnter);
    cardEl.addEventListener('focusin', onEnter);
    cardEl.addEventListener('mouseleave', onLeave);
    cardEl.addEventListener('focusout', onLeave);
}

// Escape HTML for alt and labels
function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function (s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]; });
}

// Lazy-load images with IntersectionObserver and reveal animation
function initLazyImages() {
    if (!('IntersectionObserver' in window)) {
        // fallback: reveal all images immediately
        document.querySelectorAll('.lazy-img').forEach(img => {
            if (img.dataset && img.dataset.src) img.src = img.dataset.src;
            img.classList.remove('blur');
            img.classList.add('revealed');
        });
        return;
    }
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const src = img.dataset && img.dataset.src;
            if (src) {
                img.src = src;
                img.addEventListener('load', () => {
                    img.classList.remove('blur');
                    img.classList.add('revealed');
                }, { once: true });
            }
            obs.unobserve(img);
        });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('.lazy-img').forEach(img => io.observe(img));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.toggle('d-none', !show);
    // Skeleton loading
    const skeleton = document.getElementById('skeletonLoading');
    if (skeleton) skeleton.style.display = show ? 'block' : 'none';
}

// Update load more button visibility
function updateLoadMoreButton() {
    if (loadMoreBtn) loadMoreBtn.style.display = hasMore ? 'inline-block' : 'none';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container')?.insertAdjacentElement('afterbegin', alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Sort tours
function sortTours(tours, sortType) {
    const sorted = [...tours];
    if (sortType === 'price-asc') sorted.sort((a, b) => (a.Gia_nguoi_lon || 0) - (b.Gia_nguoi_lon || 0));
    else if (sortType === 'price-desc') sorted.sort((a, b) => (b.Gia_nguoi_lon || 0) - (a.Gia_nguoi_lon || 0));
    return sorted;
}

// Rating display modern
function getRatingDisplayModern(tour) {
    const averageRating = tour.Diem_danh_gia_trung_binh || 0;
    const ratingCount = tour.So_luong_danh_gia || 0;
    const displayRating = ratingCount === 0 ? 5.0 : parseFloat(averageRating).toFixed(1);
    const displayCount = ratingCount === 0 ? 'Chưa có đánh giá' : `${ratingCount} đánh giá`;
    const stars = generateStars(ratingCount === 0 ? 5 : averageRating);
    return `
        <div class="tour-card-rating">
            <span class="rating-number">${displayRating}</span>
            <span class="rating-stars">${stars}</span>
            <span class="rating-count">(${displayCount})</span>
        </div>
    `;
}

// Generate stars HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '<i class="fas fa-star"></i>'.repeat(fullStars) +
           (halfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
           '<i class="far fa-star"></i>'.repeat(emptyStars);
}

// Reset search
function resetSearch() {
    searchInput.value = '';
    tourTypeFilter.value = '';
    searchInput.value = '';
    tourTypeFilter.value = '';
    currentSort = 'default';
    currentPage = 1;
    hasMore = true;
    sortOptions.forEach(opt => opt.classList.remove('active'));
    document.querySelector('.sort-option[data-sort="default"]')?.classList.add('active');
    if (sortBtnText) sortBtnText.textContent = 'Sắp xếp theo...';
    loadTours();
        showLoading(false);
        updateLoadMoreButton();
    }

