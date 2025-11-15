// Xử lý header scroll effect
function initializeHeaderScroll() {
    const header = document.querySelector('header.navbar');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
}

// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function () {
    // Khởi tạo header scroll effect
    initializeHeaderScroll();

    // Theo dõi sự thay đổi của DOM để xử lý header được tải động
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const header = document.querySelector('header.navbar');
                if (header) {
                    initializeHeaderScroll();
                    observer.disconnect(); // Dừng theo dõi khi đã tìm thấy header
                }
            }
        });
    });

    // Bắt đầu theo dõi thay đổi của DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});