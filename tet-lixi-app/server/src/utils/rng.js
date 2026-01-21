// server/src/utils/rng.js

// 1. Thêm mệnh giá nhỏ để "troll" và mệnh giá lẻ cho vui
const DENOMINATIONS = [
  1000, 2000, 5000, 10000, // Mệnh giá "troll"
  20000, 50000, 100000, 200000, 500000 // Mệnh giá "ấm no"
];

/**
 * Chọn ngẫu nhiên một mệnh giá đẹp
 */
const calculateRandomAmount = (remainingAmount, remainingQuantity) => {
  // 1. NGƯỜI CUỐI CÙNG: Hốt trọn số tiền còn lại (để không bị sót tiền quỹ)
  if (remainingQuantity === 1) {
    return remainingAmount;
  }

  // 2. GIẢM mức dự trữ tối thiểu xuống thấp nhất (1k)
  // Để người đi trước có thể "hốt" gần hết tiền, chỉ chừa lại 1k cho người sau -> Tạo drama!
  const minReserve = (remainingQuantity - 1) * 1000;
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
