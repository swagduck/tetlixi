// server/src/utils/rng.js

// Danh sách mệnh giá "Chẵn" (Bạn có thể thêm bớt tùy ý)
const DENOMINATIONS = [20000, 50000, 100000, 200000, 500000];

/**
 * Chọn ngẫu nhiên một mệnh giá đẹp
 */
const calculateRandomAmount = (remainingAmount, remainingQuantity) => {
  // 1. NGƯỜI CUỐI CÙNG: Hốt trọn số tiền còn lại (để không bị sót tiền quỹ)
  if (remainingQuantity === 1) {
    return remainingAmount;
  }

  // 2. Lọc ra các mệnh giá hợp lệ
  // (Mệnh giá phải nhỏ hơn hoặc bằng số tiền còn lại)
  // Và quan trọng: Phải chừa lại ít nhất 20k (min) cho những người sau
  // Ví dụ: Còn 100k, còn 2 người. Không được random ra 100k, vì người sau sẽ còn 0đ.

  const minReserve = (remainingQuantity - 1) * 20000; // Tiền tối thiểu cần chừa
  const maxAffordable = remainingAmount - minReserve;

  const validDenominations = DENOMINATIONS.filter((d) => d <= maxAffordable);

  // Trường hợp hiếm: Quỹ còn quá ít (do chia không khéo), không đủ chia mệnh giá đẹp
  // Thì đành trả về mệnh giá nhỏ nhất có thể hoặc chia đều phần dư
  if (validDenominations.length === 0) {
    // Trả về số tiền nhỏ nhất còn lại chia cho đầu người (làm tròn chục nghìn)
    return Math.floor(remainingAmount / remainingQuantity);
  }

  // 3. Quay số ngẫu nhiên trong danh sách hợp lệ
  const randomIndex = Math.floor(Math.random() * validDenominations.length);
  return validDenominations[randomIndex];
};

module.exports = { calculateRandomAmount };
