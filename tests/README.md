# /tests - Pruebas Automatizadas

Suite de pruebas para asegurar la calidad del código.

## Tipos de Pruebas

### Unit Tests (`/unit`)
Pruebas unitarias de componentes y funciones individuales.
- Componentes de UI
- Funciones utilitarias
- Hooks personalizados
- Servicios aislados

**Herramientas**: Jest, React Testing Library, Vitest

### Integration Tests (`/integration`)
Pruebas de integración entre módulos y servicios.
- Flujos completos de componentes
- Integración con API
- Operaciones de base de datos
- Servicios externos (mocked)

**Herramientas**: Jest, Supertest

### End-to-End Tests (`/e2e`)
Pruebas de flujos completos de usuario.
- Registro y login de usuarios
- Búsqueda y filtrado de productos
- Proceso completo de compra
- Gestión de pedidos

**Herramientas**: Cypress, Playwright, Selenium

## Convenciones

- Nombrar archivos con `.test.js` o `.spec.js`
- Organizar tests según la estructura de `/src`
- Mantener cobertura de código > 80%
- Ejecutar tests en CI/CD pipeline

## Comandos

```bash
npm test              # Ejecutar todas las pruebas
npm run test:unit     # Solo pruebas unitarias
npm run test:integration  # Solo pruebas de integración
npm run test:e2e      # Solo pruebas end-to-end
npm run test:coverage # Generar reporte de cobertura
```
