# Sistema de Facturación SRI — Restaurante (segundo local)

**Adrián Ramos** · Desarrollo Web · Quito, Ecuador  
**WhatsApp:** +593 97 916 5437  
**Portafolio:** [adrian-ramos.pages.dev](https://adrian-ramos.pages.dev/)

**Cliente:** Restaurante — segundo local  
**Necesidad:** Facturación electrónica conectada al **SRI** (clientes piden factura)

---

## ¿Qué es?

Sistema propio (**StockFlow**) para el **nuevo local**: registrar ventas, controlar productos del menú y emitir **facturas electrónicas autorizadas por el SRI** desde computadora o celular.

No reemplaza obligatoriamente el POS del primer local; es la solución para el **segundo local** que hoy no tiene facturación SRI integrada.

**Ya está probado:** integración con **Datil** + emisión en ambiente de pruebas SRI funcionando.

**Demo base (sin SRI en línea):** [adrian-ramos.pages.dev/demos/inventory-api/](https://adrian-ramos.pages.dev/demos/inventory-api/)

---

## Qué incluye el sistema

| Función | ✓ |
|---------|---|
| Login seguro (usuarios del local) | ✓ |
| Catálogo de productos / platos con precios | ✓ |
| Emisión de facturas (consumidor final o con datos del cliente) | ✓ |
| **Conexión al SRI** vía Datil (comprobantes autorizados) | ✓ |
| Descuento automático de stock al facturar (opcional por producto) | ✓ |
| Historial de facturas con estado SRI (AUTORIZADO, etc.) | ✓ |
| Dashboard con ventas e inventario | ✓ |
| Exportar reportes (PDF / Excel) | ✓ |
| Capacitación para usar el sistema | ✓ |

---

## Costos que paga el cliente aparte (no van en la cotización)

| Concepto | Quién | Cuánto (referencia) |
|--------|-------|---------------------|
| Plan **Datil** (facturación SRI) | Cliente → Datil | ~$8/mes (Lite) o $25/año (Mini) |
| **Firma electrónica** (.p12) | Cliente | ~$20–45/año (si no la tiene para ese RUC) |
| Comprobantes extra | Incluidos en plan Datil | Según plan |

Tú te registras en Datil con tu RUC; el dinero de las ventas y la facturación son tuyos. Yo configuro e integro el sistema.

---

# Opción 1 — Solo facturación SRI · $650

Para el segundo local: facturar legalmente al SRI sin página web nueva.

## Desglose

| Concepto | Qué incluye | Valor |
|----------|-------------|-------|
| **Desarrollo y configuración** | StockFlow adaptado al restaurante + integración Datil/SRI | **$519** |
| **Hosting servidor** | Backend + frontend en la nube, 1 año | **$120** |
| **Dominio** | Subdominio o app en servidor (sin .com nuevo) | **$11** |
| | **Total año 1** | **$650** |

### Pago

| Etapa | Monto |
|-------|-------|
| Al iniciar (50%) | **$325** |
| Al entregar y capacitar (50%) | **$325** |

**Plazo:** 15–20 días hábiles

### Incluye

- Configuración Datil + ambiente pruebas y luego producción
- Carga inicial de platos/productos (hasta ~40 ítems)
- 1 establecimiento / punto de emisión (ej. `001-002`)
- 1 usuario administrador + capacitación por videollamada (~1 h)
- Manual breve de uso

### No incluye

- Página web del local (ver Opción 2)
- Plan mensual Datil ni firma electrónica
- Hardware (impresora, tablet, PC)

---

# Opción 2 — Facturación SRI + Web del local · $850

Facturación al SRI **+** página web esencial para el segundo local (menú, horarios, mapa, WhatsApp).

## Desglose

| Concepto | Qué incluye | Valor |
|----------|-------------|-------|
| **Sistema facturación SRI** | Igual Opción 1 | **$519** |
| **Web esencial restaurante** | Menú, contacto, mapa, WhatsApp | **$99** |
| **Dominio `.com`** | 1 año (ej. `turestaurante2.com`) | **$11** |
| **Hosting** | Web + sistema, 1 año | **$221** |
| | **Total año 1** | **$850** |

### Pago

| Etapa | Monto |
|-------|-------|
| Al iniciar (50%) | **$425** |
| Al entregar (50%) | **$425** |

**Plazo:** 25–30 días hábiles

**Demo web:** [adrian-ramos.pages.dev/demos/restaurant-web-basic/](https://adrian-ramos.pages.dev/demos/restaurant-web-basic/)

---

## Comparación rápida

| | Solo SRI $650 | SRI + Web $850 |
|--|---------------|----------------|
| Facturas autorizadas SRI | ✓ | ✓ |
| Control productos / menú | ✓ | ✓ |
| Página web del local | ✗ | ✓ |
| Dominio .com propio | ✗ | ✓ |

---

## Lo que necesito del cliente

- RUC y razón social del negocio (¿mismo del primer local u otro?)
- Establecimiento y punto de emisión en el SRI (o lo gestionamos juntos)
- Firma electrónica (.p12) o datos para obtenerla
- Lista de platos con precios (puede ser el menú actual)
- Logo (si hay web)
- Cuenta Datil (te guío a crearla — ~10 min)

---

## Proceso de trabajo

1. Confirmas opción y abonas 50% inicial  
2. Registro en Datil + pruebas SRI (ambiente pruebas)  
3. Configuro productos y emitimos facturas de prueba  
4. Pasamos a **producción** (facturas reales)  
5. Capacitación y entrega  
6. Abono del 50% restante  

---

## Mensaje para enviar (WhatsApp)

```
Hola, gracias por la aclaración 🙌

Perfecto — sí puedo armarte un sistema para el otro local con facturación conectada al SRI, para que cuando tus clientes pidan factura la emitas legal y quede autorizada por el Servicio de Rentas.

Ya tengo la integración probada con el SRI (ambiente de pruebas OK). El sistema permite:
• Registrar platos/productos del menú
• Emitir factura a consumidor final o con datos del cliente
• Ver si el SRI autorizó la factura (AUTORIZADO)
• Llevar historial de ventas

Te dejo 2 opciones:

📋 SOLO FACTURACIÓN SRI — $650 (año 1, hosting incluido)
• Sistema listo para el segundo local
• Facturas electrónicas al SRI vía Datil
• Capacitación incluida
Pago: $325 al empezar, $325 al entregar
Plazo: 15–20 días

🌐 FACTURACIÓN SRI + WEB DEL LOCAL — $850 (año 1 todo incluido)
• Todo lo anterior +
• Página web con menú, horarios, mapa y WhatsApp
• Dominio .com 1 año
Pago: $425 al empezar, $425 al entregar
Plazo: 25–30 días

💡 Aparte del desarrollo, el plan Datil para el SRI lo contratas tú directo (~$8/mes). Te guío a registrarlo; el dinero de las ventas va a tu cuenta.

¿El otro local usa el mismo RUC o es otro negocio? Con eso afino el detalle.
Te adjunto la cotización completa 😊
```

---

*Propuesta válida 30 días · Precios USD · IVA según corresponda en servicios locales.*
