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

## ⚙️ Configuración del Entorno de Desarrollo

### Prerrequisitos
* Java 17 o superior.
* Node.js v18+.
* Cuenta en MongoDB Atlas (URI de conexión).

### Levantando el Backend (Spring Boot)
1. Clonar el repositorio: 
   ```bash
   git clone [https://github.com/taroutn/meve.git](https://github.com/taroutn/meve.git)
