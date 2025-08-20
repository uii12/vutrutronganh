// Quản lý voucher, tip và cập nhật giá cho thanh toán

let selectedVoucher = null;
let vouchers = [];
let finalPrice = 0;

export function updateTotalPrice(getDynamicPrice) {
  const totalPriceDiv = document.getElementById('totalPrice');
  const tipInput = document.getElementById('tipAmount');
  const tip = tipInput ? parseInt(tipInput.value, 10) || 0 : 0;
  let price = typeof getDynamicPrice === 'function' ? getDynamicPrice() : 0;
  
  // Cộng tip vào giá trước khi áp dụng voucher
  let totalBeforeVoucher = price + tip;
  
  if (selectedVoucher) {
    // Áp dụng voucher chỉ cho phần giá gốc (không bao gồm tip)
    const discountAmount = Math.round(price * selectedVoucher.discountValue / 100);
    finalPrice = totalBeforeVoucher - discountAmount;
    
  } else {
    finalPrice = totalBeforeVoucher;
  }
  
  if (totalPriceDiv) {
    if (selectedVoucher) {
      const discountText = `(giảm ${selectedVoucher.discountValue}% = -${Math.round(price * selectedVoucher.discountValue / 100).toLocaleString()}đ)`;
      totalPriceDiv.innerHTML = `<span style=\"color:#e53935;\">${finalPrice.toLocaleString()} VNĐ</span> <span style=\"font-size:14px;color:#888;\">${discountText}${tip > 0 ? `, tip ${tip.toLocaleString()} VNĐ` : ''}</span>`;
    } else {
      totalPriceDiv.innerHTML = `<span style=\"color:#6c63ff;\">${finalPrice.toLocaleString()} VNĐ</span>${tip > 0 ? ` <span style=\"font-size:14px;color:#888;\">(tip ${tip.toLocaleString()} VNĐ)</span>` : ''}`;
    }
  }
}

export async function loadUserVouchers(getDynamicPrice) {
  const voucherList = document.getElementById('voucherList');
  const voucherResult = document.getElementById('voucherResult');
  if (!voucherList) return;
  voucherList.innerHTML = '';
  if (voucherResult) voucherResult.style.display = 'none';
  selectedVoucher = null;
  vouchers = [];
  updateTotalPrice(getDynamicPrice);
  const uid = localStorage.getItem('user_uid');
if(!uid){
  voucherList.innerHTML = '<span style="color:#e53935;"></span>';
  return;
}
  try {
    const res = await fetch(`https://dearlove-backend.onrender.com/api/vouchers/saved/${uid}`);
    const data = await res.json();
   if (!data.success) {
      voucherList.innerHTML = `<span style="color:#e53935;">${data.message}</span>`;
      return;
    }
    if (!data.data.length) {
      voucherList.innerHTML = '<span style="color:#888;"></span>';
      return;
    }
    vouchers = data.data; 
    // vouchers =fakeVouchers;
    voucherList.innerHTML = vouchers.map((v, idx) => `
      <div class=\"voucher-item\" data-idx=\"${idx}\">\n        <input class= \"checkbox\" type=\"checkbox\" name=\"voucher\" id=\"voucher_${idx}\">\n        <label for=\"voucher_${idx}\">\n          <b>${v.code}</b> - Giảm: ${v.discountValue}% | HSD: ${new Date(v.expiredAt).toLocaleDateString()}\n        </label>\n      </div>\n    `).join('');
    selectedVoucher = null; // Không chọn mặc định
    updateTotalPrice(getDynamicPrice);
  } catch (err) {
    voucherList.innerHTML = '<span style=\"color:#e53935;\"></span>';
  }
}

export function setupVoucherListeners(getDynamicPrice) {
  // getDynamicPrice là hàm callback trả về tổng tiền động
  const voucherList = document.getElementById('voucherList');
  if (voucherList) {
    voucherList.addEventListener('change', (e) => {
      if (e.target.name === 'voucher') {
        const checkboxes = voucherList.querySelectorAll('input[name=\"voucher\"]');
        const idx = Array.from(checkboxes).findIndex(cb => cb === e.target);
        if (e.target.checked) {
          checkboxes.forEach((cb, i) => cb.checked = i === idx);
          selectedVoucher = vouchers[idx];

        } else {
          selectedVoucher = null;
          console.log('Voucher đã được bỏ chọn');
        }
        updateTotalPrice(getDynamicPrice);
      }
    });
  }
  // Lắng nghe tip
  const tipInput = document.getElementById('tipAmount');
  if (tipInput) {
    tipInput.addEventListener('input', () => {
      // Validation tip
      let tipValue = parseInt(tipInput.value, 10) || 0;
      if (tipValue < 0) {
        tipValue = 0;
        tipInput.value = 0;
      }
      if (tipValue > 1000000) { // Giới hạn 1 triệu
        tipValue = 1000000;
        tipInput.value = 1000000;
      }
      updateTotalPrice(getDynamicPrice);
    });
  }
}

export function getSelectedVoucherCode() {
  return selectedVoucher ? selectedVoucher.code : null;
}

export function getSelectedVoucherInfo() {
  return selectedVoucher ? {
    code: selectedVoucher.code,
    discountValue: selectedVoucher.discountValue,
    expiredAt: selectedVoucher.expiredAt
  } : null;
}

export function getFinalPrice() {
  return finalPrice;
} 