# API Explorer — Manual de uso

Interfaz web para interactuar con los 4 proyectos backend. Funciona en modo **Visual** (formularios + cards) y modo **JSON** (estilo Postman).

---

## Cómo correr localmente

### Requisitos
- Node.js 18+

### Pasos

```bash
# 1. Entra a la carpeta
cd api-explorer

# 2. Instala dependencias
npm install

# 3. Corre el servidor de desarrollo
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

> Para que la interfaz pueda llamar a los backends, asegúrate de que cada proyecto también esté corriendo en su puerto correspondiente (P1: 8000, P2: 5000, N1: 3000, N2: 3001).

---

## Controles de la interfaz

### Toggle Visual / JSON
- **Visual**: muestra formularios con inputs, selects y chips para cada endpoint. La respuesta se presenta como cards interpretadas.
- **JSON**: modo clásico estilo Postman. Editas el body manualmente y la respuesta aparece con syntax highlighting.

### Toggle Local / Railway
- **Local**: apunta a `localhost` con el puerto de cada proyecto.
- **Railway**: usa las URLs que configures en el panel de ajustes.

### Panel de ajustes (ícono ⚙)
Aquí configuras:
- **Token JWT**: pégalo aquí después de hacer login. Se adjunta automáticamente en todos los endpoints que requieren autenticación (`Authorization: Bearer <token>`).
- **URLs Railway**: cuando despliegues los proyectos, pega las URLs públicas aquí para cambiar entre local y producción.

---

## P1 — FastAPI · Layered Architecture
**Puerto local:** `http://localhost:8000`

---

### POST `/auth/register` — Registrar usuario

Crea una cuenta nueva en el sistema.

**Qué mandas:**
```json
{
  "email": "usuario@example.com",
  "username": "usuario1",
  "password": "mipassword123"
}
```

**Qué obtienes:**
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "username": "usuario1",
  "is_active": true,
  "created_at": "2025-06-17T18:30:00Z"
}
```

**Errores posibles:**
- `400` — El email ya está registrado
- `400` — El username ya está en uso
- `422` — Campos faltantes o formato inválido

---

### POST `/auth/login` — Iniciar sesión

Autentica al usuario y devuelve un token JWT.

**Qué mandas:**
```json
{
  "email": "usuario@example.com",
  "password": "mipassword123"
}
```

**Qué obtienes:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

> Copia el `access_token` y pégalo en el campo **Token JWT** del panel de ajustes (ícono ⚙). Todos los endpoints de tareas lo necesitan.

---

### GET `/tasks/` — Listar tareas

Devuelve todas las tareas del usuario autenticado. Requiere token.

**Filtros opcionales (query params):**
| Parámetro | Tipo | Ejemplo |
|---|---|---|
| `status` | string | `pending`, `in_progress`, `done` |
| `priority` | string | `low`, `medium`, `high` |
| `limit` | number | `10` |

**Qué obtienes:**
```json
[
  {
    "id": 1,
    "title": "Aprender CQRS",
    "description": "Estudiar el patrón",
    "status": "pending",
    "priority": "high",
    "owner_id": 1,
    "created_at": "2025-06-17T18:30:00Z"
  }
]
```

---

### POST `/tasks/` — Crear tarea

Crea una nueva tarea. Requiere token.

**Qué mandas:**
```json
{
  "title": "Aprender CQRS",
  "description": "Estudiar el patrón",
  "priority": "high"
}
```

Valores válidos para `priority`: `low`, `medium`, `high`

**Qué obtienes:** La tarea creada con `status: "pending"` y su `id`.

---

### PUT `/tasks/{id}` — Actualizar tarea

Modifica una tarea existente. Todos los campos son opcionales. Requiere token.

**Qué mandas** (solo los campos que quieres cambiar):
```json
{
  "status": "in_progress",
  "priority": "medium"
}
```

Valores válidos para `status`: `pending`, `in_progress`, `done`

---

### DELETE `/tasks/{id}` — Eliminar tarea

Elimina permanentemente la tarea. Requiere token.

**Qué obtienes:**
```json
{ "message": "Tarea eliminada correctamente" }
```

---

## P2 — Flask · Hexagonal Architecture
**Puerto local:** `http://localhost:5000`

No requiere autenticación. El dominio está completamente desacoplado de Flask.

---

### POST `/notifications/send` — Enviar notificación

Envía una notificación por el canal elegido (simulado).

**Qué mandas:**
```json
{
  "recipient": "usuario@example.com",
  "subject": "Bienvenido al sistema",
  "body": "Tu cuenta fue activada exitosamente.",
  "channel": "email"
}
```

Valores válidos para `channel`: `email`, `sms`, `in_app`

**Qué obtienes:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "recipient": "usuario@example.com",
  "subject": "Bienvenido al sistema",
  "status": "sent",
  "channel": "email",
  "retry_count": 0,
  "created_at": "2025-06-17T18:30:00Z",
  "sent_at": "2025-06-17T18:30:01Z"
}
```

> Guarda el `id` que devuelve para usarlo en los endpoints de status y retry.

---

### GET `/notifications/{id}/status` — Estado de notificación

Consulta el estado actual de una notificación.

**Qué obtienes:** El objeto completo de la notificación con su `status` actual.

Posibles valores de `status`:
- `pending` — pendiente de envío
- `sent` — enviada correctamente
- `failed` — falló el envío

---

### GET `/notifications/history` — Historial

Lista todas las notificaciones con filtros opcionales.

**Filtros (query params):**
| Parámetro | Valores |
|---|---|
| `status` | `pending`, `sent`, `failed` |
| `channel` | `email`, `sms`, `in_app` |
| `limit` | número (default 20) |

**Qué obtienes:**
```json
{
  "items": [...],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### POST `/notifications/retry/{id}` — Reintentar envío

Reintenta el envío de una notificación que falló. Máximo 3 intentos.

**Qué obtienes:** La notificación actualizada con el nuevo `status` y `retry_count` incrementado.

**Error:** `422` si el status no es `failed` o ya se alcanzaron los 3 reintentos.

---

## N1 — Express · Clean Architecture
**Puerto local:** `http://localhost:3000`

No requiere autenticación.

---

### GET `/api/products` — Listar productos

Devuelve todos los productos del catálogo.

**Filtros (query params):**
| Parámetro | Ejemplo |
|---|---|
| `category` | `electronica` |
| `minPrice` | `1000` |
| `maxPrice` | `50000` |
| `take` | `10` |

**Qué obtienes:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Pro",
      "price": 25999.99,
      "stock": 8,
      "category": "electronica"
    }
  ],
  "count": 1
}
```

---

### POST `/api/products` — Crear producto

Agrega un nuevo producto al catálogo.

**Qué mandas:**
```json
{
  "name": "Laptop Pro 15",
  "description": "Laptop de alto rendimiento",
  "price": 25999.99,
  "stock": 10,
  "category": "electronica"
}
```

**Qué obtienes:** El producto creado con su `id` (UUID).

---

### PUT `/api/products/{id}` — Actualizar producto

Modifica precio, stock o categoría. Todos los campos son opcionales.

**Qué mandas:**
```json
{
  "price": 22999.99,
  "stock": 15
}
```

---

### POST `/api/orders` — Crear orden

Crea una nueva orden. Descuenta el stock automáticamente.

**Qué mandas:**
```json
{
  "customerId": "cliente-001",
  "items": [
    { "productId": "uuid-del-producto", "quantity": 2 }
  ]
}
```

**Qué obtienes:**
```json
{
  "id": "uuid",
  "customerId": "cliente-001",
  "status": "pending",
  "total": 51999.98,
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 25999.99,
      "subtotal": 51999.98
    }
  ]
}
```

**Errores posibles:**
- `409` — Stock insuficiente
- `404` — Producto no encontrado

---

### GET `/api/orders` — Listar órdenes

**Filtros (query params):**
| Parámetro | Valores |
|---|---|
| `customerId` | `cliente-001` |
| `status` | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |

---

### PUT `/api/orders/{id}/status` — Cambiar estado de orden

Avanza el estado de la orden siguiendo la máquina de estados.

**Qué mandas:**
```json
{ "status": "confirmed" }
```

**Máquina de estados válida:**
```
pending → confirmed → shipped → delivered
pending → cancelled
confirmed → cancelled
```

**Error `409`** si intentas una transición inválida (ej. `delivered` → `pending`).

---

## N2 — Fastify · CQRS + Event-Driven
**Puerto local:** `http://localhost:3001`

Este proyecto separa **Commands** (mutan estado + publican eventos) de **Queries** (solo leen).

---

### GET `/inventory/items` — Listar ítems (Query)

Solo lee. No tiene efectos secundarios. No publica eventos.

**Filtros (query params):**
| Parámetro | Descripción |
|---|---|
| `category` | Filtra por categoría |
| `lowStock=true` | Solo ítems con stock ≤ mínimo |
| `take` | Límite de resultados |

---

### GET `/inventory/items/{id}` — Ver ítem (Query)

Devuelve detalles de un ítem específico, incluyendo `isLowStock: true/false`.

---

### POST `/inventory/items` — Crear ítem (Command)

Crea el ítem y **publica el evento `item.created`** en el bus. El EventLogHandler lo persiste y el AuditHandler lo loguea en consola.

**Qué mandas:**
```json
{
  "sku": "LAP-001",
  "name": "Laptop Pro",
  "quantity": 10,
  "minStock": 5,
  "unitPrice": 25999.99,
  "category": "electronica"
}
```

**Qué obtienes:** El ítem creado con `isLowStock: false`.

> En la consola del servidor verás: `📦 [AUDIT] Nuevo ítem creado: "Laptop Pro" | SKU: LAP-001`

---

### PUT `/inventory/items/{id}/stock` — Actualizar stock (Command)

Registra un movimiento de stock y **publica el evento `stock.updated`**. Si el nuevo stock es ≤ minStock, el StockAlertHandler dispara una alerta automática.

**Qué mandas:**
```json
{
  "type": "out",
  "quantity": 8,
  "reason": "Venta al cliente #1042"
}
```

Valores válidos para `type`:
- `in` — entrada de mercancía (suma)
- `out` — salida/venta (resta)
- `adjust` — ajuste directo al valor indicado

**Qué obtienes:**
```json
{
  "item": { "id": "...", "quantity": 2, "isLowStock": true, ... },
  "movement": { "type": "out", "before": 10, "after": 2, "quantity": 8 }
}
```

> Si `after <= minStock`, en la consola verás: `⚠️ [STOCK ALERT] "Laptop Pro" | Stock actual: 2 | Mínimo: 5`

---

### GET `/inventory/items/low-stock` — Stock bajo (Query)

Lista todos los ítems donde `quantity <= minStock`. No requiere parámetros.

**Qué obtienes:**
```json
{
  "items": [...],
  "total": 3,
  "message": "3 ítem(s) con stock bajo o en mínimo"
}
```

---

### GET `/inventory/items/{id}/movements` — Movimientos (Query)

Historial completo de entradas, salidas y ajustes de un ítem específico.

**Qué obtienes:**
```json
{
  "item": { ... },
  "movements": [
    { "type": "out", "quantity": 8, "before": 10, "after": 2, "reason": "Venta", "created_at": "..." },
    { "type": "in",  "quantity": 20, "before": 2, "after": 22, "reason": "Reposición", "created_at": "..." }
  ],
  "total": 2
}
```

---

### GET `/inventory/events/log` — Log de eventos (Query)

Devuelve todos los eventos que pasaron por el bus de eventos, con su payload completo. Muy útil para ver el sistema event-driven en acción.

**Query params:**
- `limit` — número máximo de eventos (default 50)

**Qué obtienes:**
```json
{
  "events": [
    {
      "id": "5ab4ba9c...",
      "event_name": "stock.updated",
      "payload": { "itemId": "...", "type": "out", "before": 10, "after": 2 },
      "occurred_at": "2025-06-17T18:35:00Z"
    },
    {
      "event_name": "item.created",
      "payload": { "sku": "LAP-001", "name": "Laptop Pro", "initialQuantity": 10 },
      "occurred_at": "2025-06-17T18:30:00Z"
    }
  ],
  "total": 2
}
```

---

## Flujos recomendados para explorar cada arquitectura

### P1 — Flujo completo con autenticación
1. `POST /auth/register` — registra un usuario
2. `POST /auth/login` — copia el token al panel de ajustes
3. `POST /tasks/` — crea varias tareas con distintas prioridades
4. `GET /tasks/?priority=high` — filtra por prioridad
5. `PUT /tasks/1` — cambia status a `in_progress`
6. `DELETE /tasks/1` — elimina la tarea

### P2 — Ver cómo el dominio está desacoplado
1. `POST /notifications/send` con `channel: "email"` — guarda el ID
2. `POST /notifications/send` con `channel: "sms"` — otro canal
3. `GET /notifications/history?channel=email` — filtra por canal
4. `GET /notifications/{id}/status` — consulta estado

### N1 — Probar las reglas de negocio del dominio
1. `POST /api/products` — crea un producto con `stock: 2`
2. `POST /api/orders` con `quantity: 5` — error 409 por stock insuficiente
3. `POST /api/orders` con `quantity: 1` — orden creada
4. `PUT /api/orders/{id}/status` con `"confirmed"`, luego `"shipped"`
5. Intenta `"pending"` desde `"shipped"` — error 409 de transición inválida

### N2 — Ver CQRS y eventos en acción
1. `POST /inventory/items` con `quantity: 8, minStock: 5` — crea ítem
2. `GET /inventory/events/log` — ves el evento `item.created`
3. `PUT /{id}/stock` con `type: "out", quantity: 4` — stock baja a 4 (≤ mínimo)
4. `GET /inventory/events/log` — ves `stock.updated` con alerta
5. `GET /inventory/items/low-stock` — aparece en la lista
6. `GET /{id}/movements` — historial del movimiento
