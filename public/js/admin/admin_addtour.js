$(document).ready(function() {
    // Khởi tạo Summernote cho textarea mô tả
    $('#mo_ta').summernote({
        height: 300,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'picture']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ],
        placeholder: 'Nhập mô tả chi tiết lịch trình tour...',
        callbacks: {
            onImageUpload: function(files) {
                // Xử lý upload hình ảnh nếu cần
                console.log('Image upload:', files);
            }
        }
    });

    // Xử lý preview hình ảnh
    $('input[name="hinh_anh"]').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#preview-image')
                    .attr('src', e.target.result)
                    .show();
            };
            reader.readAsDataURL(file);
        }
    });

    // Kiểm tra xem có phải đang chỉnh sửa tour không
    const urlParams = new URLSearchParams(window.location.search);
    const editTourId = urlParams.get('edit');
    
    if (editTourId) {
        // Cập nhật UI cho chế độ chỉnh sửa
        $('#pageTitle').text('Chỉnh Sửa Tour Du Lịch');
        $('#submitBtn').text('Cập Nhật Tour');
        
        // Lấy dữ liệu tour từ localStorage
        try {
            const tourDataString = localStorage.getItem('editTourData');
            console.log('Dữ liệu tour từ localStorage:', tourDataString);
            
            if (!tourDataString) {
                throw new Error('Không tìm thấy dữ liệu tour trong localStorage');
            }
            
            const tourData = JSON.parse(tourDataString);
            console.log('Dữ liệu tour sau khi parse:', tourData);
            
            // Kiểm tra và lấy dữ liệu tour từ đúng cấu trúc
            const tour = tourData.tour || tourData;
            console.log('Dữ liệu tour được sử dụng:', tour);
            
            // Điền dữ liệu vào form với xử lý dự phòng
            // Sử dụng nullish coalescing để lấy giá trị đầu tiên khác null/undefined
            $('#ma_tour').val(tour.Ma_tour || tour.ma_tour || '').prop('disabled', true);
            $('#ten_tour').val(tour.Ten_tour || tour.ten_tour || '');
            $('#thoi_gian').val(tour.Thoi_gian || tour.thoi_gian || '');
            
            // Đảm bảo giá trị select được chọn đúng
            const tinhTrang = tour.Tinh_trang || tour.tinh_trang || 'Còn chỗ';
            $('#tinh_trang').val(tinhTrang);
            
            const loaiTour = tour.Loai_tour || tour.loai_tour || 'trong_nuoc';
            $('#loai_tour').val(loaiTour);
            
            // Định dạng giá tiền
            const giaNguoiLon = tour.Gia_nguoi_lon || tour.gia_nguoi_lon || 0;
            $('#gia_nguoi_lon').val(giaNguoiLon);
            
            const giaTreEm = tour.Gia_tre_em || tour.gia_tre_em || 0;
            $('#gia_tre_em').val(giaTreEm);
            
            // Hiển thị hình ảnh nếu có
            const hinhAnh = tour.Hinh_anh || tour.hinh_anh;
            if (hinhAnh) {
                $('#preview-image')
                    .attr('src', hinhAnh)
                    .show();
                console.log('Hiển thị hình ảnh:', hinhAnh);
            } else {
                console.log('Không có hình ảnh để hiển thị');
            }
            
            // Điền mô tả vào Summernote
            const moTa = tour.Mo_ta || tour.mo_ta || '';
            $('#mo_ta').summernote('code', moTa);
            console.log('Nội dung mô tả:', moTa ? (moTa.length > 50 ? moTa.substring(0, 50) + '...' : moTa) : 'Không có');
            
            // Log trạng thái form sau khi điền dữ liệu
            console.log('Form đã được điền dữ liệu:', {
                maTour: $('#ma_tour').val(),
                tenTour: $('#ten_tour').val(),
                thoiGian: $('#thoi_gian').val(),
                tinhTrang: $('#tinh_trang').val(),
                loaiTour: $('#loai_tour').val(),
                giaNguoiLon: $('#gia_nguoi_lon').val(),
                giaTreEm: $('#gia_tre_em').val(),
                hinhAnh: $('#preview-image').attr('src'),
                moTa: $('#mo_ta').summernote('code').length > 50 ? 
                      $('#mo_ta').summernote('code').substring(0, 50) + '...' : 
                      $('#mo_ta').summernote('code')
            });
        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu tour để chỉnh sửa:', error);
            alert('Không thể tải dữ liệu tour để chỉnh sửa. Lỗi: ' + error.message);
        }
    }
    
    // Load danh sách địa danh và lịch khởi hành
    loadDiaDanh().then(() => {
        if (editTourId) {
            // Nếu đang chỉnh sửa, đánh dấu các địa danh đã chọn
            const tourData = JSON.parse(localStorage.getItem('editTourData'));
            if (tourData && tourData.Dia_danh) {
                tourData.Dia_danh.forEach(dd => {
                    $(`#dd-${dd.Ma_dia_danh || dd.ma_dia_danh}`).prop('checked', true);
                });
            }
        }
    });
    
    loadLichKhoiHanh().then(() => {
        if (editTourId) {
            // Nếu đang chỉnh sửa tour, đánh dấu lịch khởi hành đã chọn
            const tourData = JSON.parse(localStorage.getItem('editTourData'));
            if (tourData && tourData.Lich_khoi_hanh) {
                const maLich = tourData.Lich_khoi_hanh.Ma_lich || tourData.Lich_khoi_hanh.ma_lich;
                $(`#lich-${maLich}`).prop('checked', true);
            }
        }
    });

    // Xử lý submit form
    $('#addTourForm').submit(async function(e) {
        e.preventDefault();
        
        // Kiểm tra xem đang chỉnh sửa hay tạo mới
        const urlParams = new URLSearchParams(window.location.search);
        const isEditMode = urlParams.get('edit') ? true : false;
        const editTourId = urlParams.get('edit');
        
        console.log(`=== BẮT ĐẦU QUY TRÌNH ${isEditMode ? 'CẬP NHẬT' : 'LƯU'} TOUR ===`);
        console.log('Form được submit tại:', new Date().toLocaleString());
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
            }
            console.log('Token hợp lệ, tiếp tục quy trình...');

            // 1. Thu thập dữ liệu từ form
            console.log('1. Thu thập dữ liệu form:');
            const formData = {
                ma_tour: $('#ma_tour').val().trim(),
                ten_tour: $('#ten_tour').val().trim(),
                thoi_gian: $('#thoi_gian').val(),
                tinh_trang: $('#tinh_trang').val(),
                gia_nguoi_lon: $('#gia_nguoi_lon').val(),
                gia_tre_em: $('#gia_tre_em').val(),
                loai_tour: $('#loai_tour').val(),
                mo_ta: $('#mo_ta').summernote('code'),
                hinh_anh: $('input[name="hinh_anh"]')[0].files[0]
            };
            console.log('Dữ liệu form:', formData);

            // Kết quả của từng bước
            const results = {
                tour: null,
                diaDanh: null,
                lichKhoiHanh: null
            };

            // 2. Tạo hoặc cập nhật tour cơ bản (bao gồm cả upload hình ảnh)
            console.log(`2. Bắt đầu ${isEditMode ? 'cập nhật' : 'tạo'} tour...`);
            try {
                const tourData = await createTour();
                console.log(`Tour đã được ${isEditMode ? 'cập nhật' : 'tạo'}:`, tourData);
                
                if (!tourData || !tourData.Ma_tour) {
                    console.error('Dữ liệu tour không hợp lệ:', tourData);
                    throw new Error(`Không nhận được thông tin tour sau khi ${isEditMode ? 'cập nhật' : 'tạo'}`);
                }

                results.tour = tourData;
                const maTour = tourData.Ma_tour;
                console.log('Mã tour:', maTour);
                
                // 3. Thêm địa danh cho tour
                console.log('3. Thêm địa danh cho tour...');
                try {
                    const diaDanhResult = await addDiaDanhToTour(maTour);
                    console.log('Kết quả thêm địa danh:', diaDanhResult);
                    results.diaDanh = diaDanhResult;
                } catch (diaDanhError) {
                    console.error('Lỗi khi thêm địa danh:', diaDanhError);
                    console.warn('Tiếp tục quy trình mặc dù có lỗi khi thêm địa danh');
                    results.diaDanh = { status: 'error', message: diaDanhError.message };
                }

                // 4. Thêm lịch khởi hành
                console.log('4. Tạo lịch khởi hành...');
                const scheduleData = localStorage.getItem('newScheduleData');
                if (scheduleData) {
                    try {
                        const scheduleResult = await createScheduleAfterTour(maTour);
                        console.log('Kết quả tạo lịch khởi hành:', scheduleResult);
                        results.lichKhoiHanh = scheduleResult;
                    } catch (scheduleError) {
                        console.error('Lỗi khi tạo lịch khởi hành:', scheduleError);
                        console.warn('Tiếp tục quy trình mặc dù có lỗi khi tạo lịch khởi hành');
                        results.lichKhoiHanh = { status: 'error', message: scheduleError.message };
                    }
                } else {
                    console.log('Không có lịch khởi hành mới cần tạo');
                    results.lichKhoiHanh = { status: 'warning', message: 'Không có lịch khởi hành' };
                }

                // 5. Hoàn thành
                console.log(`=== HOÀN THÀNH QUY TRÌNH ${isEditMode ? 'CẬP NHẬT' : 'LƯU'} TOUR ===`);
                console.log('Kết quả tổng thể:', results);
                
                // Tạo thông báo tổng hợp
                let summaryMessage = isEditMode 
                    ? `Đã cập nhật tour ${tourData.Ten_tour || maTour} thành công!\n` 
                    : `Đã tạo tour ${tourData.Ten_tour || maTour} thành công!\n`;
                
                if (results.diaDanh && results.diaDanh.status === 'success') {
                    summaryMessage += `- Đã thêm địa danh: ${results.diaDanh.message || 'Thành công'}\n`;
                } else if (results.diaDanh && results.diaDanh.status === 'error') {
                    summaryMessage += `- Địa danh: ${results.diaDanh.message || 'Có lỗi'}\n`;
                }
                
                if (results.lichKhoiHanh && results.lichKhoiHanh.status === 'success') {
                    summaryMessage += `- Lịch khởi hành: ${results.lichKhoiHanh.message || 'Thành công'}\n`;
                } else if (results.lichKhoiHanh && results.lichKhoiHanh.status === 'error') {
                    summaryMessage += `- Lịch khởi hành: ${results.lichKhoiHanh.message || 'Có lỗi'}\n`;
                }
                
                alert(summaryMessage);
                
                // Xóa dữ liệu tạm
                if (isEditMode) {
                    localStorage.removeItem('editTourData');
                }
                localStorage.removeItem('newScheduleData');
                
                // 6. Chuyển hướng
                console.log('Chuyển hướng về trang quản lý tour...');
                window.location.href = 'admin.html#tours';
            } catch (tourError) {
                console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} tour cơ bản:`, tourError);
                throw tourError; // Lỗi tạo tour là nghiêm trọng, dừng toàn bộ quy trình
            }
        } catch (error) {
            console.error(`=== LỖI TRONG QUY TRÌNH ${isEditMode ? 'CẬP NHẬT' : 'LƯU'} TOUR ===`);
            console.error('Chi tiết lỗi:', error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    });

    // ===== Khuyến mãi theo tour =====
    function computePromo(base, percent) {
        base = parseFloat(base||'0'); percent = parseFloat(percent||'0');
        if (isNaN(base) || isNaN(percent)) return 0;
        return Math.max(0, Math.round(base * (1 - percent/100)));
    }

    function refreshPricePreview() {
        const base = parseFloat($('#gia_nguoi_lon').val()||'0');
        const percent = parseFloat($('#promo_percent').val()||'0');
        $('#priceBasePreview').text(new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(base));
        const promo = computePromo(base, percent);
        $('#pricePromoPreview').text(new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(promo));
    }
    $('#gia_nguoi_lon, #promo_percent').on('input', refreshPricePreview);
    refreshPricePreview();

    async function postJson(url, body) {
        const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    $('#btnSaveTourPromo').on('click', async function(){
        try{
            const maTour = ($('#ma_tour').val()||'').trim();
            const code = ($('#promo_ma_km').val()||'').trim();
            const percent = parseFloat($('#promo_percent').val()||'0');
            const start = $('#promo_start').val()||null;
            const end = $('#promo_end').val()||null;
            if (!maTour) return alert('Chưa có Mã tour');
            if (!code) return alert('Nhập mã coupon');
            if (isNaN(percent) || percent<=0 || percent>100) return alert('% coupon không hợp lệ');
            // 1) Lưu/cập nhật coupon
            await postJson('/api/promotions/coupon', { Ma_km: code, Gia_tri: percent, Ngay_bat_dau: start, Ngay_ket_thuc: end });
            // 2) Gắn coupon vào tour
            await postJson('/api/promotions/attach-to-tour', { Ma_tour: maTour, Ma_km: code });
            alert('Đã lưu khuyến mãi cho tour');
        }catch(err){
            alert('Lỗi lưu khuyến mãi: '+err.message);
        }
    });

    // Thêm nút tạo lịch khởi hành mới
    const container = $('#lichkhoihanh-container');
    container.append(`
        <div class="mb-3">
            <button type="button" class="btn btn-primary" id="btnAddNewSchedule">
                <i class="fas fa-plus"></i> Tạo lịch khởi hành mới
            </button>
        </div>
    `);

    // Thêm modal tạo lịch khởi hành
    $('body').append(`
        <div class="modal fade" id="addScheduleModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Tạo lịch khởi hành mới</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addScheduleForm">
                            <div class="mb-3">
                                <label class="form-label">Mã lịch</label>
                                <input type="text" class="form-control" name="ma_lich" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Ngày bắt đầu</label>
                                <input type="date" class="form-control" name="ngay_bat_dau" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Ngày kết thúc</label>
                                <input type="date" class="form-control" name="ngay_ket_thuc" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Số chỗ</label>
                                <input type="number" class="form-control" name="so_cho" required min="1">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="btnSaveSchedule">Lưu</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    // Xử lý sự kiện click nút tạo lịch khởi hành
    $(document).on('click', '#btnAddNewSchedule', function() {
        const modal = new bootstrap.Modal(document.getElementById('addScheduleModal'));
        modal.show();
    });

    // Xử lý sự kiện lưu lịch khởi hành
    $('#btnSaveSchedule').click(function() {
        try {
            // Kiểm tra token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
            }

            // Lấy giá trị trực tiếp từ form
            const maLich = $('#schedule_ma_lich').val().trim();
            const ngayBatDau = $('#schedule_ngay_bat_dau').val().trim();
            const ngayKetThuc = $('#schedule_ngay_ket_thuc').val().trim();
            const soCho = $('#schedule_so_cho').val().trim();
            
            console.log('Form elements:', {
                maLich: $('#schedule_ma_lich'),
                ngayBatDau: $('#schedule_ngay_bat_dau'),
                ngayKetThuc: $('#schedule_ngay_ket_thuc'),
                soCho: $('#schedule_so_cho')
            });

            // Debug: In ra các giá trị
            console.log('Giá trị form:', {
                maLich,
                ngayBatDau,
                ngayKetThuc,
                soCho
            });

            // Kiểm tra từng trường
            const errors = [];
            if (!maLich) errors.push('Vui lòng nhập mã lịch khởi hành');
            if (!ngayBatDau) errors.push('Vui lòng chọn ngày bắt đầu');
            if (!ngayKetThuc) errors.push('Vui lòng chọn ngày kết thúc');
            if (!soCho) errors.push('Vui lòng nhập số chỗ');

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            const formData = {
                ma_lich: maLich,
                ngay_bat_dau: ngayBatDau,
                ngay_ket_thuc: ngayKetThuc,
                so_cho: parseInt(soCho)
            };

            // Validate ngày
            const startDate = new Date(formData.ngay_bat_dau);
            const endDate = new Date(formData.ngay_ket_thuc);
            if (endDate < startDate) {
                throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
            }

            // Validate số chỗ
            if (isNaN(formData.so_cho) || formData.so_cho <= 0) {
                throw new Error('Số chỗ phải là số dương');
            }

            // Validate mã lịch
            if (!/^[A-Za-z0-9]+$/.test(formData.ma_lich)) {
                throw new Error('Mã lịch chỉ được chứa chữ cái và số');
            }

            console.log('Dữ liệu gửi đi:', formData);

            // Lưu thông tin lịch khởi hành vào localStorage để sử dụng sau khi tạo tour
            localStorage.setItem('newScheduleData', JSON.stringify(formData));

            // Thêm lịch khởi hành vào danh sách tạm thời
            const schedulesList = $('#schedulesList');
            const newScheduleHtml = `
                <div class="card mb-3" id="schedule-temp-${formData.ma_lich}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title">Lịch khởi hành: ${formData.ma_lich}</h5>
                                <p class="card-text">
                                    Từ: ${formData.ngay_bat_dau} đến: ${formData.ngay_ket_thuc}<br>
                                    Số chỗ: ${formData.so_cho}
                                </p>
                            </div>
                            <div>
                                <span class="badge bg-success">Mới</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Thêm vào danh sách hoặc hiển thị nếu trống
            if (schedulesList.children().length === 0 || schedulesList.find('.alert').length > 0) {
                schedulesList.html(newScheduleHtml);
            } else {
                schedulesList.append(newScheduleHtml);
            }

            // Đóng modal sau khi tạo thành công
            const modal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
            if (modal) {
                modal.hide();
            }

            // Xóa dữ liệu trong form sau khi lưu
            document.getElementById('addScheduleForm').reset();

            // Hiển thị thông báo
            alert(`Đã tạo lịch khởi hành ${formData.ma_lich}. Lịch này sẽ được lưu khi bạn lưu tour.`);
        } catch (error) {
            console.error('Lỗi khi tạo lịch khởi hành:', error);
            alert('Lỗi: ' + error.message);
        }
    });

    // Thêm sự kiện để kiểm tra giá trị khi người dùng nhập
    $(document).ready(function() {
        // Theo dõi sự kiện input trong modal
        $('#addScheduleModal').on('input', 'input', function() {
            const fieldName = $(this).attr('name');
            const value = $(this).val();
            console.log(`Giá trị ${fieldName} thay đổi:`, value);
        });

        // Theo dõi khi modal được mở
        $('#addScheduleModal').on('shown.bs.modal', function () {
            console.log('Modal đã được mở');
            console.log('Form elements:', {
                maLich: document.querySelector('#addScheduleModal input[name="ma_lich"]'),
                ngayBatDau: document.querySelector('#addScheduleModal input[name="ngay_bat_dau"]'),
                ngayKetThuc: document.querySelector('#addScheduleModal input[name="ngay_ket_thuc"]'),
                soCho: document.querySelector('#addScheduleModal input[name="so_cho"]')
            });
        });
    });
});

// Hàm load danh sách địa danh
async function loadDiaDanh() {
    try {
        console.log('Đang gọi API lấy danh sách địa danh...');
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
        }

        const response = await fetch('http://localhost:5000/api/destinations', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('API trả về lỗi:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Chi tiết lỗi:', errorText);
            throw new Error('Không thể tải danh sách địa danh');
        }
        
        const result = await response.json();
        console.log('Dữ liệu địa danh:', result);
        
        // Đảm bảo lấy đúng mảng địa danh từ cấu trúc API response
        const diaDanh = result.data.destinations || [];
        
        const container = $('#diadanh-container');
        container.empty();
        
        if (diaDanh.length === 0) {
            container.html(`
                <div class="alert alert-info">
                    Chưa có địa danh nào trong hệ thống. 
                    <a href="admin.html#destinations" class="alert-link">Nhấn vào đây</a> để thêm địa danh mới.
                </div>
            `);
            return;
        }

        // Tạo container cho grid
        container.append('<div class="row"></div>');
        const gridContainer = container.find('.row');
        
        diaDanh.forEach((dd) => {
            const maDiaDanh = dd.Ma_dia_danh || dd.ma_dia_danh;
            const tenDiaDanh = dd.Ten_dia_danh || dd.ten_dia_danh;
            const moTa = dd.Mo_ta || dd.mo_ta || '';
            let hinhAnh = dd.Hinh_anh || dd.hinh_anh;

            // Xử lý URL hình ảnh
            if (!hinhAnh || hinhAnh.trim() === '') {
                hinhAnh = '/images/destination-placeholder.jpg';
            } else if (!hinhAnh.startsWith('http') && !hinhAnh.startsWith('/')) {
                hinhAnh = '/images/uploads/destination/' + hinhAnh;
            }

            gridContainer.append(`
                <div class="col-md-4 mb-3">
                    <div class="card h-100">
                        <img src="${hinhAnh}" 
                             class="card-img-top" 
                             alt="${tenDiaDanh}"
                             style="height: 150px; object-fit: cover;"
                             onerror="this.src='/images/destination-placeholder.jpg'">
                        <div class="card-body">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" 
                                       name="dia_danh" value="${maDiaDanh}" 
                                       id="dd-${maDiaDanh}">
                                <label class="form-check-label" for="dd-${maDiaDanh}">
                                    <h6 class="card-title mb-0">${tenDiaDanh}</h6>
                                </label>
                            </div>
                            <p class="card-text small text-muted mt-2">
                                ${moTa.length > 100 ? moTa.substring(0, 100) + '...' : moTa}
                            </p>
                        </div>
                    </div>
                </div>
            `);
        });

        // Thêm nút chọn tất cả/bỏ chọn tất cả
        container.prepend(`
            <div class="mb-3">
                <button type="button" class="btn btn-outline-primary me-2" id="btnSelectAllDestinations">
                    <i class="fas fa-check-square"></i> Chọn tất cả
                </button>
                <button type="button" class="btn btn-outline-secondary" id="btnUnselectAllDestinations">
                    <i class="fas fa-square"></i> Bỏ chọn tất cả
                </button>
            </div>
        `);

        // Xử lý sự kiện cho các nút chọn/bỏ chọn tất cả
        $('#btnSelectAllDestinations').click(function() {
            $('input[name="dia_danh"]').prop('checked', true);
        });

        $('#btnUnselectAllDestinations').click(function() {
            $('input[name="dia_danh"]').prop('checked', false);
        });

    } catch (error) {
        console.error('Lỗi load địa danh:', error);
        if (error.message.includes('đăng nhập lại')) {
            window.location.href = '/login.html';
        } else {
            $('#diadanh-container').html(`
                <div class="alert alert-danger">
                    ${error.message}
                    <br/>
                    <small>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</small>
                </div>
            `);
        }
    }
}

// Hàm load danh sách lịch khởi hành
async function loadLichKhoiHanh() {
    try {
        const container = $('#lichkhoihanh-container');
        container.empty();

        // Thêm nút tạo lịch khởi hành mới
        container.append(`
            <div class="mb-3">
                <button type="button" class="btn btn-primary" id="btnAddNewSchedule">
                    <i class="fas fa-plus"></i> Tạo lịch khởi hành mới
                </button>
            </div>
            <div id="schedulesList"></div>
        `);

        // Nếu đang chỉnh sửa tour, load danh sách lịch khởi hành hiện có
        const urlParams = new URLSearchParams(window.location.search);
        const editTourId = urlParams.get('edit');
        if (editTourId) {
            console.log('Đang gọi API lấy danh sách lịch khởi hành của tour...');
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
            }

            const response = await fetch(`http://localhost:5000/api/tours/${editTourId}/upcoming-schedules`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách lịch khởi hành');
            }

            const result = await response.json();
            const schedules = result.data.schedules || [];

            const schedulesList = $('#schedulesList');
            if (schedules.length === 0) {
                schedulesList.html('<div class="alert alert-info">Chưa có lịch khởi hành nào</div>');
                return;
            }

            schedules.forEach(lich => {
                const ngayBatDau = new Date(lich.Ngay_bat_dau || lich.ngay_bat_dau).toLocaleDateString('vi-VN');
                const ngayKetThuc = new Date(lich.Ngay_ket_thuc || lich.ngay_ket_thuc).toLocaleDateString('vi-VN');
                const maLich = lich.Ma_lich || lich.ma_lich;
                const soCho = lich.So_cho || lich.so_cho;

                schedulesList.append(`
                    <div class="form-check mb-3 border-bottom pb-2" id="schedule-item-${maLich}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <input class="form-check-input" type="radio" 
                                   name="lich_khoi_hanh" value="${maLich}" 
                                   id="lich-${maLich}" required>
                                <label class="form-check-label" for="lich-${maLich}">
                                    <strong>Mã lịch: ${maLich}</strong>
                                    <br/>
                                    Thời gian: ${ngayBatDau} - ${ngayKetThuc}
                                    <br/>
                                    Số chỗ: ${soCho}
                                </label>
                            </div>
                            <button type="button" class="btn btn-sm btn-danger delete-schedule" 
                                    data-id="${maLich}" title="Xóa lịch khởi hành">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `);
            });

            // Thêm xử lý sự kiện cho nút xóa
            $('.delete-schedule').click(function() {
                const maLich = $(this).data('id');
                deleteSchedule(maLich, editTourId);
            });
        }

        // Kiểm tra xem có lịch khởi hành tạm thời không
        const tempSchedule = localStorage.getItem('newScheduleData');
        if (tempSchedule) {
            const scheduleData = JSON.parse(tempSchedule);
            const schedulesList = $('#schedulesList');
            
            schedulesList.append(`
                <div class="form-check mb-3 border-bottom pb-2" id="temp-schedule-${scheduleData.ma_lich}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <input class="form-check-input" type="radio" 
                                   name="lich_khoi_hanh" value="${scheduleData.ma_lich}" 
                                   id="lich-${scheduleData.ma_lich}" checked required>
                            <label class="form-check-label" for="lich-${scheduleData.ma_lich}">
                                <strong>Mã lịch: ${scheduleData.ma_lich}</strong>
                                <br/>
                                Thời gian: ${new Date(scheduleData.ngay_bat_dau).toLocaleDateString('vi-VN')} 
                                - ${new Date(scheduleData.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                                <br/>
                                Số chỗ: ${scheduleData.so_cho}
                                <br/>
                                <small class="text-info">* Lịch khởi hành mới sẽ được tạo sau khi lưu tour</small>
                            </label>
                        </div>
                        <button type="button" class="btn btn-sm btn-danger" id="delete-temp-schedule"
                                title="Xóa lịch khởi hành tạm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `);

            // Thêm xử lý sự kiện cho nút xóa lịch tạm
            $('#delete-temp-schedule').click(function() {
                localStorage.removeItem('newScheduleData');
                $(`#temp-schedule-${scheduleData.ma_lich}`).remove();
                if ($('#schedulesList').children().length === 0) {
                    $('#schedulesList').html('<div class="alert alert-info">Chưa có lịch khởi hành nào</div>');
                }
            });
        }

    } catch (error) {
        console.error('Lỗi load lịch khởi hành:', error);
        if (error.message.includes('đăng nhập lại')) {
            window.location.href = '/login.html';
        } else {
            $('#schedulesList').html(`
                <div class="alert alert-danger">
                    ${error.message}
                    <br/>
                    <small>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</small>
                </div>
            `);
        }
    }
}

// Hàm tạo tour
async function createTour() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
        }

        // Kiểm tra xem đang chỉnh sửa hay tạo mới
        const urlParams = new URLSearchParams(window.location.search);
        const isEditMode = urlParams.get('edit') ? true : false;
        const editTourId = urlParams.get('edit');

        // Validate và chuẩn bị dữ liệu cho bảng Tour_du_lich
        const maTour = $('#ma_tour').val().trim();
        const tenTour = $('#ten_tour').val().trim();
        const thoiGian = parseInt($('#thoi_gian').val());
        const giaNguoiLon = parseInt($('#gia_nguoi_lon').val());
        const giaTreEm = parseInt($('#gia_tre_em').val());
        const tinhTrang = $('#tinh_trang').val();
        const loaiTour = $('#loai_tour').val();

        // Đặc biệt xử lý trường mô tả từ Summernote
        let moTa = $('#mo_ta').summernote('code');
        console.log('Giá trị gốc từ Summernote:', moTa);

        // Kiểm tra nếu nội dung mô tả là thẻ p trống
        if (moTa === '<p><br></p>' || moTa === '<p></p>') {
            console.log('Mô tả trống, gán giá trị mặc định');
            moTa = '';
        }

        // Loại bỏ các thẻ HTML để lấy text thuần túy
        const tempElement = document.createElement('div');
        tempElement.innerHTML = moTa;
        const plainText = tempElement.textContent || tempElement.innerText || '';
        
        // Giới hạn độ dài mô tả trong 255 ký tự (NVARCHAR(255))
        let moTaFinal = plainText.trim();
        if (moTaFinal.length > 255) {
            console.log(`Mô tả quá dài (${moTaFinal.length} ký tự), sẽ cắt bớt xuống 255 ký tự`);
            moTaFinal = moTaFinal.substring(0, 255);
        }
        
        // Kiểm tra nếu mô tả quá ngắn
        if (moTaFinal.length < 10 && moTaFinal.length > 0) {
            console.log('Mô tả quá ngắn, có thể không hợp lệ');
        }

        console.log('Mô tả sau khi xử lý:', moTaFinal);
        console.log('Độ dài mô tả cuối cùng:', moTaFinal.length);

        // Lấy hình ảnh nếu có
        const hinhAnh = $('input[name="hinh_anh"]')[0].files[0];
        
        // Validate các trường bắt buộc theo cấu trúc bảng
        if (!maTour) throw new Error('Vui lòng nhập mã tour');
        if (!tenTour) throw new Error('Vui lòng nhập tên tour');
        if (!thoiGian || thoiGian <= 0) throw new Error('Thời gian tour phải lớn hơn 0');
        if (!giaNguoiLon || giaNguoiLon <= 0) throw new Error('Giá người lớn phải lớn hơn 0');
        if (!giaTreEm || giaTreEm < 0) throw new Error('Giá trẻ em không được âm');
        if (!['trong_nuoc', 'nuoc_ngoai'].includes(loaiTour)) {
            throw new Error('Loại tour không hợp lệ');
        }

        // Chuẩn bị dữ liệu JSON
        const tourData = {
            ma_tour: maTour,
            ten_tour: tenTour,
            thoi_gian: thoiGian,
            tinh_trang: tinhTrang,
            gia_nguoi_lon: giaNguoiLon,
            gia_tre_em: giaTreEm,
            loai_tour: loaiTour,
            mo_ta: moTaFinal,
            Mo_ta: moTaFinal,  // Thêm tên trường viết hoa để tương thích với cả hai trường hợp
            description: moTaFinal  // Thử thêm một tên trường khác
        };

        // Bước 1: Upload hình ảnh nếu có
        let hinhAnhUrl = null;
        if (hinhAnh) {
            console.log('Đang upload hình ảnh...');
            try {
                const imageFormData = new FormData();
                imageFormData.append('image', hinhAnh);
                imageFormData.append('type', 'tours');

                const uploadResponse = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: imageFormData
                });

                if (uploadResponse.ok) {
                    const imageData = await uploadResponse.json();
                    if (imageData.status === 'success' && imageData.imageUrl) {
                        hinhAnhUrl = imageData.imageUrl;
                        console.log('Upload hình ảnh thành công:', hinhAnhUrl);
                        tourData.hinh_anh = hinhAnhUrl;
                    }
                } else {
                    console.warn('Không thể upload hình ảnh, tiếp tục tạo tour mà không có hình');
                }
            } catch (uploadError) {
                console.error('Lỗi khi upload hình ảnh:', uploadError);
                console.warn('Tiếp tục tạo tour mà không có hình');
            }
        } else if (isEditMode) {
            // Nếu đang ở chế độ chỉnh sửa và không có hình ảnh mới, giữ lại hình ảnh cũ
            const editData = JSON.parse(localStorage.getItem('editTourData'));
            const oldImageUrl = editData.Hinh_anh || editData.hinh_anh;
            if (oldImageUrl) {
                console.log('Giữ lại hình ảnh cũ:', oldImageUrl);
                tourData.hinh_anh = oldImageUrl;
            }
        }

        console.log(`=== ${isEditMode ? 'CẬP NHẬT' : 'TẠO MỚI'} TOUR_DU_LICH ===`);
        console.log('Dữ liệu gửi đi:', tourData);

        // Bước 2: Tạo hoặc cập nhật tour bằng dữ liệu JSON
        try {
            let response;
            
            // Thêm logging chi tiết cho dữ liệu gửi đi
            console.log('Dữ liệu JSON gửi đi chi tiết:', JSON.stringify(tourData, null, 2));
            
            // Đảm bảo rằng mo_ta được gửi theo nhiều cách khác nhau
            tourData.mo_ta = moTaFinal;  // Đảm bảo có field mo_ta
            tourData.Mo_ta = moTaFinal;  // Đảm bảo có field Mo_ta
            tourData.description = moTaFinal;  // Thử thêm một tên trường khác
            
            if (isEditMode) {
                // Cập nhật tour hiện có
                console.log(`Đang cập nhật tour ${editTourId}...`);
                response = await fetch(`http://localhost:5000/api/tours/${editTourId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tourData)
                });
            } else {
                // Tạo tour mới
                console.log('Đang tạo tour mới...');
                response = await fetch('http://localhost:5000/api/tours', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tourData)
                });
            }

            const responseData = await response.json();
            console.log(`Phản hồi từ server (${isEditMode ? 'Cập nhật' : 'Tạo mới'} Tour):`, responseData);

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || `Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} tour`);
            }

            // Kiểm tra dữ liệu trả về và log các thông tin quan trọng
            if (responseData.data && responseData.data.tour) {
                const returnedTour = responseData.data.tour;
                console.log('Tour đã được tạo/cập nhật với ID:', returnedTour.Ma_tour || returnedTour.ma_tour);
                
                // Kiểm tra đặc biệt trường mô tả
                const returnedMoTa = returnedTour.Mo_ta || returnedTour.mo_ta;
                if (returnedMoTa) {
                    console.log('Mô tả đã được lưu thành công với độ dài:', returnedMoTa.length);
                    console.log('Mô tả bắt đầu với:', returnedMoTa.substring(0, 50) + '...');
                } else {
                    console.warn('Mô tả không có trong dữ liệu trả về từ server!');
                    console.log('Dữ liệu tour đầy đủ:', returnedTour);
                }
            }

            return responseData.data.tour;
        } catch (firstAttemptError) {
            console.error(`Lỗi khi gọi API chính để ${isEditMode ? 'cập nhật' : 'tạo'} tour:`, firstAttemptError);
            
            // Thử phương án dự phòng
            console.log('Thử phương án dự phòng...');
            
            // Đổi URL API
            let backupUrl = isEditMode 
                ? `http://localhost:5000/api/admin/tours/${editTourId}`
                : 'http://localhost:5000/api/admin/tours';
                
            const backupResponse = await fetch(backupUrl, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tourData)
            });

            const backupData = await backupResponse.json();
            console.log(`Phản hồi từ server (${isEditMode ? 'Cập nhật' : 'Tạo mới'} Tour - backup):`, backupData);

            if (!backupResponse.ok) {
                throw new Error(backupData.message || backupData.error || `Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} tour`);
            }

            return backupData.data.tour;
        }
    } catch (error) {
        console.error('Lỗi khi tạo/cập nhật tour:', error);
        throw error;
    }
}

// Hàm thêm địa danh vào tour
async function addDiaDanhToTour(maTour) {
    try {
        if (!maTour) {
            throw new Error('Không có mã tour để thêm địa danh');
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
        }

        // Chuẩn bị dữ liệu cho bảng Chi_tiet_tour_dia_danh
        const selectedDiaDanh = $('input[name="dia_danh"]:checked');
        if (selectedDiaDanh.length === 0) {
            console.warn('Không có địa danh nào được chọn, bỏ qua bước này');
            return { status: 'success', message: 'Không có địa danh nào được chọn' };
        }

        console.log('=== CHI_TIET_TOUR_DIA_DANH ===');
        
        // Xử lý từng địa danh một theo đúng format API của Tour.addDestination
        const successResults = [];
        const failedResults = [];
        
        for (let i = 0; i < selectedDiaDanh.length; i++) {
            const maDiaDanh = selectedDiaDanh[i].value;
            const thuTu = i + 1;
            
            try {
                // Sử dụng endpoint addDestinationToTour từ API
                console.log(`Thêm địa danh ${maDiaDanh} với thứ tự ${thuTu}`);
                
                const response = await fetch(`http://localhost:5000/api/tours/${maTour}/destinations/${maDiaDanh}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        order: thuTu // Đúng tên tham số theo controller addDestinationToTour
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    successResults.push({maDiaDanh, thuTu});
                    console.log(`Đã thêm địa danh ${maDiaDanh} thành công`);
                } else {
                    console.warn(`Không thể thêm địa danh ${maDiaDanh}, status: ${response.status}`);
                    failedResults.push({maDiaDanh, thuTu});
                    
                    // Thử thêm với endpoint dự phòng
                    try {
                        const backupResponse = await fetch(`http://localhost:5000/api/destinations/tours/${maTour}/destinations/${maDiaDanh}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                order: thuTu // Đúng tên tham số theo controller
                            })
                        });
                        
                        if (backupResponse.ok) {
                            const data = await backupResponse.json();
                            successResults.push({maDiaDanh, thuTu});
                            console.log(`Đã thêm địa danh ${maDiaDanh} thành công với endpoint dự phòng`);
                        }
                    } catch (backupError) {
                        console.warn(`Lỗi khi thử endpoint dự phòng cho địa danh ${maDiaDanh}:`, backupError);
                    }
                }
            } catch (error) {
                console.warn(`Lỗi khi thêm địa danh ${maDiaDanh}:`, error);
                failedResults.push({maDiaDanh, thuTu});
            }
        }
        
        // Kết quả cuối cùng
        if (successResults.length > 0) {
            return { 
                status: 'success', 
                data: { successResults, failedResults }, 
                message: `Đã thêm ${successResults.length}/${selectedDiaDanh.length} địa danh vào tour` 
            };
        } else if (selectedDiaDanh.length > 0) {
            console.warn('Không thể thêm bất kỳ địa danh nào');
            // Trả về success để không dừng quy trình
            return { 
                status: 'success', 
                message: 'Không thể thêm địa danh nhưng quy trình vẫn tiếp tục',
                error: true
            };
        } else {
            return { status: 'success', message: 'Không có địa danh nào được chọn' };
        }
    } catch (error) {
        console.error('Lỗi khi thêm địa danh:', error);
        // Trả về success để không làm gián đoạn quy trình tạo tour
        return { 
            status: 'success', 
            message: 'Tiếp tục quy trình mặc dù có lỗi khi thêm địa danh', 
            error: error.message 
        };
    }
}

// Thêm hàm tạo lịch khởi hành sau khi tạo tour
async function createScheduleAfterTour(maTour) {
    try {
        const scheduleData = localStorage.getItem('newScheduleData');
        if (!scheduleData) {
            console.log('Không có dữ liệu lịch khởi hành để tạo');
            return { status: 'warning', message: 'Không có lịch khởi hành để tạo' };
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
        }

        // Parse và validate dữ liệu cho bảng Lich_khoi_hanh
        const formData = JSON.parse(scheduleData);
        const schedulePayload = {
            ma_lich: formData.ma_lich,
            ma_tour: maTour,
            ngay_bat_dau: formData.ngay_bat_dau,
            ngay_ket_thuc: formData.ngay_ket_thuc,
            so_cho: parseInt(formData.so_cho)
        };

        // Validate theo cấu trúc bảng
        if (!schedulePayload.ma_lich) throw new Error('Thiếu mã lịch khởi hành');
        if (!schedulePayload.ma_tour) throw new Error('Thiếu mã tour');
        if (!schedulePayload.ngay_bat_dau) throw new Error('Thiếu ngày bắt đầu');
        if (!schedulePayload.ngay_ket_thuc) throw new Error('Thiếu ngày kết thúc');
        if (!schedulePayload.so_cho || schedulePayload.so_cho <= 0) {
            throw new Error('Số chỗ phải lớn hơn 0');
        }

        console.log('=== LICH_KHOI_HANH ===');
        console.log('Dữ liệu gửi đi:', schedulePayload);

        // Danh sách các endpoint có thể sử dụng
        const endpoints = [
            'http://localhost:5000/api/tours/schedules',
            'http://localhost:5000/api/admin/tours/schedules',
            'http://localhost:5000/api/schedule',
            'http://localhost:5000/api/schedules'
        ];

        let lastError = null;
        
        // Thử từng endpoint cho đến khi thành công
        for (const endpoint of endpoints) {
            try {
                console.log(`Thử tạo lịch khởi hành với endpoint: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(schedulePayload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(e => ({ error: 'Lỗi khi đọc phản hồi' }));
                    console.warn(`Endpoint ${endpoint} trả về lỗi:`, errorData);
                    lastError = new Error(errorData.message || errorData.error || `Lỗi ${response.status}`);
                    continue; // Thử endpoint tiếp theo
                }

                const responseData = await response.json();
                console.log(`Phản hồi từ server (Lịch khởi hành - ${endpoint}):`, responseData);
                
                // Xóa dữ liệu lịch khởi hành từ localStorage khi tạo thành công
                localStorage.removeItem('newScheduleData');
                
                return {
                    status: 'success',
                    data: responseData.data || responseData,
                    message: 'Đã tạo lịch khởi hành thành công'
                };
            } catch (error) {
                console.warn(`Lỗi khi thử endpoint ${endpoint}:`, error);
                lastError = error;
            }
        }

        // Nếu tất cả endpoint đều thất bại
        if (lastError) {
            console.error('Tất cả endpoint đều thất bại:', lastError);
            return {
                status: 'error',
                message: 'Không thể tạo lịch khởi hành: ' + (lastError.message || 'Lỗi không xác định'),
                error: lastError
            };
        }

        return {
            status: 'error',
            message: 'Không thể tạo lịch khởi hành vì lỗi không xác định'
        };
    } catch (error) {
        console.error('Lỗi khi tạo lịch khởi hành:', error);
        return {
            status: 'error',
            message: 'Lỗi khi tạo lịch khởi hành: ' + error.message,
            error
        };
    }
}

// Hàm xóa lịch khởi hành
async function deleteSchedule(maLich, maTour) {
    try {
        if (!confirm(`Bạn có chắc chắn muốn xóa lịch khởi hành ${maLich}?`)) {
            return;
        }

        console.log(`Đang xóa lịch khởi hành ${maLich}...`);
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập lại để thực hiện chức năng này');
        }

        const response = await fetch(`http://localhost:5000/api/tours/schedules/${maLich}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể xóa lịch khởi hành');
        }

        // Xóa DOM element
        $(`#schedule-item-${maLich}`).remove();
        
        if ($('#schedulesList').children().length === 0) {
            $('#schedulesList').html('<div class="alert alert-info">Chưa có lịch khởi hành nào</div>');
        }

        alert(`Đã xóa lịch khởi hành ${maLich} thành công!`);
    } catch (error) {
        console.error('Lỗi khi xóa lịch khởi hành:', error);
        alert('Lỗi khi xóa lịch khởi hành: ' + error.message);
    }
}
