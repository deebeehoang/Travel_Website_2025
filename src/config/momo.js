/**
 * MoMo Payment Configuration
 */

const MOMO_CONFIG = {
    // Test environment credentials
    PARTNER_CODE: "MOMO",
    ACCESS_KEY: "F8BBA842ECF85",
    SECRET_KEY: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    
    // Production environment credentials (uncomment when ready for production)
    // PARTNER_CODE: "YOUR_PRODUCTION_PARTNER_CODE",
    // ACCESS_KEY: "YOUR_PRODUCTION_ACCESS_KEY", 
    // SECRET_KEY: "YOUR_PRODUCTION_SECRET_KEY",
    
    // API endpoints
    CREATE_PAYMENT_URL: "https://test-payment.momo.vn/v2/gateway/api/create",
    QUERY_PAYMENT_URL: "https://test-payment.momo.vn/v2/gateway/api/query",
    REFUND_PAYMENT_URL: "https://test-payment.momo.vn/v2/gateway/api/refund",
    
    // Production endpoints (uncomment when ready for production)
    // CREATE_PAYMENT_URL: "https://payment.momo.vn/v2/gateway/api/create",
    // QUERY_PAYMENT_URL: "https://payment.momo.vn/v2/gateway/api/query", 
    // REFUND_PAYMENT_URL: "https://payment.momo.vn/v2/gateway/api/refund",
    
    // Callback URLs
    REDIRECT_URL: "https://3ca6a3cf76af.ngrok-free.app/payment/momo/return",
    IPN_URL: "https://3ca6a3cf76af.ngrok-free.app/api/payment/momo/ipn",
    
    // Request type
    REQUEST_TYPE: "captureWallet",
    
    // Language
    LANG: "vi"
};

module.exports = MOMO_CONFIG;
