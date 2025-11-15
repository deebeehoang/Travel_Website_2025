// Kiểm tra xác thực admin khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra token và quyền admin
    checkAdminAuth().then(isAdmin => {
        if (!isAdmin) {
            window.location.href = '../login.html?redirect=admin';
            return;
        }
        
        // Tải danh sách yêu cầu hủy
        loadCancelRequests();
        
        // Khởi tạo các sự kiện
        initializeEvents();
    });
});

// Khởi tạo sự kiện cho các nút
function initializeEvents() {
    // Sự kiện xác nhận từ chối
    document.getElementById('confirm-reject').addEventListener('click', handleRejectRequest);
    
    // Sự kiện xác nhận chấp nhận
    document.getElementById('confirm-accept').addEventListener('click', handleAcceptRequest);
}

// Tải danh sách yêu cầu hủy tour
function loadCancelRequests() {
    const token = getToken();
    
    fetch(`${API_URL}/api/cancel-requests`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải danh sách yêu cầu hủy');
        }
        return response.json();
    })
    .then(data => {
        console.log('Dữ liệu yêu cầu hủy:', data);
        
        // Ẩn loading spinner
        document.getElementById('loading-spinner').classList.add('d-none');
        
        if (!data.data || !data.data.requests || data.data.requests.length === 0) {
            // Hiển thị thông báo không có yêu cầu
            document.getElementById('no-requests').classList.remove('d-none');
        } else {
            // Hiển thị bảng yêu cầu hủy
            displayCancelRequestsTable(data.data.requests);
            document.getElementById('cancel-requests-table').classList.remove('d-none');
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải danh sách yêu cầu hủy:', error);
        
        // Ẩn loading spinner
        document.getElementById('loading-spinner').classList.add('d-none');
        
        // Hiển thị thông báo lỗi
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải danh sách yêu cầu hủy. Vui lòng thử lại sau.'
        });
    });
}

// Hiển thị bảng yêu cầu hủy tour
function displayCancelRequestsTable(requests) {
    const tableBody = document.querySelector('#cancel-requests-table tbody');
    tableBody.innerHTML = '';
    
    requests.forEach(request => {
        // Format ngày
        const requestDate = new Date(request.Ngay_yeu_cau).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Xác định trạng thái và badge class
        let statusBadge = '';
        let statusText = '';
        
        switch(request.Trang_thai) {
            case 'Dang_xu_ly':
                statusBadge = 'status-pending';
                statusText = 'Đang xử lý';
                break;
            case 'Da_chap_nhan':
                statusBadge = 'status-accepted';
                statusText = 'Đã chấp nhận';
                break;
            case 'Da_tu_choi':
                statusBadge = 'status-rejected';
                statusText = 'Đã từ chối';
                break;
            default:
                statusBadge = '';
                statusText = request.Trang_thai;
        }
        
        // Xác định các nút thao tác dựa vào trạng thái
        let actionButtons = `
            <div class="action-buttons">
                <button class="btn btn-sm btn-primary view-btn" 
                    onclick="viewRequestDetails('${request.Ma_yeu_cau}')">
                    <i class="fas fa-eye"></i> Xem
                </button>
        `;
        
        // Chỉ hiển thị nút xử lý nếu đang ở trạng thái đang xử lý
        if (request.Trang_thai === 'Dang_xu_ly') {
            actionButtons += `
                <button class="btn btn-sm btn-success accept-btn" 
                    onclick="openAcceptModal('${request.Ma_yeu_cau}')">
                    <i class="fas fa-check"></i> Chấp nhận
                </button>
                <button class="btn btn-sm btn-danger reject-btn" 
                    onclick="openRejectModal('${request.Ma_yeu_cau}')">
                    <i class="fas fa-ban"></i> Từ chối
                </button>
            `;
        }
        
        actionButtons += `</div>`;
        
        // Tạo hàng mới
        const row = `
            <tr>
                <td>${request.Ma_yeu_cau}</td>
                <td>${request.Ten_khach_hang || 'N/A'}</td>
                <td>${request.Ten_tour || 'N/A'}</td>
                <td>${requestDate}</td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
                <td>${actionButtons}</td>
            </tr>
        `;
        
        tableBody.innerHTML += row;
    });
    
    // Khởi tạo DataTable
    if ($.fn.DataTable.isDataTable('#cancel-requests-table')) {
        $('#cancel-requests-table').DataTable().destroy();
    }
    
    $('#cancel-requests-table').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/vi.json'
        },
        order: [[3, 'desc']], // Sắp xếp theo ngày mới nhất
        responsive: true
    });
}

// Xem chi tiết yêu cầu hủy
function viewRequestDetails(requestId) {
    const token = getToken();
    
    // Hiển thị loading
    document.getElementById('request-detail-loading').classList.remove('d-none');
    document.getElementById('request-details').classList.add('d-none');
    document.querySelector('.action-buttons-detail').classList.add('d-none');
    
    // Mở modal
    const viewModal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
    viewModal.show();
    
    // Tải thông tin chi tiết
    fetch(`${API_URL}/api/cancel-requests/${requestId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải thông tin chi tiết yêu cầu hủy');
        }
        return response.json();
    })
    .then(data => {
        console.log('Chi tiết yêu cầu hủy:', data);
        
        if (data.status === 'success' && data.data && data.data.request) {
            // Hiển thị chi tiết
            displayRequestDetails(data.data.request);
            
            // Hiển thị nút thao tác nếu yêu cầu đang ở trạng thái xử lý
            if (data.data.request.Trang_thai === 'Dang_xu_ly') {
                const actionButtons = document.querySelector('.action-buttons-detail');
                actionButtons.classList.remove('d-none');
                
                // Cập nhật ID yêu cầu cho các nút
                document.querySelector('.accept-btn').dataset.requestId = requestId;
                document.querySelector('.reject-btn').dataset.requestId = requestId;
                
                // Thêm sự kiện cho các nút
                document.querySelector('.accept-btn').onclick = () => openAcceptModal(requestId);
                document.querySelector('.reject-btn').onclick = () => openRejectModal(requestId);
            }
        } else {
            throw new Error('Dữ liệu không hợp lệ');
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải chi tiết yêu cầu hủy:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải thông tin chi tiết yêu cầu hủy. Vui lòng thử lại sau.'
        });
        
        // Đóng modal
        bootstrap.Modal.getInstance(document.getElementById('viewRequestModal')).hide();
    })
    .finally(() => {
        // Ẩn loading
        document.getElementById('request-detail-loading').classList.add('d-none');
    });
}

// Hiển thị chi tiết yêu cầu hủy
function displayRequestDetails(request) {
    // Format ngày
    const requestDate = new Date(request.Ngay_yeu_cau).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const tourDates = request.Ngay_bat_dau && request.Ngay_ket_thuc 
        ? `${new Date(request.Ngay_bat_dau).toLocaleDateString('vi-VN')} - ${new Date(request.Ngay_ket_thuc).toLocaleDateString('vi-VN')}` 
        : 'Không có thông tin';
    
    let processDate = 'Chưa xử lý';
    if (request.Ngay_xu_ly) {
        processDate = new Date(request.Ngay_xu_ly).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Xác định trạng thái và màu sắc
    let statusClass = '';
    let statusText = '';
    
    switch(request.Trang_thai) {
        case 'Dang_xu_ly':
            statusClass = 'bg-warning text-dark';
            statusText = 'Đang xử lý';
            break;
        case 'Da_chap_nhan':
            statusClass = 'bg-success text-white';
            statusText = 'Đã chấp nhận';
            break;
        case 'Da_tu_choi':
            statusClass = 'bg-danger text-white';
            statusText = 'Đã từ chối';
            break;
        default:
            statusClass = 'bg-secondary text-white';
            statusText = request.Trang_thai;
    }
    
    // Format tiền tệ
    const totalAmount = request.Tong_tien 
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.Tong_tien)
        : 'Không có thông tin';
    
    // Tạo HTML cho chi tiết yêu cầu
    const detailsContent = `
        <div class="row mb-4">
            <div class="col-12 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Thông tin yêu cầu hủy</h5>
                    <span class="badge ${statusClass} px-3 py-2">${statusText}</span>
                </div>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Mã yêu cầu:</h6>
                <p class="mb-0">${request.Ma_yeu_cau}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Ngày yêu cầu:</h6>
                <p class="mb-0">${requestDate}</p>
            </div>
            
            <div class="col-12 mb-3">
                <h6 class="text-muted mb-1">Lý do hủy:</h6>
                <p class="mb-0">${request.Ly_do || 'Không có lý do'}</p>
            </div>
            
            ${request.Trang_thai !== 'Dang_xu_ly' ? `
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Ngày xử lý:</h6>
                <p class="mb-0">${processDate}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Admin xử lý:</h6>
                <p class="mb-0">${request.Id_admin || 'Không có thông tin'}</p>
            </div>
            ` : ''}
            
            ${request.Trang_thai === 'Da_tu_choi' ? `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h6 class="text-danger mb-1">Lý do từ chối:</h6>
                    <p class="mb-0">${request.Ly_do_tu_choi || 'Không có lý do từ chối'}</p>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="row mb-4">
            <div class="col-12 mb-3">
                <h5>Thông tin tour</h5>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Mã booking:</h6>
                <p class="mb-0">${request.Ma_booking}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Tên tour:</h6>
                <p class="mb-0">${request.Ten_tour || 'Không có thông tin'}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Lịch trình:</h6>
                <p class="mb-0">${tourDates}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Tổng tiền:</h6>
                <p class="mb-0">${totalAmount}</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12 mb-3">
                <h5>Thông tin khách hàng</h5>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Mã khách hàng:</h6>
                <p class="mb-0">${request.Ma_khach_hang || 'Không có thông tin'}</p>
            </div>
            
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-1">Tên khách hàng:</h6>
                <p class="mb-0">${request.Ten_khach_hang || 'Không có thông tin'}</p>
            </div>
        </div>
    `;
    
    // Hiển thị thông tin
    document.getElementById('request-details').innerHTML = detailsContent;
    document.getElementById('request-details').classList.remove('d-none');
}

// Mở modal xác nhận chấp nhận yêu cầu
function openAcceptModal(requestId) {
    // Đóng modal chi tiết nếu đang mở
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewRequestModal'));
    if (viewModal) {
        viewModal.hide();
    }
    
    // Cập nhật ID yêu cầu
    document.getElementById('accept-request-id').value = requestId;
    
    // Mở modal xác nhận
    const acceptModal = new bootstrap.Modal(document.getElementById('acceptModal'));
    acceptModal.show();
}

// Mở modal từ chối yêu cầu
function openRejectModal(requestId) {
    // Đóng modal chi tiết nếu đang mở
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewRequestModal'));
    if (viewModal) {
        viewModal.hide();
    }
    
    // Cập nhật ID yêu cầu và xóa nội dung
    document.getElementById('reject-request-id').value = requestId;
    document.getElementById('reject-reason').value = '';
    
    // Mở modal từ chối
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
}

// Xử lý chấp nhận yêu cầu hủy
function handleAcceptRequest() {
    const token = getToken();
    const requestId = document.getElementById('accept-request-id').value;
    
    // Hiển thị loading trong nút
    const confirmButton = document.getElementById('confirm-accept');
    const originalContent = confirmButton.innerHTML;
    confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
    confirmButton.disabled = true;
    
    fetch(`${API_URL}/api/cancel-requests/${requestId}/process`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'accept'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể xử lý yêu cầu');
        }
        return response.json();
    })
    .then(data => {
        console.log('Kết quả xử lý yêu cầu:', data);
        
        // Đóng modal
        bootstrap.Modal.getInstance(document.getElementById('acceptModal')).hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã chấp nhận yêu cầu hủy tour thành công'
        }).then(() => {
            // Tải lại danh sách yêu cầu
            loadCancelRequests();
        });
    })
    .catch(error => {
        console.error('Lỗi khi xử lý yêu cầu hủy:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xử lý yêu cầu hủy tour. Vui lòng thử lại sau.'
        });
    })
    .finally(() => {
        // Khôi phục nút
        confirmButton.innerHTML = originalContent;
        confirmButton.disabled = false;
    });
}

// Xử lý từ chối yêu cầu hủy
function handleRejectRequest() {
    const token = getToken();
    const requestId = document.getElementById('reject-request-id').value;
    const rejectReason = document.getElementById('reject-reason').value.trim();
    
    if (!rejectReason) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin',
            text: 'Vui lòng nhập lý do từ chối yêu cầu'
        });
        return;
    }
    
    // Hiển thị loading trong nút
    const confirmButton = document.getElementById('confirm-reject');
    const originalContent = confirmButton.innerHTML;
    confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...';
    confirmButton.disabled = true;
    
    fetch(`${API_URL}/api/cancel-requests/${requestId}/process`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'reject',
            Ly_do_tu_choi: rejectReason
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể xử lý yêu cầu');
        }
        return response.json();
    })
    .then(data => {
        console.log('Kết quả xử lý yêu cầu:', data);
        
        // Đóng modal
        bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
        
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã từ chối yêu cầu hủy tour thành công'
        }).then(() => {
            // Tải lại danh sách yêu cầu
            loadCancelRequests();
        });
    })
    .catch(error => {
        console.error('Lỗi khi xử lý yêu cầu hủy:', error);
        
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xử lý yêu cầu hủy tour. Vui lòng thử lại sau.'
        });
    })
    .finally(() => {
        // Khôi phục nút
        confirmButton.innerHTML = originalContent;
        confirmButton.disabled = false;
    });
} 