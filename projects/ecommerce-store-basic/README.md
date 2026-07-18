# TiendaNova Básica — Demo E-commerce Plan Básico

Demo interactiva del **plan básico ($450)** para emprendimientos: tienda online esencial sin cuentas de cliente ni inventario por cantidad.

## Qué incluye (alineado a la propuesta)

### Tienda (clientes)
- Inicio con información de la empresa
- Catálogo con categorías (sin filtros avanzados)
- Detalle de producto + carrito
- Pedido como **invitado** (nombre, teléfono, dirección)
- Contacto + WhatsApp

### Panel administrador
- Login solo para admin
- CRUD de productos (máx. **30**)
- Disponible / agotado manual (sin cantidades)
- Lista de pedidos con estados **Nuevo** / **Atendido**

### No incluye (plan completo)
- Registro / login de clientes
- Historial de pedidos del cliente
- Filtros por precio o disponibilidad
- Dashboard con estadísticas
- Inventario por cantidad
- Gestión de usuarios

## Credenciales demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | `admin@tianova.demo` | `admin123` |

Los datos se guardan en `localStorage` con prefijo `tianova_basic_`.

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:5181
npm run build
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/tienda` | Catálogo |
| `/checkout` | Pedido invitado |
| `/admin/login` | Acceso admin |
| `/admin/productos` | Gestión productos |
| `/admin/pedidos` | Gestión pedidos |
