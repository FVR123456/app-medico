# 📋 Sistema de Gestión Médica - Resumen Visual

## 🎯 ¿Qué es esta aplicación?

Una plataforma web que conecta médicos con sus pacientes de forma digital. Permite gestionar citas médicas, crear y consultar historiales clínicos, y mantener toda la información médica organizada en un solo lugar.

---

## 👥 ¿Quiénes usan la aplicación?

La aplicación tiene dos tipos de usuarios principales:

### 🩺 **Médicos**
Profesionales de la salud que atienden pacientes, gestionan consultas y mantienen registros médicos.

### 🧑‍⚕️ **Pacientes**
Personas que buscan atención médica, agendan citas y consultan su historial clínico.

---

## 🔐 Flujo de Inicio: Registro y Acceso

### **Primer Paso: Registro**

```
Usuario nuevo
    ↓
Pantalla de Registro
    ↓
Completa formulario:
  • Nombre completo
  • Email
  • Contraseña
  • Teléfono
    ↓
Opción alternativa:
  "Registrarse con Google" →
    ↓
Sistema crea cuenta
    ↓
Redirige al dashboard correspondiente
```

**Características visuales:**
- Formulario limpio con iconos en cada campo
- Botón destacado de Google con su logo
- Validación en tiempo real (marca errores al escribir)
- Animación de entrada suave
- Diseño con gradiente de fondo

### **Regreso: Inicio de Sesión**

```
Usuario registrado
    ↓
Pantalla de Login
    ↓
Ingresa credenciales:
  • Email
  • Contraseña
    ↓
O usa "Iniciar con Google"
    ↓
Sistema verifica identidad
    ↓
Redirige según tipo de usuario:
  • Doctor → Dashboard Médico
  • Paciente → Dashboard Paciente
```

**Características visuales:**
- Botón para mostrar/ocultar contraseña
- Enlace a "¿Olvidaste tu contraseña?"
- Enlace a registro para nuevos usuarios
- Indicador de carga mientras procesa

---

## 🏥 Experiencia del Médico

### **1. Dashboard Principal (Inicio del Médico)**

```
Doctor inicia sesión
    ↓
Ve pantalla principal con:
    ├─ Tarjetas de estadísticas:
    │   • Total de pacientes
    │   • Citas pendientes
    │   • Citas de hoy
    │
    ├─ Barra de búsqueda
    │   (encuentra pacientes rápido)
    │
    └─ Lista de todos los pacientes
        • Nombre y foto
        • Edad y contacto
        • Última visita
        • Botones de acción rápida
```

**Características visuales:**
- Cards con números grandes y colores distintos
- Iconos representativos en cada stat
- Tabla ordenada con información clara
- Botones de acción en cada fila

### **2. Gestión de Citas**

```
Doctor hace clic en "Citas"
    ↓
Ve pantalla organizada en pestañas:
    ├─ Pendientes (necesitan respuesta)
    ├─ Aceptadas (confirmadas)
    └─ Rechazadas (canceladas)
    ↓
Cada cita muestra:
  • Nombre del paciente
  • Fecha y hora solicitada
  • Motivo de consulta
    ↓
Opciones:
  • ✅ Aceptar (puede agregar nota)
  • ❌ Rechazar (puede explicar por qué)
  • 🗑️ Eliminar
```

**Características visuales:**
- Pestañas con colores que indican estado
- Cards diferenciadas por color según estado
- Botones grandes y claros
- Dialogo de confirmación antes de acciones importantes

### **3. Ver Detalles de un Paciente**

```
Doctor hace clic en paciente
    ↓
Pantalla completa con:
    ├─ Cabecera con info básica:
    │   • Nombre, edad, contacto
    │   • Última visita
    │   • Cálculo de IMC con indicador visual
    │
    ├─ ⚠️ Alertas importantes (si existen):
    │   • Alergias críticas
    │   (destacadas en rojo)
    │
    ├─ Historial de consultas:
    │   • Cards comprimidas con resumen
    │   • Fecha + Doctor + Diagnóstico breve
    │       ↓ (al hacer clic)
    │   • Modal flotante con TODO el detalle:
    │     - Signos vitales
    │     - Alergias
    │     - Medicamentos actuales
    │     - Diagnóstico completo
    │     - Prescripción
    │     - Notas
    │   • Botón "Editar" en cada registro
    │
    └─ Botón "Nueva Consulta"
        (abre formulario para registrar visita)
```

**Características visuales:**
- Diseño tipo dashboard con información organizada
- Alertas de alergias con fondo rojo
- Indicador visual del IMC (Normal/Sobrepeso/etc.)
- Cards pequeñas y limpias para el historial
- Modal grande centrado con toda la info
- Scroll dentro del modal si hay mucha información

### **4. Crear Nueva Consulta**

```
Doctor hace clic "Nueva Consulta"
    ↓
Página dedicada con:
    ├─ Sidebar izquierdo:
    │   • Foto y nombre del paciente
    │   • Info de contacto
    │   • Edad y última visita
    │
    └─ Formulario principal:
        • Signos vitales (presión, temperatura, etc.)
        • Diagnóstico
        • Prescripción médica
        • Alergias
        • Medicamentos actuales
        • Notas adicionales
            ↓
        Botón "Guardar Consulta"
            ↓
        Se guarda automáticamente
            ↓
        Mensaje de éxito
            ↓
        Regresa a detalles del paciente
```

**Características visuales:**
- Layout de dos columnas (info del paciente + formulario)
- Campos agrupados con títulos claros
- Campos de texto amplios para escribir cómodamente
- Iconos en cada sección
- Botón grande de guardar al final

---

## 🧑‍⚕️ Experiencia del Paciente

### **1. Dashboard del Paciente (Inicio)**

```
Paciente inicia sesión
    ↓
Ve pantalla principal con:
    ├─ Tarjetas de resumen:
    │   • Citas confirmadas
    │   • Citas pendientes
    │
    ├─ Botones de acción rápida:
    │   • 📅 Agendar nueva cita
    │   • 📋 Ver historial médico
    │
    └─ Lista de próximas citas:
        • Fecha y hora
        • Estado (Confirmada/Pendiente/etc.)
        • Notas del doctor
        • Botones: Ver detalles | Cancelar
```

**Características visuales:**
- Cards de estadísticas con iconos
- Botones grandes de acción con colores llamativos
- Timeline o lista vertical de citas
- Estados con colores (verde=confirmada, amarillo=pendiente)

### **2. Agendar Cita**

```
Paciente hace clic "Agendar Cita"
    ↓
Pantalla con pestañas:
    ├─ Pestaña "Nueva Cita":
    │   ↓
    │   Formulario paso a paso:
    │       1. Selecciona fecha en calendario
    │          (solo fechas disponibles)
    │           ↓
    │       2. Elige horario disponible
    │          (botones con horarios libres)
    │           ↓
    │       3. Describe motivo de consulta
    │          (campo de texto)
    │           ↓
    │       4. Confirma y envía
    │           ↓
    │   Mensaje de éxito
    │   "Tu cita ha sido solicitada"
    │
    └─ Pestaña "Mis Citas":
        • Lista de todas las citas
        • Agrupadas por estado
        • Opciones de cancelar
```

**Características visuales:**
- Calendario interactivo con fechas disponibles resaltadas
- Horarios como botones clicables
- Formulario simple de un solo campo
- Pantalla de éxito con icono de check verde
- Tabs para cambiar entre nueva cita y ver existentes

### **3. Ver Historial Médico**

```
Paciente hace clic "Historial Médico"
    ↓
Pantalla con:
    ├─ Grid de consultas pasadas
    │   • Cards comprimidas con:
    │     - Fecha de la consulta
    │     - Nombre del doctor
    │     - Diagnóstico resumido
    │         ↓ (al hacer clic en una card)
    │   • Modal flotante se abre mostrando:
    │     - 💓 Signos vitales completos
    │       (presión, ritmo cardíaco, temperatura, etc.)
    │     - ⚠️ Alergias registradas
    │     - 💊 Medicamentos actuales
    │     - 📝 Diagnóstico completo
    │     - 📋 Prescripción médica
    │     - 📄 Notas adicionales
    │     - Botón "Cerrar"
    │
    └─ (Paciente solo ve, no edita)
```

**Características visuales:**
- Grid responsive (se adapta al tamaño de pantalla)
- Cards pequeñas con borde sutil
- Hover effect al pasar el mouse
- Modal grande con fondo oscurecido detrás
- Información organizada en secciones con iconos
- Diseño limpio y fácil de leer

---

## 🎨 Elementos Visuales Clave de la Aplicación

### **Colores y Estados**
- 🟢 **Verde**: Citas confirmadas, acciones positivas
- 🟡 **Amarillo**: Citas pendientes, alertas suaves
- 🔴 **Rojo**: Alertas importantes, alergias, rechazos
- 🔵 **Azul**: Información, acciones neutrales
- ⚪ **Gris**: Datos secundarios, fondos sutiles

### **Componentes Reutilizables**
- **Cards**: Cajas con información resumida
- **Modales**: Ventanas flotantes con detalle completo
- **Botones de acción**: Claros y con iconos
- **Alertas visuales**: Mensajes destacados con color
- **Formularios**: Campos agrupados lógicamente

### **Navegación**
- Barra superior con logo y menú
- Menú lateral en móviles (hamburguesa)
- Botón de cerrar sesión siempre visible
- Breadcrumbs (migas de pan) en páginas internas

### **Responsive (Adaptable)**
- Se adapta a computadoras, tablets y móviles
- En móviles: menú se vuelve hamburguesa
- Grid de cards se ajusta al ancho disponible
- Formularios se apilan verticalmente en pantallas pequeñas

---

## 🔄 Flujos de Interacción Detallados

### **Flujo Completo: Paciente Agenda Cita y Médico la Gestiona**

```
1. PACIENTE solicita cita:
   Usuario logueado como paciente
       ↓
   Dashboard → Clic "Agendar Cita"
       ↓
   Ve calendario interactivo
       ↓
   Selecciona fecha disponible (ej: 25 de noviembre)
       ↓
   Ve horarios disponibles (ej: 9:00 AM, 10:00 AM, 2:00 PM)
       ↓
   Selecciona horario (ej: 10:00 AM)
       ↓
   Escribe motivo: "Dolor de cabeza persistente"
       ↓
   Presiona "Confirmar Cita"
       ↓
   Sistema guarda con estado "Pendiente"
       ↓
   Mensaje: "✅ Cita solicitada exitosamente"
       ↓
   Cita aparece en "Mis Citas" con estado amarillo (Pendiente)

2. DOCTOR gestiona la solicitud:
   Doctor inicia sesión
       ↓
   Ve dashboard con notificación: "1 cita pendiente"
       ↓
   Navega a "Gestión de Citas"
       ↓
   Pestaña "Pendientes" muestra la nueva cita
       ↓
   Ve información:
     • Paciente: Juan Pérez
     • Fecha: 25 nov, 10:00 AM
     • Motivo: Dolor de cabeza persistente
       ↓
   OPCIÓN A: Acepta la cita
       → Clic "Aceptar"
       → (Opcional) Agrega nota: "Traer estudios previos"
       → Cita se mueve a "Aceptadas"
       → Estado cambia a verde (Confirmada)
       → Paciente ve la confirmación en su dashboard
   
   OPCIÓN B: Rechaza la cita
       → Clic "Rechazar"
       → Agrega razón: "No hay disponibilidad ese día"
       → Cita se mueve a "Rechazadas"
       → Estado cambia a rojo (Rechazada)
       → Paciente ve el rechazo con la nota

3. DÍA DE LA CITA:
   Paciente acude a consulta
       ↓
   Doctor atiende y necesita crear registro
       ↓
   (Continúa en siguiente flujo)
```

### **Flujo Completo: Crear y Consultar Historial Médico**

```
1. DOCTOR crea registro de consulta:
   En "Gestión de Pacientes"
       ↓
   Busca o selecciona paciente: "Juan Pérez"
       ↓
   Clic en nombre del paciente
       ↓
   Ve pantalla de detalles completos
       ↓
   Clic botón "Nueva Consulta"
       ↓
   Se abre página de formulario:
       ↓
   Completa información:
     • Signos vitales:
       - Presión: 120/80
       - Frecuencia cardíaca: 72 bpm
       - Temperatura: 36.5°C
       - Peso: 70 kg
       - Altura: 170 cm
     
     • Diagnóstico:
       "Cefalea tensional crónica"
     
     • Prescripción:
       "Ibuprofeno 400mg cada 8 horas por 5 días"
     
     • Alergias:
       "Penicilina"
     
     • Medicamentos actuales:
       "Losartán 50mg diario"
     
     • Notas:
       "Paciente refiere estrés laboral. 
        Recomendar técnicas de relajación."
       ↓
   Presiona "Guardar Consulta"
       ↓
   Sistema guarda automáticamente
       ↓
   Mensaje: "✅ Consulta guardada exitosamente"
       ↓
   Regresa a detalles del paciente
       ↓
   Nueva consulta aparece en el historial

2. DOCTOR consulta historial previo:
   En detalles del paciente
       ↓
   Scrollea a "Historial de Consultas"
       ↓
   Ve cards comprimidas:
       [Card 1]
       📅 15 Nov 2025
       👨‍⚕️ Dr. García
       📝 Cefalea tensional crónica
       ↓
   Hace clic en la card
       ↓
   Modal se abre mostrando TODO:
     • 💓 Signos Vitales:
       Presión: 120/80 | FC: 72 bpm
       Temp: 36.5°C | Peso: 70kg
     
     • ⚠️ Alergias:
       • Penicilina
     
     • 💊 Medicamentos:
       • Losartán 50mg
     
     • 📋 Diagnóstico completo
     • 📝 Prescripción completa
     • 📄 Notas del doctor
       ↓
   Opción: Clic "Editar"
       → Campos se vuelven editables
       → Modifica información necesaria
       → Clic "Guardar cambios"
       → Se actualiza el registro
       ↓
   Clic "Cerrar" para salir del modal

3. PACIENTE consulta su historial:
   Dashboard de paciente
       ↓
   Clic "Ver Historial Médico"
       ↓
   Ve grid con todas sus consultas:
       [Card 1] [Card 2] [Card 3]
       ↓
   Cada card muestra resumen
       ↓
   Hace clic en cualquier card
       ↓
   Modal se abre con detalle completo
   (igual que vista de doctor pero sin edición)
       ↓
   Puede revisar:
     • ¿Qué signos vitales tuvo?
     • ¿Qué diagnóstico le dieron?
     • ¿Qué medicamentos le recetaron?
     • ¿Tiene alergias registradas?
       ↓
   Clic "Cerrar" cuando termina de revisar
```

### **Flujo de Edición: Doctor Actualiza Información**

```
Doctor en detalles de paciente
    ↓
Ve historial de consultas
    ↓
Detecta error o necesita actualizar
    ↓
Hace clic en la card correspondiente
    ↓
Modal se abre con información actual
    ↓
Clic botón "Editar"
    ↓
Campos se activan para edición:
  • Puede cambiar diagnóstico
  • Actualizar prescripción
  • Agregar/quitar alergias
  • Modificar medicamentos
  • Agregar notas adicionales
    ↓
Hace cambios necesarios
    ↓
Clic "Guardar Cambios"
    ↓
Sistema valida información
    ↓
Actualiza en base de datos
    ↓
Mensaje: "✅ Registro actualizado"
    ↓
Modal se cierra
    ↓
Card actualizada refleja cambios
```

---

## 📊 Información que Maneja el Sistema

### **Datos del Paciente**
- **Información personal**: Nombre, edad, teléfono, email
- **Información médica básica**: Peso, altura, IMC
- **Alergias**: Lista de sustancias a las que es alérgico
- **Medicamentos actuales**: Qué está tomando regularmente
- **Historial de consultas**: Todas las visitas médicas previas

### **Datos de las Citas**
- **Información básica**: Fecha, hora, estado
- **Motivo de consulta**: Por qué solicita la cita
- **Notas del doctor**: Comentarios o instrucciones
- **Estados posibles**:
  - 🟡 Pendiente (esperando respuesta del doctor)
  - 🟢 Confirmada (doctor aceptó la cita)
  - 🔴 Rechazada (doctor no puede atender)
  - ⚫ Cancelada (paciente canceló)

### **Datos de las Consultas Médicas**
- **Signos vitales**: 
  - Presión arterial (ej: 120/80)
  - Frecuencia cardíaca (ej: 72 bpm)
  - Temperatura (ej: 36.5°C)
  - Peso y altura
  - Saturación de oxígeno
  - Glucosa
- **Diagnóstico**: Qué condición o enfermedad tiene
- **Prescripción**: Qué medicamentos recetó el doctor
- **Alergias**: Actualización de alergias conocidas
- **Medicamentos actuales**: Qué está tomando el paciente
- **Notas**: Observaciones adicionales del doctor

---

## ✨ Características Destacadas de la Interfaz

### **1. Sistema de Cards Inteligentes**
- **Estado comprimido**: Muestra solo lo esencial
- **Expandible**: Un clic abre todo el detalle
- **Visual**: Colores e iconos para identificar rápido
- **Limpio**: No satura la pantalla con información

### **2. Modales Flotantes**
- **Centrados**: Se sobreponen en el centro de la pantalla
- **Fondo oscurecido**: El resto de la pantalla se vuelve gris
- **Scrolleables**: Si hay mucha info, se puede scrollear dentro
- **Fáciles de cerrar**: X en la esquina o clic fuera

### **3. Indicadores Visuales**
- **Colores por estado**: Verde=bien, Amarillo=pendiente, Rojo=alerta
- **Iconos descriptivos**: 💓=signos vitales, ⚠️=alergias, 💊=medicamentos
- **Badges numéricos**: Circulitos con números para contadores
- **Barras de progreso**: (futuro) Para mostrar evolución

### **4. Formularios Intuitivos**
- **Validación instantánea**: Te dice si hay error mientras escribes
- **Campos organizados**: Agrupados por tema
- **Placeholders útiles**: Ejemplos de qué escribir
- **Autocompletado**: (algunos campos) Sugiere opciones

### **5. Navegación Clara**
- **Menú superior**: Siempre visible con opciones principales
- **Botones de acción**: Destacados con colores llamativos
- **Migas de pan**: "Inicio > Pacientes > Juan Pérez"
- **Botón atrás**: Para regresar fácilmente

---

## 🎯 Casos de Uso Principales

### **Para el Médico:**
1. **Revisar pacientes del día**: Ver lista rápida en dashboard
2. **Gestionar solicitudes de citas**: Aceptar o rechazar según disponibilidad
3. **Atender consulta**: Acceder al historial antes de ver al paciente
4. **Crear registro de visita**: Documentar consulta con todos los detalles
5. **Actualizar información**: Corregir o agregar datos a consultas previas
6. **Identificar alertas**: Ver alergias críticas de un vistazo

### **Para el Paciente:**
1. **Solicitar cita**: Elegir fecha y hora conveniente
2. **Revisar próximas citas**: Ver calendario de visitas
3. **Consultar historial**: Recordar diagnósticos y tratamientos previos
4. **Verificar medicación**: Revisar qué medicamentos está tomando
5. **Conocer sus alergias**: Tener registro de sustancias peligrosas
6. **Cancelar citas**: Si no puede asistir

---

## 📱 Adaptabilidad de la Interfaz

### **En Computadora (Desktop)**
- Diseño de 2-3 columnas
- Sidebar lateral siempre visible
- Modales medianos-grandes
- Tablas completas con todas las columnas
- Hover effects en botones y cards

### **En Tablet**
- Diseño de 2 columnas
- Sidebar puede colapsar
- Modales tamaño medio
- Tablas pueden scrollear horizontal
- Touch-friendly (botones más grandes)

### **En Móvil**
- Diseño de 1 columna (apilado)
- Menú hamburguesa
- Modales pantalla completa
- Tablas se convierten en cards apiladas
- Botones grandes para tocar con el dedo

---

## 🚀 Mejoras Implementadas Recientemente

### **Cards Comprimidas + Modal**
**Antes**: Toda la información se mostraba en cards grandes que ocupaban mucho espacio

**Ahora**: 
- Cards pequeñas con resumen
- Clic abre modal con todo el detalle
- Menos scroll, más información visible
- Experiencia más fluida

### **Componente Reutilizable**
**Antes**: Código duplicado en vista de doctor y paciente

**Ahora**:
- Un solo componente (`MedicalRecordCard`)
- Se usa en ambas vistas
- Más fácil de mantener y actualizar
- Consistencia visual garantizada

### **Edición desde el Modal**
**Antes**: Para editar había que ir a otra página

**Ahora**:
- Botón "Editar" dentro del modal
- Campos se activan sin salir
- Guardado inmediato
- Menos clics, más rápido

---

## 🔮 Funcionalidades Futuras Planeadas

### **1. Gráficos de Evolución**
Mostrar cómo han cambiado los signos vitales del paciente en el tiempo:
- Línea de presión arterial en los últimos 6 meses
- Evolución del peso
- Tendencias de frecuencia cardíaca

### **2. Búsqueda Avanzada**
Permitir al doctor encontrar pacientes por:
- Tipo de alergia
- Medicamento específico
- Diagnóstico
- Rango de edad

### **3. Notificaciones en Tiempo Real**
Alertas automáticas:
- "Tienes una nueva solicitud de cita"
- "Tu cita fue confirmada para mañana a las 10 AM"
- "Recordatorio: Cita en 1 hora"

### **4. Perfil del Doctor**
Página donde el doctor pueda:
- Agregar su especialidad
- Definir horarios de atención
- Subir foto profesional
- Agregar información de contacto

### **5. Modo Oscuro**
Opción para cambiar el tema visual:
- Fondo oscuro para usar de noche
- Menos cansancio visual
- Ahorro de batería en móviles

---

**Última actualización**: 21 de noviembre de 2025  
**Estado del proyecto**: ✅ Funcional y en uso  
**Documento creado para**: Equipo de diseño UX/UI
