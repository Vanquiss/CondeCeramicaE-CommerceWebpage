# Estructura de Carpetas - E-Commerce Webpage

Esta es la estructura de carpetas para la aplicación de e-commerce Conde Cerámica.

## Estructura Principal

```
CondeCeramicaE-CommerceWebpage/
├── src/                    # Código fuente de la aplicación
├── public/                 # Archivos públicos estáticos
├── assets/                 # Recursos multimedia y estáticos
├── config/                 # Archivos de configuración
├── docs/                   # Documentación del proyecto
├── tests/                  # Pruebas automatizadas
└── README.md              # Documentación principal
```

## Detalle de Carpetas

### `/src` - Código Fuente
Contiene todo el código fuente de la aplicación.

- **`/src/components`** - Componentes reutilizables de la interfaz
  - `/common` - Componentes comunes (botones, modales, formularios)
  - `/products` - Componentes relacionados con productos
  - `/cart` - Componentes del carrito de compras
  - `/checkout` - Componentes del proceso de pago
  - `/user` - Componentes de usuario y perfil
  - `/navigation` - Componentes de navegación
  - `/header` - Componentes del encabezado
  - `/footer` - Componentes del pie de página

- **`/src/pages`** - Páginas/vistas de la aplicación
  - `/home` - Página principal
  - `/products` - Listado de productos
  - `/product-detail` - Detalle de producto individual
  - `/cart` - Carrito de compras
  - `/checkout` - Proceso de pago
  - `/user-profile` - Perfil de usuario
  - `/admin` - Panel de administración
  - `/orders` - Historial de pedidos

- **`/src/layouts`** - Plantillas de diseño
  - Layouts principales para diferentes secciones

- **`/src/hooks`** - Custom React Hooks (o hooks personalizados)
  - Lógica reutilizable de componentes

- **`/src/utils`** - Funciones utilitarias
  - Helpers y funciones auxiliares

- **`/src/services`** - Servicios de negocio
  - Lógica de negocio y servicios externos

- **`/src/api`** - Backend/API
  - `/controllers` - Controladores de API
  - `/routes` - Rutas de la API
  - `/models` - Modelos de datos
  - `/middleware` - Middleware (autenticación, validación)
  - `/services` - Servicios del backend

- **`/src/contexts`** - Context API (gestión de estado)
  - Contextos globales de la aplicación

- **`/src/styles`** - Estilos globales
  - CSS/SCSS global de la aplicación

### `/public` - Archivos Públicos
Archivos estáticos servidos directamente.
- index.html
- favicon.ico
- robots.txt
- manifest.json

### `/assets` - Recursos Multimedia
Recursos estáticos organizados por tipo.

- **`/assets/images`** - Imágenes
  - `/products` - Imágenes de productos
  - `/logos` - Logos de la marca
  - `/banners` - Banners promocionales
  - `/categories` - Imágenes de categorías

- **`/assets/icons`** - Iconos
  - Iconos SVG y PNG

- **`/assets/fonts`** - Fuentes tipográficas
  - Fuentes personalizadas

- **`/assets/videos`** - Videos
  - Videos promocionales o demostrativos

### `/config` - Configuración
Archivos de configuración del proyecto.
- Configuración de ambiente (dev, prod)
- Configuración de base de datos
- Configuración de servicios externos

### `/docs` - Documentación
Documentación técnica y de usuario.
- Guías de instalación
- Documentación de API
- Manuales de usuario

### `/tests` - Pruebas
Pruebas automatizadas de la aplicación.

- **`/tests/unit`** - Pruebas unitarias
  - Pruebas de componentes individuales

- **`/tests/integration`** - Pruebas de integración
  - Pruebas de integración entre módulos

- **`/tests/e2e`** - Pruebas end-to-end
  - Pruebas de flujos completos de usuario

## Convenciones

1. **Nomenclatura**: Usar kebab-case para nombres de carpetas
2. **Organización**: Mantener componentes relacionados juntos
3. **Modularidad**: Cada carpeta debe tener un propósito claro
4. **Escalabilidad**: Estructura preparada para crecer según las necesidades

## Próximos Pasos

1. Configurar el entorno de desarrollo
2. Instalar dependencias necesarias
3. Configurar herramientas de build (Webpack, Vite, etc.)
4. Implementar componentes base
5. Configurar sistema de enrutamiento
6. Implementar gestión de estado
7. Conectar con backend/API
