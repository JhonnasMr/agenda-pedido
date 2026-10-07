# 📦 Plantilla Modular de Formulario de Envíos (Multi-Merchant)

Una plantilla web moderna, modular y completamente reutilizable para **formularios de envíos logísticos e e-commerce**, inspirada en plataformas como Latam5S, construida con **React, TypeScript, Vite, Tailwind CSS, Zod y React Hook Form**.

Diseñada para adaptarse dinámicamente a cualquier tienda o comercio mediante el parámetro `?merchant=:merchantId` en la URL, sin hardcodear información en los componentes de UI.

---

## 🌟 Características Principales

- **Multi-Tenant / Multi-Merchant**: Soporta múltiples comercios simplemente agregando su configuración a `src/config/merchants.ts` o cargándola desde una API REST.
- **Mobile-First & Ultra Responsive**: Optimizado para dispositivos móviles (375px, 390px, 412px, 430px) y pantallas de escritorio (768px, 1024px, 1440px).
- **Validación Robusta con Zod**:
  - Validación específica para números peruanos (+51, 9 dígitos comenzando por 9) e internacionales.
  - Normalización automática a formato internacional (E.164: `+519XXXXXXXX`).
  - Validación dinámica según los campos requeridos de cada comercio.
- **Flujo Progresivo de 2 Pasos**:
  - Paso 1: Entrada y verificación en tiempo real de WhatsApp. Al ingresar 9 dígitos válidos que empiezan por 9, se desbloquea fluidamente el resto de campos.
  - Paso 2: Despliegue de los campos requeridos: **Empresa de Transporte**, **Ciudad de Destino**, **DNI** y **Nombre Completo**.
- **Agendamiento Inteligente de Fechas Futuras**:
  - Muestra la fecha del día siguiente (Mañana) y opciones dejando de a 2 días (+3 días, +5 días, +7 días).
  - Solo permite agendar en fechas estrictamente futuras (bloquea fechas pasadas o de hoy).
- **Aviso de Hora de Corte Inteligente**:
  - Calcula en tiempo real si el usuario está antes o después de la hora de corte de despacho (ej: 18:00).
  - Cuenta regresiva visual (`Quedan Xh Ym`).
- **Resumen Estructurado del Envío**:
  - Vista previa clara tipo ticket logístico.
  - Botón "Editar datos" que regresa al formulario preservando toda la información ingresada.
- **Integración con WhatsApp**:
  - Generación de enlace directo `wa.me` con mensaje profesional estructurado y formateado con emojis (Destinatario, Teléfono, DNI, Agencia, Dirección, Referencia, Courier, Código de Solicitud).
  - Opción de copiar el texto al portapapeles.
- **Manejo de Errores y Enlaces Inválidos**:
  - Pantalla amigable si el comercio no existe o no se incluye `?merchant=...`, con enlaces rápidos a tiendas de demostración.
- **Branding y Temas Dinámicos**:
  - Inyección dinámica de colores de marca (`--merchant-primary`, `--merchant-secondary`) sin alterar los estilos globales.

---

## 🚀 1. Instalación

Requisitos previos: **Node.js 18+** y **npm** (o pnpm / yarn).

Clona el repositorio o accede a la carpeta del proyecto y ejecuta:

```bash
npm install
```

---

## 💻 2. Ejecución en Desarrollo

Para iniciar el servidor de desarrollo local:

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`.

### Enlaces de Prueba Disponibles Out-of-the-Box:

- **Moda & Estilo Chic (Ropa / Calzado):**  
  `http://localhost:5173/form?merchant=merchant-demo`
- **TecnoStore Perú (Gadgets / Facturas / Seguros):**  
  `http://localhost:5173/form?merchant=merchant-test`
- **Curvatex Telas & Confecciones (Mayorista / Fardos):**  
  `http://localhost:5173/form?merchant=merchant-logistica`
- **Referencia Latam5S:**  
  `http://localhost:5173/form?merchant=u_9c98qwpvm`
- **Enlace Inválido (Prueba de error amigable):**  
  `http://localhost:5173/form?merchant=comercio-inexistente`

---

## 🏪 3. Cómo Cambiar o Crear un Nuevo Merchant

Los datos de los comercios están desacoplados de los componentes y se configuran en [`src/config/merchants.ts`](src/config/merchants.ts).

Para agregar una nueva tienda (por ejemplo, `zapateria-express`), añade una nueva entrada al objeto `MOCK_MERCHANTS`:

```typescript
// src/config/merchants.ts
export const MOCK_MERCHANTS: Record<string, MerchantConfig> = {
  // ... comercios existentes
  'zapateria-express': {
    id: 'zapateria-express',
    name: 'Zapatería Express Perú',
    badgeText: 'Calzado & Moda',
    logo: 'https://tu-dominio.com/logo.png', // Opcional
    primaryColor: '#e11d48', // Color principal (Hex)
    secondaryColor: '#be123c',
    phoneCountryCode: '+51',
    phonePlaceholder: '9XXXXXXXX',
    cutoffTime: '17:30', // Hora de corte (HH:mm)
    cutoffEnabled: true,
    whatsappEnabled: true,
    whatsappNumber: '+51987111222', // WhatsApp de la tienda que recibe el pedido
    formTitle: 'Registro de Envíos de Calzado',
    formSubtitle: 'Completa tus datos para enviarte el calzado a tu ciudad hoy mismo.',
    allowedCouriers: ['Shalom', 'Olva Courier'],
    defaultCourier: 'Shalom',
    fields: [
      {
        id: 'phone',
        type: 'phone',
        label: 'Tu WhatsApp',
        required: true,
        placeholder: '9XXXXXXXX',
      },
      {
        id: 'fullName',
        type: 'text',
        label: 'Nombre completo',
        required: true,
      },
      {
        id: 'documentNumber',
        type: 'text',
        label: 'DNI para recojo en agencia',
        required: true,
      },
      {
        id: 'destinationAddress',
        type: 'text',
        label: 'Agencia o Ciudad de destino',
        required: true,
      },
    ],
  },
};
```

Ahora puedes compartir con tus clientes el enlace:  
`/form?merchant=zapateria-express`

---

## 📝 4. Cómo Agregar o Modificar Campos en el Formulario

Cada comercio define su lista de campos en la propiedad `fields: FormFieldConfig[]`.

### Tipos de Campos Soportados:
- `text`: Texto corto (ej: nombres, DNI, dirección).
- `phone`: Teléfono móvil con código de país e input numérico.
- `email`: Correo con validación de sintaxis email.
- `number`: Números enteros o decimales (con `min` y `max` opcionales).
- `select`: Menú desplegable con opciones personalizadas (`options: [{ value, label }]`).
- `textarea`: Campo multilinea (ej: notas, referencias, instrucciones).
- `checkbox`: Casilla de verificación (ej: aceptar términos).

### Ejemplo: Agregar un campo de selección de talla y notas de pedido

```typescript
fields: [
  // ... campos previos
  {
    id: 'tallaCalzado',
    type: 'select',
    label: 'Talla de Calzado',
    required: true,
    options: [
      { value: '38', label: 'Talla 38' },
      { value: '39', label: 'Talla 39' },
      { value: '40', label: 'Talla 40' },
      { value: '41', label: 'Talla 41' },
    ],
  },
  {
    id: 'instrucciones',
    type: 'textarea',
    label: 'Instrucciones Especiales',
    placeholder: 'Ej: Llamar antes de salir a reparto',
    required: false,
    rows: 3,
  },
];
```

---

## 🎨 5. Cómo Cambiar Colores y Estilos

El sistema utiliza variables CSS dinámicas en `:root` que se aplican automáticamente según el `primaryColor` y `theme` configurado en el merchant:

```css
/* Generados en tiempo de ejecución: */
--merchant-primary: #4f46e5;
--merchant-primary-hover: #4338ca;
--merchant-primary-light: #eef2ff;
--merchant-primary-foreground: #ffffff;
```

Para cambiar el color de una tienda, solo actualiza `primaryColor` en su configuración (ej: `#059669` para verde esmeralda, `#2563eb` para azul, `#dc2626` para rojo).

---

## 💬 6. Cómo Configurar y Personalizar el Mensaje de WhatsApp

La lógica del mensaje se encuentra encapsulada en [`src/utils/whatsapp.ts`](src/utils/whatsapp.ts).

El formato estándar genera:

```text
📦 NUEVO ENVÍO (AGENCIA)
🏪 Tienda: Moda & Estilo Chic

👤 Ayrton Mayhuay Rodriguez
📱 908671023
🆔 DNI: 90643328
🏢 Agencia/Destino: Lima / Lima / Comas
📍 Agencia Shalom Año Nuevo / Av. Tupac Amaru N° 7837 (Ref: Frente a farmacia)
🚚 Courier: Shalom
📅 Fecha: Jueves 01/10

🔖 Código de Registro: #L5S-1023-842
```

Para personalizar la estructura del mensaje, edita la función `buildWhatsAppMessage(shipment, merchant)` en `src/utils/whatsapp.ts`.

---

## 🔌 7. Cómo Conectar con una API Backend Real

Actualmente, [`src/services/merchantService.ts`](src/services/merchantService.ts) y [`src/services/shipmentService.ts`](src/services/shipmentService.ts) simulan peticiones asíncronas con datos locales.

Para conectarlos a tu servidor:

1. Configura la URL base en el archivo `.env`:
   ```env
   VITE_API_URL=https://api.tuempresa.com/v1
   ```
2. Reemplaza la función en `src/services/merchantService.ts`:
   ```typescript
   export async function getMerchantById(merchantId?: string | null): Promise<MerchantConfig | null> {
     if (!merchantId) return null;
     const response = await fetch(`${import.meta.env.VITE_API_URL}/merchants/${merchantId}`);
     if (!response.ok) return null;
     return await response.json();
   }
   ```
3. Reemplaza la función en `src/services/shipmentService.ts`:
   ```typescript
   export async function createShipment(data: ShipmentData): Promise<ShipmentResponse> {
     const response = await fetch(`${import.meta.env.VITE_API_URL}/shipments`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     });
     return await response.json();
   }
   ```
*Nota: Ningún componente visual (`ShippingForm`, `FormSummary`, etc.) necesita ser modificado al conectar la API.*

---

## 🏗️ 8. Cómo Compilar para Producción

Para compilar la aplicación optimizada:

```bash
npm run build
```

El resultado listo para desplegar se generará en la carpeta `dist/`.

Para previsualizar localmente el build de producción:

```bash
npm run preview
```

---

## ☁️ 9. Cómo Desplegar

La aplicación es una Single Page Application (SPA) estática de alto rendimiento. Puede desplegarse en segundos en cualquier proveedor:

### Vercel:
```bash
npx vercel
```
*Asegúrate de configurar la reescritura de rutas para SPA (Vercel lo hace automáticamente).*

### Netlify:
Crea un archivo `public/_redirects` con el siguiente contenido:
```
/*    /index.html   200
```
Y ejecuta `netlify deploy --prod --dir=dist`.

### Docker / Nginx:
Copia la carpeta `dist/` a `/usr/share/nginx/html` con una directiva `try_files $uri $uri/ /index.html;`.

---

## 📂 10. Estructura del Proyecto

```
src/
├── components/
│   ├── form/
│   │   ├── ShippingForm.tsx      # Formulario dinámico principal con Zod y React Hook Form
│   │   ├── PhoneInput.tsx        # Selector de país y formateador de WhatsApp (+51)
│   │   ├── FormHeader.tsx        # Encabezado con branding, logo/avatar y títulos
│   │   ├── CutoffNotice.tsx      # Alerta de hora de corte en tiempo real
│   │   ├── FormActions.tsx       # Botón principal "Agendar y ver resumen" con loading
│   │   ├── FormSummary.tsx       # Vista de resumen tipo ticket logístico
│   │   ├── SuccessState.tsx      # Pantalla de confirmación y botón de WhatsApp
│   │   └── ErrorState.tsx        # Estado de enlace no válido con selector de demos
│   └── ui/
│       ├── Button.tsx            # Botón accesible con soporte para WhatsApp y estados
│       ├── Card.tsx              # Contenedor responsive con elevación y sombras suaves
│       ├── Input.tsx             # Input accesible (evita auto-zoom en iOS Safari)
│       ├── Alert.tsx             # Alertas y notificaciones contextuales
│       └── Spinner.tsx           # Animación de carga SVG
├── config/
│   └── merchants.ts              # Configuraciones de prueba de comercios
├── types/
│   ├── merchant.ts               # Tipos TypeScript para MerchantConfig y temas
│   ├── shipment.ts               # Tipos para datos de envío y respuestas
│   └── form.ts                   # Tipos de campos dinámicos
├── services/
│   ├── merchantService.ts        # Capa de servicio para obtención de merchants y CSS theming
│   ├── shipmentService.ts        # Registro y generación de códigos de tracking
│   └── whatsappService.ts        # Despacho y copia de mensajes a WhatsApp
├── hooks/
│   ├── useMerchant.ts            # Hook para lectura de ?merchant= y carga de datos
│   └── useShipmentForm.ts        # Hook para gestión del ciclo de vida del formulario
├── utils/
│   ├── phone.ts                  # Limpieza, normalización y validación móvil peruana
│   ├── validation.ts             # Esquemas dinámicos Zod
│   ├── whatsapp.ts               # Construcción de mensaje estructurado y enlaces wa.me
│   └── date.ts                   # Cálculo de hora de corte y fechas
├── pages/
│   ├── ShippingFormPage.tsx      # Página central que orquesta el formulario y sus pasos
│   ├── InvalidMerchantPage.tsx   # Página de fallback para comercios desconocidos
│   └── SuccessPage.tsx           # Página directa de confirmación
├── App.tsx                       # Configuración concisa de rutas
├── main.tsx                      # Punto de entrada de React con BrowserRouter
└── index.css                     # Variables CSS y directivas de Tailwind
```
