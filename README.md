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
* **Checkout Protegido y Bloqueo Preventivo:** La reserva de una franja compromete temporalmente el stock (estado `PENDIENTE_PAGO`). Se deriva al comprador al entorno Sandbox de MercadoPago; si se aprueba el cobro, se consolida la orden (`PAGADO_CONFIRMADO`) y se emite el ticket.
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
   * **Prueba de Aislamiento de Datos (Multitenant):** 
     1. Realizar un `POST` a `/api/comercios` para registrar un tenant y copiar su `id`.
     2. Enviar peticiones a `/api/productos` enviando el header `X-Tenant-ID: <id_del_comercio>` para validar el aislamiento automático de datos.

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
