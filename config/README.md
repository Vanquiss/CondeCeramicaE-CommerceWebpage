# /config - Configuración

Archivos de configuración del proyecto.

## Tipos de Configuración

- **Entornos** - Configuración para desarrollo, staging y producción
  - Variables de entorno
  - URLs de API
  - Claves de servicios externos

- **Base de Datos** - Configuración de conexión a BD
  - Credenciales
  - Pools de conexión
  - Migraciones

- **Servicios Externos**
  - Pasarelas de pago (Stripe, PayPal)
  - Servicios de email
  - Almacenamiento en la nube
  - Analytics

- **Build Tools** - Configuración de herramientas
  - Webpack/Vite
  - Babel
  - TypeScript
  - Linters (ESLint, Prettier)

## Seguridad

⚠️ **IMPORTANTE**: No incluir credenciales o claves secretas en el repositorio.
Usar variables de entorno y archivos `.env` (incluidos en `.gitignore`).
