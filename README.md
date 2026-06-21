# API Explorer

## React · Vite · Interfaz centralizada para 4 backends con distintas arquitecturas

---

## Qué es esto

API Explorer es una interfaz web tipo Postman que centraliza el acceso a cuatro proyectos backend independientes, cada uno implementado con una arquitectura diferente. Permite explorar y ejecutar todos sus endpoints desde un único lugar, sin abrir Postman ni la terminal.

Los cuatro backends que integra:

| ID | Proyecto | Stack | Arquitectura |
|----|----------|-------|--------------|
| P1 | `python-fastapi-tasks` | Python · FastAPI · SQLite | Layered / N-Tier + JWT |
| P2 | `python-flask-hexagonal` | Python · Flask · SQLAlchemy | Hexagonal (Ports & Adapters) |
| N1 | `node-express-clean` | Node 22 · Express · SQLite | Clean Architecture |
| N2 | `node-fastify-cqrs` | Node 22 · Fastify · SQLite | CQRS + Event-Driven |

---

## La interfaz

```
┌──────────────────────────────────────────────────────────────┐
│  [P1] [P2] [N1] [N2]              Toggle Local / Render  ⚙  │
├──────────────┬───────────────────────────────────────────────┤
│              │  POST  /auth/register                         │
│   Sidebar    │  ─────────────────────────────────────────    │
│              │  [Form / JSON]           [Visual / Raw]       │
│  ● P1 FastAPI│                          │                    │
│    Auth      │  ┌──────────────────┐   │  ┌──────────────┐  │
│    › register│  │ email            │   │  │ Card con     │  │
│    › login   │  │ username         │   │  │ la respuesta │  │
│    Tasks     │  │ password         │   │  │ interpretada │  │
│    › list    │  │                  │   │  │              │  │
│    › create  │  │  [Enviar →]      │   │  │ 201 · 48ms   │  │
│    › update  │  └──────────────────┘   │  └──────────────┘  │
│    › delete  │                         │                    │
│              │                         │                    │
│  ● P2 Flask  │                         │                    │
│  ● N1 Express│                         │                    │
│  ● N2 Fastify│                         │                    │
└──────────────┴─────────────────────────┴────────────────────┘
```

### Sidebar

Lista todos los proyectos y sus endpoints organizados por sección. Al seleccionar un endpoint, el panel principal se actualiza con sus formularios, método HTTP, URL y ejemplos predefinidos.

### Panel izquierdo — Form / JSON

Dos modos para construir el request:

- **Form**: formularios con inputs tipados (text, number, select, chips). Los campos tienen valores de ejemplo predefinidos y el body JSON se construye automáticamente.
- **JSON**: editor libre estilo Postman. Editas el body directamente con syntax highlighting.

La URL se forma dinámicamente según el endpoint seleccionado, incluyendo path params (`{id}`) y query params.

### Panel derecho — Visual / Raw

Dos modos para ver la respuesta:

- **Visual**: muestra la respuesta interpretada como cards con campos etiquetados, badges de status HTTP, tiempo de respuesta y colores semánticos por método (GET verde, POST azul, PUT ámbar, DELETE rojo).
- **Raw**: JSON crudo con syntax highlighting y botón de copiar.

### Toggle Local / Render

Cambia entre apuntar a `localhost` (con el puerto de cada proyecto) o a las URLs de producción en Render. Se conmuta con el botón en la barra superior.

### Panel de ajustes (⚙)

Abre el panel de configuración donde puedes:

- **Token JWT**: pégalo aquí después de hacer login en P1. Se adjunta automáticamente como `Authorization: Bearer <token>` en todos los endpoints que requieren autenticación.
- **URLs de Render**: las URLs de producción de cada backend, precargadas con los valores del deploy actual.

---

## Requisitos previos

- **Node.js 18+**

---

## Cómo correr localmente

```bash
# 1. Instala dependencias
npm install

# 2. Corre el servidor de desarrollo
npm run dev
```

Abre **http://localhost:5173** en tu navegador.

> Para que la interfaz llame correctamente a los backends en modo Local, asegúrate de que cada proyecto esté corriendo en su puerto:
> - P1 FastAPI → `http://localhost:8000`
> - P2 Flask → `http://localhost:5000`
> - N1 Express → `http://localhost:3000`
> - N2 Fastify → `http://localhost:3001`

---

## Estructura del proyecto

```
api-explorer/
├── index.html
├── vite.config.js
├── vercel.json                  # Config de deploy en Vercel
└── src/
    ├── main.jsx
    ├── App.jsx                  # Lógica principal, estado, toggle de modos
    ├── components/
    │   ├── Sidebar.jsx          # Navegación por proyectos y endpoints
    │   ├── DynamicForm.jsx      # Formularios generados desde la config de endpoints
    │   ├── JsonView.jsx         # Editor JSON con syntax highlighting
    │   └── VisualResponse.jsx   # Cards de respuesta interpretada
    ├── data/
    │   └── projects.js          # Definición de los 4 proyectos y sus endpoints
    ├── hooks/
    │   └── useRequest.js        # Hook para ejecutar fetch y manejar estado de respuesta
    └── styles/
```

---

## Despliegue en Vercel

El frontend está desplegado en **Vercel** (configurado en `vercel.json`).

### Pasos para desplegar

1. Instala la CLI de Vercel (o usa la integración con GitHub):

```bash
npm install -g vercel
```

2. Desde la raíz del proyecto:

```bash
vercel
```

3. Vercel detecta automáticamente Vite como framework. El build command es `npm run build` y el output directory es `dist`.

4. Una vez desplegado, actualiza las URLs de Render en `src/App.jsx` si es necesario, o configúralas directamente desde el panel ⚙ en la interfaz.

> No requiere variables de entorno. Las URLs de los backends se configuran en tiempo de ejecución desde el panel de ajustes.

---

## Proyectos backend relacionados

Cada backend tiene su propio repositorio/carpeta con su README detallado:

- [`node-express-clean`](../node-express-clean/README.md) — E-commerce API · Clean Architecture
- [`node-fastify-cqrs`](../node-fastify-cqrs/README.md) — Inventory API · CQRS + Event-Driven
- [`python-fastapi-tasks`](../python-fastapi-tasks/README.md) — Task Manager API · Layered Architecture
- [`python-flask-hexagonal`](../python-flask-hexagonal/README.md) — Notifications API · Hexagonal Architecture
