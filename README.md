# MeVe - Marketplace Hiperlocal de Cercanía

**Universidad Tecnológica Nacional (UTN) - Tecnicatura Universitaria en Programación a Distancia**
**Materia:** Trabajo Integrador Final
**Grupo:** 152
**Tutor:** Sergio Andrés Antonini

---

## 📝 Descripción del Proyecto
**MeVe** es una plataforma de comercio electrónico O2O (Online-to-Offline) diseñada para digitalizar y ordenar el micro-comercio urbano. El sistema reemplaza el caos de las consultas por estados de WhatsApp mediante un catálogo centralizado y geolocalizado. Conecta a los vecinos con los emprendedores de su zona, ofreciendo una experiencia de compra fluida que culmina en la coordinación de un retiro físico y seguro, cerrando la brecha digital de los pequeños productores.

## 🚀 Alcance y Funcionalidades Principales (MVP)

* **Motor de Proximidad:** Filtrado automático de productos basado en la distancia geográfica entre el comprador y el vendedor para fomentar el comercio de cercanía.
* **Gestor Inteligente de Retiros (Click & Collect):** Sistema de turnos con cupos limitados por hora. El comprador selecciona una franja horaria disponible, evitando superposiciones y ordenando la logística del vendedor.
* **Checkout Protegido:** Integración con MercadoPago (entorno Sandbox) para garantizar la transacción y bloquear el stock temporalmente hasta la confirmación del pago mediante Webhooks.
* **Accesibilidad Extrema:** Frontend diseñado con controles nativos para modo oscuro, ajuste de tamaño de fuente (zoom) y paletas adaptadas para daltonismo.
* **Gestión de Roles:** Aislamiento de datos Multi-tenant con roles definidos (SuperAdmin, Vendedor, Comprador Logueado, Visitante).
* **Interacción Directa:** Módulo de Preguntas y Respuestas (Q&A) en cada producto y sistema de calificación de vendedores.

*(Nota: Los módulos de envíos integrados con tracking de logística y pasarelas de pago reales se encuentran fuera del alcance del MVP para garantizar la viabilidad temporal del desarrollo).*

## 🛠️ Stack Tecnológico

* **Frontend:** TypeScript, HTML5, CSS3 (Enfoque en maquetado accesible y control del DOM sin frameworks pesados).
* **Backend:** Spring Boot (Java), Spring Security, JWT (Arquitectura MVC, API REST stateless).
* **Base de Datos:** MongoDB Atlas (Modelo NoSQL para esquemas documentales flexibles).
* **Despliegue:** Plataformas Cloud (PaaS) a definir (ej. Render, Vercel).

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
