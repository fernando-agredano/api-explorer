export const PROJECTS = [
  {
    id: 'p1',
    name: 'P1 — FastAPI',
    arch: 'Layered Architecture',
    tech: 'Python',
    color: 'var(--p1)',
    colorDim: 'rgba(124,111,250,0.12)',
    icon: 'ti-api',
    ports: { local: 'http://localhost:8000', railway: '' },
    endpoints: [
      {
        id: 'register', method: 'POST', path: '/auth/register',
        label: 'Registrar usuario',
        desc: 'Crea una cuenta nueva. Devuelve el perfil del usuario creado.',
        fields: [
          { id: 'email',    label: 'Email',    type: 'email',    placeholder: 'usuario@example.com', required: true, icon: 'ti-mail' },
          { id: 'username', label: 'Username', type: 'text',     placeholder: 'usuario1',             required: true, icon: 'ti-user' },
          { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••',             required: true, icon: 'ti-lock' },
        ],
        buildBody: (v) => ({ email: v.email, username: v.username, password: v.password }),
      },
      {
        id: 'login', method: 'POST', path: '/auth/login',
        label: 'Iniciar sesión',
        desc: 'Autentica al usuario y devuelve un token JWT Bearer.',
        fields: [
          { id: 'email',    label: 'Email',    type: 'email',    placeholder: 'usuario@example.com', required: true, icon: 'ti-mail' },
          { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••',            required: true, icon: 'ti-lock' },
        ],
        buildBody: (v) => ({ email: v.email, password: v.password }),
      },
      {
        id: 'tasks-get', method: 'GET', path: '/tasks/',
        label: 'Listar tareas',
        desc: 'Devuelve todas las tareas del usuario autenticado. Acepta filtros opcionales.',
        fields: [
          { id: 'status',   label: 'Status',    type: 'select', options: ['', 'pending', 'in_progress', 'done'],    icon: 'ti-filter' },
          { id: 'priority', label: 'Prioridad', type: 'select', options: ['', 'low', 'medium', 'high'],             icon: 'ti-flag' },
          { id: 'limit',    label: 'Límite',    type: 'number', placeholder: '20', icon: 'ti-list-numbers' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.status) q.set('status', v.status)
          if (v.priority) q.set('priority', v.priority)
          if (v.limit) q.set('take', v.limit)
          return q.toString()
        },
        requiresAuth: true,
      },
      {
        id: 'tasks-create', method: 'POST', path: '/tasks/',
        label: 'Crear tarea',
        desc: 'Crea una tarea nueva asociada al usuario autenticado.',
        fields: [
          { id: 'title',       label: 'Título',       type: 'text',   placeholder: 'Nombre de la tarea', required: true, icon: 'ti-pencil' },
          { id: 'description', label: 'Descripción',  type: 'text',   placeholder: 'Descripción opcional',               icon: 'ti-align-left' },
          { id: 'priority',    label: 'Prioridad',    type: 'chips',  options: ['low', 'medium', 'high'], default: 'medium', icon: 'ti-flag' },
        ],
        buildBody: (v) => ({ title: v.title, description: v.description, priority: v.priority || 'medium' }),
        requiresAuth: true,
      },
      {
        id: 'tasks-update', method: 'PUT', path: '/tasks/{id}',
        label: 'Actualizar tarea',
        desc: 'Modifica campos de una tarea existente. Todos los campos son opcionales.',
        fields: [
          { id: 'task_id',  label: 'Task ID', type: 'text', placeholder: '1', required: true, icon: 'ti-id' },
          { id: 'title',    label: 'Título',  type: 'text', placeholder: 'Nuevo título',       icon: 'ti-pencil' },
          { id: 'status',   label: 'Status',  type: 'chips', options: ['pending', 'in_progress', 'done'], icon: 'ti-refresh' },
          { id: 'priority', label: 'Prioridad', type: 'chips', options: ['low', 'medium', 'high'], icon: 'ti-flag' },
        ],
        buildBody: (v) => {
          const b = {}
          if (v.title) b.title = v.title
          if (v.status) b.status = v.status
          if (v.priority) b.priority = v.priority
          return b
        },
        buildPath: (v) => `/tasks/${v.task_id}`,
        requiresAuth: true,
      },
      {
        id: 'tasks-delete', method: 'DELETE', path: '/tasks/{id}',
        label: 'Eliminar tarea',
        desc: 'Elimina permanentemente una tarea del usuario autenticado.',
        fields: [
          { id: 'task_id', label: 'Task ID', type: 'text', placeholder: '1', required: true, icon: 'ti-id' },
        ],
        buildPath: (v) => `/tasks/${v.task_id}`,
        requiresAuth: true,
      },
    ],
  },
  {
    id: 'p2',
    name: 'P2 — Flask',
    arch: 'Hexagonal Architecture',
    tech: 'Python',
    color: 'var(--p2)',
    colorDim: 'rgba(45,212,160,0.12)',
    icon: 'ti-bell',
    ports: { local: 'http://localhost:5000', railway: '' },
    endpoints: [
      {
        id: 'notif-send', method: 'POST', path: '/notifications/send',
        label: 'Enviar notificación',
        desc: 'Envía una notificación por el canal elegido. Devuelve el estado del envío.',
        fields: [
          { id: 'recipient', label: 'Destinatario', type: 'text',  placeholder: 'usuario@example.com', required: true, icon: 'ti-user' },
          { id: 'subject',   label: 'Asunto',       type: 'text',  placeholder: 'Asunto del mensaje',  required: true, icon: 'ti-heading' },
          { id: 'body',      label: 'Mensaje',      type: 'text',  placeholder: 'Cuerpo del mensaje',  required: true, icon: 'ti-message' },
          { id: 'channel',   label: 'Canal',        type: 'chips', options: ['email', 'sms', 'in_app'], default: 'email', icon: 'ti-broadcast' },
        ],
        buildBody: (v) => ({ recipient: v.recipient, subject: v.subject, body: v.body, channel: v.channel || 'email' }),
      },
      {
        id: 'notif-status', method: 'GET', path: '/notifications/{id}/status',
        label: 'Estado de notificación',
        desc: 'Consulta el estado actual de una notificación por su ID.',
        fields: [
          { id: 'notif_id', label: 'Notification ID', type: 'text', placeholder: 'uuid-de-la-notificacion', required: true, icon: 'ti-id-badge' },
        ],
        buildPath: (v) => `/notifications/${v.notif_id}/status`,
      },
      {
        id: 'notif-history', method: 'GET', path: '/notifications/history',
        label: 'Historial',
        desc: 'Lista todas las notificaciones enviadas con filtros opcionales.',
        fields: [
          { id: 'status',  label: 'Status', type: 'select', options: ['', 'pending', 'sent', 'failed'], icon: 'ti-filter' },
          { id: 'channel', label: 'Canal',  type: 'select', options: ['', 'email', 'sms', 'in_app'],    icon: 'ti-broadcast' },
          { id: 'limit',   label: 'Límite', type: 'number', placeholder: '20',                          icon: 'ti-list-numbers' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.status) q.set('status', v.status)
          if (v.channel) q.set('channel', v.channel)
          if (v.limit) q.set('limit', v.limit)
          return q.toString()
        },
      },
      {
        id: 'notif-retry', method: 'POST', path: '/notifications/retry/{id}',
        label: 'Reintentar envío',
        desc: 'Reintenta el envío de una notificación fallida (máx. 3 intentos).',
        fields: [
          { id: 'notif_id', label: 'Notification ID', type: 'text', placeholder: 'uuid-de-la-notificacion', required: true, icon: 'ti-id-badge' },
        ],
        buildPath: (v) => `/notifications/retry/${v.notif_id}`,
      },
    ],
  },
  {
    id: 'n1',
    name: 'N1 — Express',
    arch: 'Clean Architecture',
    tech: 'Node.js',
    color: 'var(--n1)',
    colorDim: 'rgba(245,166,35,0.12)',
    icon: 'ti-shopping-cart',
    ports: { local: 'http://localhost:3000', railway: '' },
    endpoints: [
      {
        id: 'products-list', method: 'GET', path: '/api/products',
        label: 'Listar productos',
        desc: 'Devuelve todos los productos. Acepta filtros por categoría y rango de precio.',
        fields: [
          { id: 'category', label: 'Categoría',  type: 'text',   placeholder: 'electronica, ropa...', icon: 'ti-tag' },
          { id: 'minPrice', label: 'Precio mín', type: 'number', placeholder: '0',                    icon: 'ti-currency-dollar' },
          { id: 'maxPrice', label: 'Precio máx', type: 'number', placeholder: '99999',                icon: 'ti-currency-dollar' },
          { id: 'take',     label: 'Límite',     type: 'number', placeholder: '20',                   icon: 'ti-list-numbers' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.category) q.set('category', v.category)
          if (v.minPrice) q.set('minPrice', v.minPrice)
          if (v.maxPrice) q.set('maxPrice', v.maxPrice)
          if (v.take) q.set('take', v.take)
          return q.toString()
        },
      },
      {
        id: 'products-create', method: 'POST', path: '/api/products',
        label: 'Crear producto',
        desc: 'Agrega un nuevo producto al catálogo.',
        fields: [
          { id: 'name',        label: 'Nombre',      type: 'text',   placeholder: 'Laptop Pro',  required: true, icon: 'ti-pencil' },
          { id: 'description', label: 'Descripción', type: 'text',   placeholder: 'Descripción opcional',         icon: 'ti-align-left' },
          { id: 'price',       label: 'Precio',      type: 'number', placeholder: '0.00',        required: true, icon: 'ti-currency-dollar' },
          { id: 'stock',       label: 'Stock',       type: 'number', placeholder: '0',                           icon: 'ti-package' },
          { id: 'category',    label: 'Categoría',   type: 'text',   placeholder: 'electronica', required: true, icon: 'ti-tag' },
        ],
        buildBody: (v) => ({ name: v.name, description: v.description, price: Number(v.price), stock: Number(v.stock) || 0, category: v.category }),
      },
      {
        id: 'products-update', method: 'PUT', path: '/api/products/{id}',
        label: 'Actualizar producto',
        desc: 'Modifica precio, stock o categoría de un producto. Todos los campos son opcionales.',
        fields: [
          { id: 'product_id',  label: 'Product ID',  type: 'text',   placeholder: 'uuid del producto', required: true, icon: 'ti-id' },
          { id: 'price',       label: 'Nuevo precio', type: 'number', placeholder: '0.00',               icon: 'ti-currency-dollar' },
          { id: 'stock',       label: 'Nuevo stock',  type: 'number', placeholder: '0',                  icon: 'ti-package' },
          { id: 'category',    label: 'Categoría',    type: 'text',   placeholder: 'electronica',        icon: 'ti-tag' },
        ],
        buildBody: (v) => {
          const b = {}
          if (v.price) b.price = Number(v.price)
          if (v.stock !== '') b.stock = Number(v.stock)
          if (v.category) b.category = v.category
          return b
        },
        buildPath: (v) => `/api/products/${v.product_id}`,
      },
      {
        id: 'orders-create', method: 'POST', path: '/api/orders',
        label: 'Crear orden',
        desc: 'Crea una nueva orden. Descuenta stock automáticamente. Devuelve la orden con total calculado.',
        fields: [
          { id: 'customerId', label: 'Customer ID', type: 'text',   placeholder: 'cliente-001',        required: true, icon: 'ti-user' },
          { id: 'productId',  label: 'Product ID',  type: 'text',   placeholder: 'uuid del producto',  required: true, icon: 'ti-id' },
          { id: 'quantity',   label: 'Cantidad',    type: 'number', placeholder: '1',                  required: true, icon: 'ti-number' },
        ],
        buildBody: (v) => ({ customerId: v.customerId, items: [{ productId: v.productId, quantity: Number(v.quantity) }] }),
      },
      {
        id: 'orders-list', method: 'GET', path: '/api/orders',
        label: 'Listar órdenes',
        desc: 'Devuelve todas las órdenes. Filtra por cliente o por status.',
        fields: [
          { id: 'customerId', label: 'Customer ID', type: 'text',   placeholder: 'cliente-001',             icon: 'ti-user' },
          { id: 'status',     label: 'Status',      type: 'select', options: ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], icon: 'ti-filter' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.customerId) q.set('customerId', v.customerId)
          if (v.status) q.set('status', v.status)
          return q.toString()
        },
      },
      {
        id: 'orders-status', method: 'PUT', path: '/api/orders/{id}/status',
        label: 'Cambiar estado de orden',
        desc: 'Avanza el estado de la orden siguiendo la máquina de estados: pending → confirmed → shipped → delivered.',
        fields: [
          { id: 'order_id', label: 'Order ID', type: 'text',  placeholder: 'uuid de la orden', required: true, icon: 'ti-id' },
          { id: 'status',   label: 'Nuevo status', type: 'chips', options: ['confirmed', 'shipped', 'delivered', 'cancelled'], icon: 'ti-refresh' },
        ],
        buildBody: (v) => ({ status: v.status }),
        buildPath: (v) => `/api/orders/${v.order_id}/status`,
      },
    ],
  },
  {
    id: 'n2',
    name: 'N2 — Fastify',
    arch: 'CQRS + Event-Driven',
    tech: 'Node.js',
    color: 'var(--n2)',
    colorDim: 'rgba(240,96,96,0.12)',
    icon: 'ti-topology-star',
    ports: { local: 'http://localhost:3001', railway: '' },
    endpoints: [
      {
        id: 'items-list', method: 'GET', path: '/inventory/items',
        label: 'Listar ítems',
        desc: 'Query: devuelve todos los ítems del inventario. Solo lee, sin efectos secundarios.',
        fields: [
          { id: 'category', label: 'Categoría',       type: 'text',   placeholder: 'electronica...',     icon: 'ti-tag' },
          { id: 'lowStock', label: 'Solo stock bajo',  type: 'chips',  options: ['true', 'false'], default: 'false', icon: 'ti-alert-triangle' },
          { id: 'take',     label: 'Límite',           type: 'number', placeholder: '20',                icon: 'ti-list-numbers' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.category) q.set('category', v.category)
          if (v.lowStock === 'true') q.set('lowStock', 'true')
          if (v.take) q.set('take', v.take)
          return q.toString()
        },
      },
      {
        id: 'items-get', method: 'GET', path: '/inventory/items/{id}',
        label: 'Ver ítem',
        desc: 'Query: devuelve los detalles de un ítem específico.',
        fields: [
          { id: 'item_id', label: 'Item ID', type: 'text', placeholder: 'uuid del ítem', required: true, icon: 'ti-id' },
        ],
        buildPath: (v) => `/inventory/items/${v.item_id}`,
      },
      {
        id: 'items-create', method: 'POST', path: '/inventory/items',
        label: 'Crear ítem',
        desc: 'Command: crea un ítem y publica el evento item.created en el bus.',
        fields: [
          { id: 'sku',         label: 'SKU',             type: 'text',   placeholder: 'LAP-001',  required: true, icon: 'ti-barcode' },
          { id: 'name',        label: 'Nombre',          type: 'text',   placeholder: 'Laptop Pro', required: true, icon: 'ti-pencil' },
          { id: 'quantity',    label: 'Cantidad inicial', type: 'number', placeholder: '10',                       icon: 'ti-package' },
          { id: 'minStock',    label: 'Stock mínimo',    type: 'number', placeholder: '5',                        icon: 'ti-alert-triangle' },
          { id: 'unitPrice',   label: 'Precio unitario', type: 'number', placeholder: '0.00',     required: true, icon: 'ti-currency-dollar' },
          { id: 'category',    label: 'Categoría',       type: 'text',   placeholder: 'electronica', required: true, icon: 'ti-tag' },
        ],
        buildBody: (v) => ({ sku: v.sku, name: v.name, quantity: Number(v.quantity) || 0, minStock: Number(v.minStock) || 5, unitPrice: Number(v.unitPrice), category: v.category }),
      },
      {
        id: 'stock-update', method: 'PUT', path: '/inventory/items/{id}/stock',
        label: 'Actualizar stock',
        desc: 'Command: registra entrada, salida o ajuste. Publica stock.updated. Si stock ≤ mínimo, dispara alerta.',
        fields: [
          { id: 'item_id',  label: 'Item ID',  type: 'text',   placeholder: 'uuid del ítem', required: true, icon: 'ti-id' },
          { id: 'type',     label: 'Tipo',     type: 'chips',  options: ['in', 'out', 'adjust'], default: 'in', icon: 'ti-arrows-exchange' },
          { id: 'quantity', label: 'Cantidad', type: 'number', placeholder: '10', required: true,            icon: 'ti-number' },
          { id: 'reason',   label: 'Razón',    type: 'text',   placeholder: 'Venta, Reposición...', icon: 'ti-notes' },
        ],
        buildBody: (v) => ({ type: v.type || 'in', quantity: Number(v.quantity), reason: v.reason }),
        buildPath: (v) => `/inventory/items/${v.item_id}/stock`,
      },
      {
        id: 'low-stock', method: 'GET', path: '/inventory/items/low-stock',
        label: 'Stock bajo',
        desc: 'Query: ítems con stock igual o menor al mínimo configurado. No requiere parámetros.',
        fields: [],
        noParams: true,
      },
      {
        id: 'movements', method: 'GET', path: '/inventory/items/{id}/movements',
        label: 'Movimientos',
        desc: 'Query: historial completo de entradas, salidas y ajustes de un ítem.',
        fields: [
          { id: 'item_id', label: 'Item ID', type: 'text', placeholder: 'uuid del ítem', required: true, icon: 'ti-id' },
        ],
        buildPath: (v) => `/inventory/items/${v.item_id}/movements`,
      },
      {
        id: 'events-log', method: 'GET', path: '/inventory/events/log',
        label: 'Log de eventos',
        desc: 'Query: todos los eventos que pasaron por el bus de eventos, con su payload completo.',
        fields: [
          { id: 'limit', label: 'Límite', type: 'number', placeholder: '50', icon: 'ti-list-numbers' },
        ],
        buildQuery: (v) => {
          const q = new URLSearchParams()
          if (v.limit) q.set('limit', v.limit)
          return q.toString()
        },
      },
    ],
  },
]
