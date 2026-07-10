## 5. System Architecture (สถาปัตยกรรมระบบ)

โครงสร้างการทำงานของโปรเจกต์ KICKZONE พัฒนาในรูปแบบ Full-Stack Web Application โดยแยกส่วน Frontend และ Backend ออกจากกันอย่างชัดเจน ดังแผนภาพด้านล่าง:

```mermaid
graph TD
    subgraph Client-Side
        A[Frontend: React.js + Vite]
    end

    subgraph Server-Side
        B(Backend: Node.js + Express.js)
    end

    subgraph Cloud-Database
        C[(PostgreSQL on Neon)]
    end

    %% Connections
    A -- "HTTP Requests (GET, POST, PUT, DELETE)" --> B
    B -- "JSON Responses" --> A
    
    B -- "SQL Queries" --> C
    C -- "Data Results" --> B

    %% Styling
    style A fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000
    style B fill:#339933,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#336791,stroke:#333,stroke-width:2px,color:#fff