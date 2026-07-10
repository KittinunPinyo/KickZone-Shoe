# เอกสารวิเคราะห์และออกแบบระบบ (Analysis & Design)
## โครงงาน: KickZone (คิ๊กโซน) - ระบบเว็บไซต์ร้านค้าออนไลน์สำหรับจัดจำหน่ายรองเท้า

---

## 📋 สารบัญ

- [การวิเคราะห์ความต้องการ](#การวิเคราะห์ความต้องการ)
- [แผนภาพยูสเคส](#แผนภาพยูสเคส)
- [โครงสร้างคลาส](#โครงสร้างคลาส)
- [แผนภาพลำดับการทำงาน](#แผนภาพลำดับการทำงาน)

---

## 1. การวิเคราะห์ความต้องการ (Requirements Analysis)

### 1.1 ความต้องการของผู้ใช้งาน (User Requirements)

ระบบมีผู้ใช้งานหลัก 2 กลุ่ม คือ ลูกค้า (Customer) และ ผู้ดูแลระบบ (Admin)

**ลูกค้า (Customer)**
* สมัครสมาชิก / เข้าสู่ระบบ
* ค้นหาและเลือกซื้อสินค้ารองเท้า
* เพิ่มสินค้าลงตะกร้า (Cart)
* สั่งซื้อสินค้า (Checkout)
* ดูประวัติการสั่งซื้อ

**ผู้ดูแลระบบ (Admin)**
* จัดการข้อมูลสินค้า (เพิ่ม/แก้ไข/ลบ)
* จัดการหมวดหมู่/แบรนด์สินค้า
* ดูรายงานยอดขายและคำสั่งซื้อ
* จัดการผู้ใช้งานในระบบ

### 1.2 ขอบเขตของระบบ (System Scope)

ระบบครอบคลุมฟังก์ชันหลัก 9 ส่วน ตามที่กำหนดในรายวิชา ได้แก่

1. การจัดการสมาชิก (Register / Login)
2. การจัดการข้อมูลสินค้า
3. การค้นหาและแสดงรายละเอียดสินค้า
4. ระบบตะกร้าสินค้า (Shopping Cart)
5. ระบบสั่งซื้อสินค้า (Order Management)
6. ระบบชำระเงิน (Simulation)
7. ระบบติดตามสถานะคำสั่งซื้อ
8. ระบบจัดการสินค้าและคำสั่งซื้อสำหรับผู้ดูแลระบบ
9. รายงาน / Dashboard สรุปข้อมูล

### 2. แผนภาพยูสเคส (Use Case Diagram)
![Use Case Diagram](UseCase.png)

```mermaid
flowchart LR
    %% Actors
    User([ผู้ใช้งาน])
    Admin([แอดมิน])

    %% User Use Cases
    UC1([สมัครสมาชิก / เข้าสู่ระบบ])
    UC2([ค้นหาและดูสินค้า])
    UC2_1([ค้นหาด้วยชื่อสินค้า])
    UC2_2([ค้นหาด้วยรหัสสินค้า])
    UC3([ดูรายละเอียดสินค้า])
    UC3_1([แสดงสินค้าคงเหลือ])
    UC3_2([เพิ่มเข้ารายการโปรด])
    UC4([จัดการตะกร้าสินค้า])
    UC4_1([แก้ไขจำนวนสินค้า])
    UC4_2([ลบรายการสินค้าออกจากตะกร้า])
    UC5([สั่งซื้อสินค้า])
    UC5_1([ระบุที่อยู่จัดส่ง])
    UC5_2([ช่องทางการจัดส่ง])
    UC6([ชำระเงิน])
    UC6_1([ชำระเงินผ่านคิวอาร์])
    UC6_2([ชำระเงินผ่านพร้อมเพย์])
    UC7([ดูประวัติคำสั่งซื้อ])
    UC8([ติดตามสถานะคำสั่งซื้อ])

    %% Admin Use Cases
    UC9([จัดการข้อมูลสินค้า])
    UC9_1([เพิ่มสินค้า / ลบสินค้า])
    UC9_2([แก้ไขรายละเอียดสินค้า])
    UC10([จัดการคำสั่งซื้อ])
    UC10_1([อัพเดตสถานะการส่ง])
    UC10_2([กรองดูรายการคำสั่งซื้อ])
    UC11([จัดการผู้ใช้งาน])
    UC11_1([แก้ไขบทบาท])
    UC12([สรุปยอดขาย])

    %% Connections for User
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC5
    User --- UC6
    User --- UC7
    User --- UC8

    UC2_1 --> UC2
    UC2_2 --> UC2
    
    UC3 -. include .-> UC3_1
    UC3_2 -. Extend .-> UC3
    
    UC4_1 -. Extend .-> UC4
    UC4_2 -. Extend .-> UC4
    
    UC5 -. include .-> UC5_1
    UC5 -. include .-> UC5_2
    
    UC6_1 --> UC6
    UC6_2 --> UC6

    %% Connections for Admin
    Admin --- UC9
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    
    %% Dashed line from User's history to Admin (as in diagram)
    UC7 -.- Admin

    UC9_1 -. Extend .-> UC9
    UC9_2 -. Extend .-> UC9
    
    UC10_1 -. Extend .-> UC10
    UC10_2 -. Extend .-> UC10
    
    UC11_1 -. Extend .-> UC11
```

---

### 3. โครงสร้างคลาส (Class Diagram)
ส่วนนี้แสดงโครงสร้างข้อมูล ความสัมพันธ์ระหว่าง Class (Relationships) และ Attributes/Methods ที่ใช้ในระบบจัดการร้านรองเท้ากีฬา
![Class Diagram](ClassDiagram.png)

```mermaid
classDiagram
    class User {
        +int id
        +String email
        +String role
        +login() void
        +logout() void
    }
    
    class Order {
        +int id
        +String orderNumber
        +String orderStatus
        +float netTotal
        +String shippingAddress
        +String paymentMethod
        +saveOrder() void
        +updateOrderStatus() void
    }
    
    class OrderItem {
        +int orderId
        +int variantId
        +String productName
        +String modelName
        +String size
        +String color
        +int quantity
        +float totalPrice
    }
    
    class Brand {
        +int id
        +String slug
        +String brandName
    }
    
    class Category {
        +int id
        +String slug
        +String categoryName
    }
    
    class ShoeProduct {
        +int id
        +String baseSKU
        +String productName
        +String description
        +String modelName
        +String genderCategory
        +float basePrice
        +float discountedPrice
        +int totalStock
        +List imageUrls
        +getCheapestVariantPrice() float
    }
    
    class ProductVariant {
        +int variantId
        +int productId
        +String variantSKU
        +String size
        +String colorName
        +int stockQuantity
        +List variantImageUrls
    }
    
    class CartContext {
        +List cartItems
        +addToCart(variantId: int, quantity: int) void
        +updateQuantity(variantId: int, quantity: int) void
        +removeFromCart(variantId: int) void
        +clearCart() void
    }
    
    class CartItem {
        +int variantId
        +String productName
        +String modelName
        +String size
        +String color
        +int quantity
        +float totalPrice
    }

    User "1" --> "0..*" Order : makes order
    Order "1" *-- "1..*" OrderItem : contains details
    Brand "1" -- "0..*" ShoeProduct : is brand of
    Category "1" -- "0..*" ShoeProduct : categorized in
    ShoeProduct "1" *-- "0..*" ProductVariant : has variants
    CartContext --> CartItem : stores items
    CartItem "*" --> "1" ProductVariant : references
    OrderItem "*" --> "1" ProductVariant : references purchased
```

---

### 4. แผนภาพลำดับการทำงาน (Sequence Diagram)
ส่วนนี้แสดงลำดับขั้นตอนการสื่อสารและทำงานร่วมกันของระบบต่างๆ ตั้งแต่ผู้ใช้เรียกดูสินค้าจนถึงขั้นตอนการชำระเงินและส่งข้อมูลไปยังคลังสินค้า
![Sequence Diagram](SequenceDiagram.png)

```mermaid
sequenceDiagram
    actor User as User (App)
    participant API as API Gateway
    participant Product as Product & Stock System
    participant Cart as Cart System
    participant Order as Order System
    participant Payment as Payment System
    participant Warehouse as Warehouse & Shipping System

    User->>API: 1. Browse products
    API->>Product: 2. Search products (product name, getCheapestVariantPrice())
    Product-->>API: 3. Product info (product name, brand, base price)
    API-->>User: 4. Display product
    
    User->>API: 5. Add to cart (specify shoe size and color)
    API->>Cart: 6. addToCart (variant id, quantity)
    Cart->>Cart: Create cart item (CartItem)
    Cart-->>API: 7. Confirm add to cart successful
    API-->>User: 8. Display cart (total price)
    
    User->>API: 9. Proceed to checkout
    API->>Product: 10. Check stock (ProductVariant)
    Product-->>API: Product available
    API->>Order: 11. Create initial order (saveOrder() -> order ID)
    Order->>Order: Create order details (OrderItem)
    Order-->>API: 12. Order info (net total)
    API-->>User: 13. Display checkout page (shipping address & payment method)
    
    User->>Payment: 14. Make payment (payment method)
    API->>Payment: 15. Check payment status
    Payment-->>API: 16. Update successful payment result
    
    API->>Order: 17. Confirm order success (update order status)
    Order-->>API: 18. Confirm order success
    API->>Warehouse: 19. Send order to warehouse (deduct stock for that size/color)
    
    API->>Cart: Call clearCart()
    Cart-->>API: Cart cleared successfully
    Warehouse-->>API: 20. Confirm shipping (generate tracking number)
    
    API-->>User: 21. Notify order success (order ID, net total)
```

---

**ดู:** [System Architecture →](architecture.md)