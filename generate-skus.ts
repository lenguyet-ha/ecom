type Variant = {
  value: string
  options: string[]
}

type SKU = {
  value: string
  price: number
  stock: number
  image: string
}

// Hàm chính để tạo SKUs từ variants
function generateSKUs(variants: Variant[]): SKU[] {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)),
      ['']
    )
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options)

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options)

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: ''
  }))
}

// Test với dữ liệu mẫu
const variants: Variant[] = [
  {
    value: 'Màu sắc',
    options: ['Đen', 'Trắng', 'Xanh', 'Tím'],
  },
  {
    value: 'Kích thước',
    options: ['S', 'M', 'L', 'XL'],
  },
]

const skus = generateSKUs(variants);
console.log(JSON.stringify(skus, null, 2));
