import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PromotionsList = ({ onApplyPromo }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(false);
      const response = await axios.get('http://localhost:5000/api/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setLoading(false);
    }
  };

  const handleValidatePromo = async (cartTotal = 0) => {
    if (!promoCode.trim()) {
      setValidationResult({ error: 'กรุณากรอกรหัสโปรโมชั่น' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/promotions/validate', {
        code: promoCode,
        cartTotal: cartTotal
      });

      setValidationResult(response.data);
      if (response.data.success && onApplyPromo) {
        onApplyPromo(response.data.promotion);
      }
    } catch (error) {
      setValidationResult({
        error: error.response?.data?.error || 'โปรโมชั่นไม่ถูกต้อง'
      });
    }
  };

  const applyCoupon = (code) => {
    setPromoCode(code);
    handleValidatePromo();
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '2px solid #e2e8f0',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderBottomColor = '#94a3b8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderBottomColor = '#e2e8f0';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎉</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
            โปรโมชั่นที่มี
            <span style={{ 
              display: 'inline-block',
              marginLeft: '6px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              paddingLeft: '7px',
              paddingRight: '7px',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {promotions.length}
            </span>
          </h3>
        </div>
        <span style={{ fontSize: '16px', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div style={{ paddingTop: '16px' }}>
          {/* Promo Code Input */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', color: '#1e293b' }}>
              💳 มีโปรโมชั่นอยู่หรือไม่?
            </h4>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setValidationResult(null);
                }}
                placeholder="ใส่รหัสโปรโมชั่น..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={() => handleValidatePromo()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#000000';
                }}
              >
                ใช้โปรโมชั่น
              </button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: validationResult.error ? '#fee2e2' : '#dcfce7',
                color: validationResult.error ? '#991b1b' : '#166534',
                border: `1px solid ${validationResult.error ? '#fca5a5' : '#86efac'}`
              }}>
                {validationResult.error ? '❌ ' : '✅ '}
                {validationResult.error || validationResult.message}
                {validationResult.promotion && !validationResult.error && (
                  <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 'normal' }}>
                    ลดได้: ฿{Number(validationResult.promotion.discountAmount).toLocaleString('th-TH')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Promotions List */}
          {promotions.length === 0 ? (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '28px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🎁</span>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>ยังไม่มีโปรโมชั่นในขณะนี้</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {promotions.map((promo) => (
                <div 
                  key={promo.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    borderLeft: '4px solid #3b82f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: '1px' }}>
                          {promo.code}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          backgroundColor: promo.discount_type === 'percentage' ? '#dbeafe' : '#fef3c7',
                          color: promo.discount_type === 'percentage' ? '#0c4a6e' : '#92400e',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontWeight: '600'
                        }}>
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `฿${Number(promo.discount_value).toLocaleString('th-TH')}`}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                        {promo.description}
                      </p>
                      {promo.max_uses && (
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0 0' }}>
                          เหลือ: {promo.max_uses - promo.current_uses} ครั้ง
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => applyCoupon(promo.code)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      ใช้
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionsList;
