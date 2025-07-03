export interface ProductManual {
  id: string
  title: string
  category: string
  productType: string
  brand: string
  s3Key: string // S3 object key
  s3Bucket: string // S3 bucket name
  fileSize?: string // Optional file size
  dateAdded: string
}

export interface RegisteredProduct {
  id: string
  mobileNumber: string
  productType: string
  modelNumber: string
  serialNumber: string
  brand: string
  purchaseDate: string
  retailer: string
  warrantyExpiry: string
  registrationDate: string
}

// Expanded sample data for better lazy loading demonstration
export const sampleManuals: ProductManual[] = [
  {
    id: "1",
    title: "XYZ Smart TV 55-inch User Manual",
    category: "Electronics",
    productType: "Smart TV",
    brand: "XYZ",
    s3Key: "manuals/electronics/xyz-smart-tv-55.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "2.5 MB",
    dateAdded: "2024-01-15",
  },
  {
    id: "2",
    title: "ABC Washing Machine WM-2000 Manual",
    category: "Home Appliances",
    productType: "Washing Machine",
    brand: "ABC",
    s3Key: "manuals/appliances/abc-washing-machine-wm2000.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "3.1 MB",
    dateAdded: "2024-01-10",
  },
  {
    id: "3",
    title: "DEF Refrigerator RF-500 User Guide",
    category: "Home Appliances",
    productType: "Refrigerator",
    brand: "DEF",
    s3Key: "manuals/appliances/def-refrigerator-rf500.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "4.2 MB",
    dateAdded: "2024-01-08",
  },
  {
    id: "4",
    title: "GHI Smartphone SP-100 Manual",
    category: "Electronics",
    productType: "Smartphone",
    brand: "GHI",
    s3Key: "manuals/electronics/ghi-smartphone-sp100.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "1.8 MB",
    dateAdded: "2024-01-05",
  },
  {
    id: "5",
    title: "JKL Air Conditioner AC-3000 Guide",
    category: "Home Appliances",
    productType: "Air Conditioner",
    brand: "JKL",
    s3Key: "manuals/appliances/jkl-air-conditioner-ac3000.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "2.9 MB",
    dateAdded: "2024-01-03",
  },
  // Additional sample data for better pagination demonstration
  {
    id: "6",
    title: "MNO Microwave MW-800 User Manual",
    category: "Kitchen Appliances",
    productType: "Microwave",
    brand: "MNO",
    s3Key: "manuals/kitchen/mno-microwave-mw800.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "1.5 MB",
    dateAdded: "2024-01-02",
  },
  {
    id: "7",
    title: "PQR Gaming Console GC-Pro Manual",
    category: "Gaming",
    productType: "Gaming Console",
    brand: "PQR",
    s3Key: "manuals/gaming/pqr-gaming-console-pro.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "3.8 MB",
    dateAdded: "2024-01-01",
  },
  {
    id: "8",
    title: "STU Laptop LT-15 User Guide",
    category: "Computing",
    productType: "Laptop",
    brand: "STU",
    s3Key: "manuals/computing/stu-laptop-lt15.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "5.2 MB",
    dateAdded: "2023-12-30",
  },
  {
    id: "9",
    title: "VWX Tablet TB-10 Manual",
    category: "Computing",
    productType: "Tablet",
    brand: "VWX",
    s3Key: "manuals/computing/vwx-tablet-tb10.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "2.1 MB",
    dateAdded: "2023-12-28",
  },
  {
    id: "10",
    title: "YZA Dishwasher DW-Pro Manual",
    category: "Kitchen Appliances",
    productType: "Dishwasher",
    brand: "YZA",
    s3Key: "manuals/kitchen/yza-dishwasher-pro.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "3.4 MB",
    dateAdded: "2023-12-25",
  },
  {
    id: "11",
    title: "BCD Sound System SS-5000 Guide",
    category: "Audio & Video",
    productType: "Sound System",
    brand: "BCD",
    s3Key: "manuals/audio/bcd-sound-system-5000.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "2.7 MB",
    dateAdded: "2023-12-22",
  },
  {
    id: "12",
    title: "EFG Vacuum Cleaner VC-Max Manual",
    category: "Home Appliances",
    productType: "Vacuum Cleaner",
    brand: "EFG",
    s3Key: "manuals/appliances/efg-vacuum-cleaner-max.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "1.9 MB",
    dateAdded: "2023-12-20",
  },
  {
    id: "13",
    title: "HIJ Coffee Maker CM-Deluxe User Manual",
    category: "Kitchen Appliances",
    productType: "Coffee Maker",
    brand: "HIJ",
    s3Key: "manuals/kitchen/hij-coffee-maker-deluxe.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "1.3 MB",
    dateAdded: "2023-12-18",
  },
  {
    id: "14",
    title: "KLM Security Camera SC-HD Manual",
    category: "Electronics",
    productType: "Security Camera",
    brand: "KLM",
    s3Key: "manuals/electronics/klm-security-camera-hd.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "2.8 MB",
    dateAdded: "2023-12-15",
  },
  {
    id: "15",
    title: "NOP Router RT-Gigabit Guide",
    category: "Computing",
    productType: "Router",
    brand: "NOP",
    s3Key: "manuals/computing/nop-router-gigabit.pdf",
    s3Bucket: "product-manuals-bucket",
    fileSize: "1.7 MB",
    dateAdded: "2023-12-12",
  },
]

export const productTypes = [
  "Smart TV",
  "Washing Machine",
  "Refrigerator",
  "Smartphone",
  "Air Conditioner",
  "Microwave",
  "Laptop",
  "Tablet",
  "Gaming Console",
  "Dishwasher",
  "Sound System",
  "Vacuum Cleaner",
  "Coffee Maker",
  "Security Camera",
  "Router",
  "Other",
]

export const productCategories = [
  "Electronics",
  "Home Appliances",
  "Kitchen Appliances",
  "Computing",
  "Gaming",
  "Audio & Video",
]

export const registeredProducts: RegisteredProduct[] = [
  {
    id: "reg1",
    mobileNumber: "123-456-7890",
    productType: "Smart TV",
    modelNumber: "XYZ-55",
    serialNumber: "SN12345",
    brand: "XYZ",
    purchaseDate: "2023-08-15",
    retailer: "Best Buy",
    warrantyExpiry: "2025-08-15",
    registrationDate: "2023-08-16",
  },
  {
    id: "reg2",
    mobileNumber: "987-654-3210",
    productType: "Washing Machine",
    modelNumber: "ABC-WM2000",
    serialNumber: "WM98765",
    brand: "ABC",
    purchaseDate: "2023-09-01",
    retailer: "Home Depot",
    warrantyExpiry: "2026-09-01",
    registrationDate: "2023-09-02",
  },
]
