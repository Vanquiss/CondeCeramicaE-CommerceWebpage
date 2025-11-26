-- 1. Tabla de Categorías (Para filtros RF-5)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Tabla de Usuarios (RF-1: Admins y futuros clientes)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client', -- 'admin', 'client', 'guest'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Productos (RF-2, RF-4, RF-11)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL, -- Usamos NUMERIC para dinero, no FLOAT
    stock INTEGER DEFAULT 0,
    image_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE, -- Producto destacado
    is_active BOOLEAN DEFAULT TRUE,    -- Para borrado lógico (RF-13)
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Noticias (RF-14)
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE     -- Para borrado lógico (RF-16)
);

-- 5. Tabla de Pedidos (Cabecera) (RF-9, RF-10)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL, -- RF-10
    total_amount NUMERIC(10, 2) NOT NULL,      -- RF-8
    status VARCHAR(50) DEFAULT 'pending',      -- 'pending', 'confirmed', 'shipped' (RF-20)
    
    -- Información del Cliente (Invitado o Registrado)
    client_name VARCHAR(100) NOT NULL,
    client_contact VARCHAR(100),
    shipping_info TEXT,
    
    user_id INTEGER REFERENCES users(id), -- Opcional, si el usuario estaba logueado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Items del Pedido (Detalle) (RF-7, RF-19)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    -- SNAPSHOTS: Guardamos estos datos para cumplir RF-19
    -- Si el producto cambia de precio o imagen mañana, el pedido histórico no cambia.
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    image_at_purchase TEXT
);

-- INSERCIÓN INICIAL (SEED) PARA PRUEBAS
-- Insertar Admin (Pass: admin123)
INSERT INTO users (name, email, password, role) 
VALUES ('Super Admin', 'admin@tienda.com', '$2b$10$T/m.0.2J0s8gH5T7tG7n6eX0/2D4vYl8yX0/4Yl7z8x1F5L3F4S5C', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar Categorías de Ejemplo
INSERT INTO categories (name) VALUES ('Platos'), ('Tazas'), ('Maceteros')
ON CONFLICT (name) DO NOTHING;