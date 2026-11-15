# MeVe - Marketplace Hiperlocal de Cercanía

**Universidad Tecnológica Nacional (UTN) - Tecnicatura Universitaria en Programación a Distancia**
**Materia:** Trabajo Integrador Final
**Grupo:** 152
**Tutor:** Sergio Andrés Antonini

---

## 📝 Descripción del Proyecto
**MeVe** introduce un ecosistema O2O Commerce (Online-to-Offline) que inyecta ingeniería de software para resolver las ineficiencias críticas del comercio informal y de proximidad. El sistema erradica la fricción transaccional y la desorganización operativa de las consultas manuales repetitivas ("¿sigue disponible?", "¿qué precio tiene?") mediante un catálogo unificado y un control de inventario en tiempo real. Conecta a los vecinos con los micro-comerciantes de su zona, ofreciendo una experiencia de compra fluida que culmina en la coordinación automatizada de un retiro físico.

## 🚀 Alcance y Funcionalidades Principales (MVP)

* **Arquitectura Multitenant:** Cada micro-comercio opera como una unidad independiente (tenant) con gestión aislada de su catálogo e inventario, mientras que la vitrina pública consolida la oferta de todos los comercios activos.
* **Motor de Proximidad:** Los resultados de búsqueda se ordenan en función de la distancia entre la ubicación del comprador y la del comercio, resuelta mediante consulta geoespacial sobre un índice dedicado.
* **Gestor Inteligente de Retiros (Click & Collect):** El sistema presenta al comprador únicamente las franjas horarias que conservan cupo, bloqueando automáticamente los turnos excedentes.
* **Checkout Protegido y Bloqueo Preventivo:** La reserva de una franja compromete temporalmente el stock (estado `PENDIENTE_PAGO`). Al confirmarse el cobro, la orden pasa a `PAGADO_CONFIRMADO` y queda habilitado el ticket de retiro. **El pago con MercadoPago está simulado** (ver la sección *Funcionalidades simuladas y limitaciones*).
* **Rollback Automatizado:** Una tarea programada libera automáticamente el cupo y el stock si el pago no se confirma en una ventana de quince minutos.
* **Accesibilidad Extrema:** Interfaz inclusiva con controles nativos para modo oscuro, ajuste de tamaño tipográfico (hasta 200%) y paletas de alto contraste adaptadas para daltonismo.
* **Gestión de Roles Asimétrica:** Perfiles definidos para SuperAdmin, Vendedor (con autenticación y token de sesión) y Guest (operación sin registro para el comprador).
* **Cierre de Operación vía WhatsApp:** Envío del comprobante de retiro mediante enlace estructurado, conectando al comprador con el vendedor exclusivamente para la coordinación final.

### ❌ Fuera del Alcance (Out of Scope)
Para garantizar la viabilidad temporal del Trabajo Final, quedan excluidos los siguientes módulos:
* Operación con fondos reales, devoluciones y resolución de disputas.
* Logística, distribución a domicilio y seguimiento de envíos.
* Plataforma de mensajería interna e integración con la API oficial de WhatsApp Business.
* Facturación electrónica e integración con organismos fiscales.
* Aplicación móvil nativa.

## 🛠️ Stack Tecnológico

* **Frontend:** React y TypeScript para la construcción de interfaces dinámicas (SPA) con tipado estático.
* **Backend:** Spring Boot (Java), Spring Security, JWT (Arquitectura MVC, autenticación stateless).
* **Base de Datos:** MongoDB Atlas (Modelo NoSQL para catálogos heterogéneos y documentos flexibles).

## 👥 Equipo de Desarrollo

* **Tiziano Caamaño** - Frontend & UI/UX
* **Fabián Cardozo** - Integración, QA & Fullstack Support
* **Lautaro Cejas** - Tech Lead, Backend & Arquitectura

---

## ⚙️ Configuración del Entorno de Desarrollo Local

### Prerrequisitos
* Java 17 o superior.
* Node.js v18+.
* Cuenta en MongoDB Atlas (URI de conexión).
* Git.

### Instalación y Ejecución

1. **Clonar el repositorio:** 
   ```bash
   git clone https://github.com/taroutn/meve.git
   cd meve
   ```

2. **Levantar el Backend (Spring Boot) y BD:**
   ```bash
   cd backend
   ```
   * Configurar la variable de entorno `MONGO_URI` localmente o mediante el archivo `.env` en la raíz del backend.
   * Levantar la aplicación con el wrapper de Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   * **Nota sobre variables de entorno:** El comando de Maven no lee el archivo `.env` de forma nativa. Si ejecutás por consola, pasá la variable directamente:
     ```bash
     MONGO_URI="tu_uri_aqui" ./mvnw spring-boot:run
     ```
   * **Alternativa para IDEs:** Si usás VS Code, levantá el proyecto desde la pestaña "Run and Debug" (esto lee el `launch.json` que inyecta el `.env`). Si usás IntelliJ IDEA, agregá la URI en el campo "Environment Variables" de tu Run Configuration.
   * **Variables de entorno de seguridad:** además de `MONGO_URI`, el backend necesita `MEVE_JWT_SECRET` (clave para firmar los tokens, mínimo 32 caracteres; cada uno usa la suya). Opcional: con `MEVE_SEED_PASSWORD` se crean al arrancar tres usuarios de prueba si no existen (`admin@meve.test`, `burger@meve.test`, `otro@meve.test`). Opcional: `MEVE_CORS_ORIGINS` con las URLs del frontend que pueden usar la API, separadas por coma (si no se define, solo se permite `http://localhost:5173`).
   * **Prueba de Aislamiento de Datos (Multitenant):**
     1. `POST /api/auth/login` con un usuario vendedor. La colección de Postman guarda el token en `{{token}}`.
     2. `POST /api/productos` con `Authorization: Bearer <token>`: el producto se crea en el comercio del token, aunque el body indique otro.
     3. `GET /api/comercios/{id}/pedidos` con el token de un vendedor de otro comercio responde `403`.

3. **Levantar el Frontend (React + TypeScript):**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   * Ingresar a `http://localhost:5173/`.
   * **Pruebas de UI Shell y Enrutamiento:** Verificar que el Navbar superior se mantenga fijo al navegar entre "Inicio" y "Comercios", y que los colores correspondan a la paleta oficial (verde salvia, celeste, beige).
   * **Prueba de Accesibilidad:** Aplicar zoom en el navegador para verificar la adaptabilidad del texto (uso de unidades relativas `rem`).
   * Revisar la consola para constatar la ausencia de advertencias de tipado. Opcionalmente, correr `npm run lint`.

---

## 🌐 Despliegue

### URLs públicas
* **Frontend:** _pendiente_
* **Backend (API):** _pendiente_

### Backend (Render, con Docker)
El backend se despliega con el archivo `backend/Dockerfile`, que compila el proyecto con Maven y lo ejecuta en una imagen liviana de Java 21. En Railway la configuración es equivalente.

* **Tipo de servicio:** Web Service, entorno **Docker**.
* **Root Directory:** `backend`
* **Variables de entorno:**

| Variable | Obligatoria | Para qué sirve |
|---|---|---|
| `MONGO_URI` | Sí | Cadena de conexión a MongoDB Atlas. |
| `MEVE_JWT_SECRET` | Sí | Clave para firmar los tokens (mínimo 32 caracteres). |
| `MEVE_CORS_ORIGINS` | Sí | URL del frontend desplegado (y `http://localhost:5173` si se quiere probar desde local), separadas por coma y sin barra final. Ejemplo: `https://meve.vercel.app,http://localhost:5173`. |
| `MEVE_SEED_PASSWORD` | No | Crea los usuarios de prueba al arrancar. |

* **Puerto:** lo define la plataforma con la variable `PORT`, y el backend la toma automáticamente (en local se usa `8080` o el valor de `SERVER_PORT`).
* **Zona horaria:** la imagen fija `America/Argentina/Buenos_Aires`, para que el panel de "pedidos del día" use la fecha local y no la del servidor (UTC).
* **MongoDB Atlas:** en *Network Access* hay que permitir las IPs del servicio. El plan gratuito de Render no tiene IP fija, por eso se habilita `0.0.0.0/0`.

### Orden de despliegue
1. Desplegar el backend y obtener su URL pública.
2. Desplegar el frontend apuntando a esa URL.
3. Cargar la URL del frontend en `MEVE_CORS_ORIGINS` del backend y reiniciarlo.

## ⚠️ Funcionalidades simuladas y limitaciones

* **Pago con MercadoPago (simulado):** al crear el pedido, el backend genera una preferencia ficticia (`PREF-SBX-<ticket>`) y un enlace `sandboxInitPoint` que no abre un checkout real: no hay integración con la API de MercadoPago. El pago se confirma de dos maneras:
  * El vendedor lo marca como pagado: `PATCH /api/pedidos/{id}/confirmar-pago` (requiere el token de un vendedor de ese comercio).
  * Se simula la notificación de MercadoPago: `POST /api/pedidos/webhook?pedidoId=<id o código de ticket>&data.id=<id del pago>`. Es idempotente: si el pedido ya estaba pagado o retirado lo devuelve sin cambios, y si expiró responde `409`.
* **Webhook sin validación de firma:** el endpoint del webhook es público y no verifica la firma `x-signature` de MercadoPago, así que cualquiera que conozca el id del pedido o el código del ticket podría marcarlo como pagado. En una integración real, el backend debe validar esa firma antes de confirmar el pago.
* **Plan gratuito de hosting:** si el backend corre en el plan gratuito de Render, el servicio se suspende tras un período sin uso y la primera petición puede demorar en responder.