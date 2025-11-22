# /src/api - Backend API

Implementación del backend/API para la aplicación e-commerce.

## Estructura

- **controllers/** - Controladores que manejan las peticiones HTTP
  - Lógica de negocio para cada endpoint
  - Validación de entrada
  - Respuestas HTTP

- **routes/** - Definición de rutas de la API
  - Endpoints REST
  - Asociación de rutas con controladores
  - Configuración de middleware por ruta

- **models/** - Modelos de datos
  - Esquemas de base de datos
  - Validación de datos
  - Relaciones entre entidades

- **middleware/** - Middleware personalizado
  - Autenticación (JWT, OAuth)
  - Autorización (roles, permisos)
  - Validación de requests
  - Manejo de errores
  - Logging

- **services/** - Servicios del backend
  - Lógica de negocio compleja
  - Integración con servicios externos
  - Operaciones de base de datos

## Endpoints Principales

- `/api/products` - Gestión de productos
- `/api/users` - Gestión de usuarios
- `/api/cart` - Operaciones del carrito
- `/api/orders` - Gestión de pedidos
- `/api/auth` - Autenticación y autorización
- `/api/payments` - Procesamiento de pagos
