// Debug script để kiểm tra frontend payment
console.log('🔍 Debug Payment Frontend...');

// Kiểm tra các element cần thiết
const zalopayBtn = document.getElementById('redirect-zalopay-btn');
const momoBtn = document.getElementById('redirect-momo-btn');
const paymentMethods = document.querySelectorAll('.payment-method');

console.log('📋 Payment Elements Check:');
console.log('- ZaloPay button:', zalopayBtn ? '✅ Found' : '❌ Not found');
console.log('- MoMo button:', momoBtn ? '✅ Found' : '❌ Not found');
console.log('- Payment methods:', paymentMethods.length);

// Kiểm tra event listeners
if (zalopayBtn) {
    console.log('🔗 ZaloPay button onclick:', zalopayBtn.onclick);
    console.log('🔗 ZaloPay button event listeners:', zalopayBtn.addEventListener ? 'Has addEventListener' : 'No addEventListener');
}

if (momoBtn) {
    console.log('🔗 MoMo button onclick:', momoBtn.onclick);
    console.log('🔗 MoMo button event listeners:', momoBtn.addEventListener ? 'Has addEventListener' : 'No addEventListener');
}

// Kiểm tra sessionStorage
console.log('💾 SessionStorage:');
console.log('- paymentBookingId:', sessionStorage.getItem('paymentBookingId'));
console.log('- paymentAmount:', sessionStorage.getItem('paymentAmount'));

// Kiểm tra localStorage
console.log('🔑 LocalStorage:');
console.log('- token:', localStorage.getItem('token') ? '✅ Has token' : '❌ No token');

// Kiểm tra API_URL
console.log('🌐 API Configuration:');
console.log('- window.API_URL:', window.API_URL);
console.log('- CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : 'Not defined');

// Test click event manually
if (zalopayBtn) {
    console.log('🧪 Testing ZaloPay click manually...');
    zalopayBtn.click();
}