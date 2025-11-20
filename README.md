# Sistema de Control Médico

Aplicación web para la gestión de consultas médicas, historias clínicas y seguimiento de pacientes. Desarrollada con React, TypeScript, Firebase y Material-UI.

## Descripción General

Sistema integral de gestión médica que permite a los doctores administrar pacientes, crear historias clínicas completas, gestionar consultas y citas, mientras que los pacientes pueden agendar citas, visualizar su historial médico y administrar perfiles familiares.

## Tecnologías Utilizadas

- **Frontend:** React 19.2.0 + TypeScript
- **UI Framework:** Material-UI 7.3.5
- **Backend:** Firebase (Authentication, Firestore)
- **Routing:** React Router DOM 7.9.6
- **Build Tool:** Vite 7.2.2
- **Lenguaje:** TypeScript 5.9.3

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── appointments/    # Componentes de citas
│   ├── doctor/         # Componentes específicos del doctor
│   └── medical-history/# Componentes de historia clínica
├── context/            # Contextos de React (Auth, Notifications)
├── pages/              # Páginas de la aplicación
│   ├── doctor/        # Dashboard y funciones del doctor
│   └── patient/       # Dashboard y funciones del paciente
├── services/          # Servicios de backend y utilidades
└── types/            # Definiciones de TypeScript
```

## Funcionalidades Principales

### Autenticación y Registro

**Métodos de Autenticación:**
- Registro con email y contraseña
- Inicio de sesión con Google OAuth
- Inicio de sesión tradicional con email/contraseña

**Flujo de Registro:**
1. El usuario se registra como paciente o doctor
2. Validación de formulario (email, contraseña segura)
3. Redirección automática según el rol asignado
4. Los pacientes son dirigidos a completar su perfil

**Validaciones de Seguridad:**
- Email válido y único
- Contraseña mínimo 6 caracteres
- Verificación de duplicados en Firestore
- Manejo de errores de Firebase

### Panel del Paciente

#### Dashboard del Paciente
- Vista general de citas próximas
- Estado de citas (pendiente, aceptada, rechazada, cancelada)
- Acceso rápido a funcionalidades principales
- Indicadores visuales con iconos y colores por estado

#### Perfil del Paciente
- Datos personales básicos:
  - Nombre completo
  - Fecha de nacimiento
  - Género
  - Teléfono
  - Dirección
- Contacto de emergencia:
  - Nombre
  - Teléfono
  - Relación
- Información de seguro médico (opcional):
  - Proveedor
  - Número de póliza
- Sistema multi-perfil familiar:
  - Agregar miembros de la familia
  - Gestionar perfiles de dependientes

#### Sistema de Citas
**Agendar Cita:**
- Selección de fecha mediante calendario
- Selección de horario disponible
- Especificación del motivo de consulta
- Validación de horarios laborales (Lunes a Viernes 9:00-18:00)
- Sistema de aprobación para citas de fin de semana

**Estados de Citas:**
- Pendiente: Esperando respuesta del doctor
- Aceptada: Confirmada por el doctor
- Rechazada: No aprobada por el doctor
- Cancelada: Anulada por el paciente o doctor

**Gestión de Citas:**
- Ver todas las citas (próximas y pasadas)
- Filtrar por estado
- Cancelar citas pendientes
- Actualización en tiempo real

#### Historial Médico
- Visualización de consultas previas
- Diagnósticos y prescripciones
- Signos vitales registrados
- Notas del doctor
- Adjuntos y documentos médicos

### Panel del Doctor

#### Dashboard del Doctor
- Vista general de pacientes registrados
- Estadísticas de citas:
  - Total de citas
  - Citas pendientes
  - Citas para hoy
  - Citas de fin de semana por aprobar
- Búsqueda de pacientes por nombre
- Tarjetas de pacientes con información rápida
- Acceso directo a detalles del paciente

#### Gestión de Pacientes

**Crear Paciente:**
- Registro rápido de pacientes por el doctor
- Datos básicos requeridos:
  - Nombre completo
  - Email
  - Teléfono
  - Fecha de nacimiento
  - Género
- Creación automática de credenciales
- Marca especial de "creado por doctor"

**Detalles del Paciente:**
- Información completa del perfil
- Historial de consultas
- Visualización de signos vitales
- Historia clínica completa
- Notas y observaciones

#### Gestión de Citas

**Aprobación de Citas:**
- Lista de citas pendientes
- Vista detallada de cada solicitud
- Opciones para aceptar o rechazar
- Campo de notas del doctor
- Actualización en tiempo real

**Calendario de Citas:**
- Vista de todas las citas programadas
- Filtrado por estado
- Búsqueda por paciente
- Indicadores visuales por estado

#### Sistema de Consultas

**Formulario de Consulta:**
- Registro de signos vitales:
  - Presión arterial
  - Frecuencia cardíaca
  - Temperatura
  - Peso
  - Altura
  - Saturación de oxígeno
  - Glucosa
- Diagnóstico detallado
- Prescripción médica
- Registro de alergias
- Medicamentos actuales
- Adjuntar documentos y estudios
- Notas adicionales

**Historia Clínica Completa (Primera Consulta):**

1. **Ficha de Identificación:**
   - Ocupación
   - Estado civil
   - Nivel educativo
   - Lugar de nacimiento
   - Residencia actual

2. **Antecedentes Heredo-Familiares:**
   - Diabetes
   - Hipertensión
   - Cáncer
   - Enfermedades cardíacas
   - Trastornos neurológicos
   - Trastornos mentales
   - Otros

3. **Antecedentes Personales Patológicos:**
   - Alergias (crítico)
   - Enfermedades crónicas
   - Cirugías previas (con fecha y complicaciones)
   - Traumatismos
   - Transfusiones
   - Hospitalizaciones
   - Adicciones (tabaco, alcohol, drogas)

4. **Antecedentes Personales No Patológicos:**
   - Vivienda (servicios básicos, tipo de construcción)
   - Higiene personal
   - Alimentación (dieta, calidad nutricional)
   - Actividad física
   - Inmunizaciones

5. **Antecedentes Gineco-Obstétricos (mujeres):**
   - Menarca
   - Ciclo menstrual
   - Fecha de última menstruación (FUM)
   - Gestas, partos, cesáreas, abortos
   - Métodos anticonceptivos
   - Papanicolaou
   - Menopausia

6. **Revisión por Aparatos y Sistemas:**
   - Sistema respiratorio
   - Sistema cardiovascular
   - Sistema digestivo
   - Sistema genitourinario
   - Sistema nervioso
   - Sistema musculoesquelético
   - Piel y anexos
   - Órganos de los sentidos

## Características Técnicas

### Arquitectura y Patrones

**Context API:**
- `AuthContext`: Gestión de autenticación y sesión
- `NotificationContext`: Sistema de notificaciones toast

**Componentes Protegidos:**
- `ProtectedRoute`: Control de acceso por roles
- Redirección automática según autenticación
- Validación de roles (doctor/patient)

**Estado y Sincronización:**
- Suscripciones en tiempo real con Firestore
- Actualización automática de datos
- Optimistic updates para mejor UX

### Servicios Backend

**Servicio de Autenticación (`auth.ts`):**
- Registro de usuarios
- Login tradicional
- Login con Google
- Gestión de sesiones
- Cierre de sesión

**Servicio de Firestore (`firestore.ts`):**
- CRUD de pacientes
- CRUD de citas
- CRUD de consultas médicas
- Suscripciones en tiempo real
- Queries optimizadas

**Servicios Auxiliares:**
- `validation.ts`: Validaciones de formularios
- `logger.ts`: Sistema de logging
- `retry.ts`: Reintentos automáticos
- `appointmentScheduler.ts`: Lógica de agendamiento

### Seguridad

**Reglas de Firebase:**
- Autenticación requerida para todas las operaciones
- Validación de roles en Firestore
- Usuarios solo pueden acceder a sus propios datos
- Doctores tienen acceso completo a pacientes

**Validaciones Frontend:**
- Validación de formularios antes de envío
- Sanitización de inputs
- Prevención de inyección de código
- Manejo seguro de errores

### Experiencia de Usuario

**Diseño Responsivo:**
- Adaptable a móviles, tablets y desktop
- Grid system de Material-UI
- Componentes optimizados para touch

**Retroalimentación Visual:**
- Loading skeletons durante carga
- Spinners para operaciones asíncronas
- Mensajes toast para acciones
- Transiciones suaves (Fade, Slide)

**Accesibilidad:**
- Componentes semánticos
- Navegación por teclado
- Contraste de colores adecuado
- Mensajes de error claros

## Flujos de Usuario

### Flujo del Paciente

1. **Registro/Login**
   - Registro con email o Google
   - Asignación automática de rol "patient"

2. **Completar Perfil**
   - Llenar datos personales
   - Agregar contacto de emergencia
   - Opcional: información de seguro

3. **Gestión de Perfil Familiar**
   - Agregar miembros de la familia
   - Gestionar perfiles de dependientes

4. **Agendar Cita**
   - Seleccionar fecha y hora
   - Indicar motivo de consulta
   - Esperar aprobación del doctor

5. **Seguimiento de Citas**
   - Ver estado de citas
   - Cancelar si es necesario
   - Recibir notificaciones

6. **Ver Historial Médico**
   - Consultar diagnósticos previos
   - Revisar prescripciones
   - Descargar documentos

### Flujo del Doctor

1. **Registro/Login**
   - Registro con rol "doctor"
   - Acceso a dashboard médico

2. **Gestión de Pacientes**
   - Ver lista de todos los pacientes
   - Buscar paciente específico
   - Crear nuevos pacientes rápidamente
   - Acceder a perfil completo

3. **Gestión de Citas**
   - Revisar citas pendientes
   - Aprobar o rechazar solicitudes
   - Ver calendario de citas
   - Agregar notas

4. **Realizar Consulta**
   - Acceder desde detalles del paciente
   - Registrar signos vitales
   - Crear diagnóstico
   - Prescribir medicamentos
   - Adjuntar estudios

5. **Historia Clínica (Primera Consulta)**
   - Completar formulario extenso
   - Registrar todos los antecedentes
   - Revisión por sistemas
   - Guardar para referencia futura

6. **Seguimiento del Paciente**
   - Ver historial completo
   - Comparar signos vitales
   - Revisar evolución
   - Actualizar tratamiento

## Instalación y Configuración

### Requisitos Previos
- Node.js 16.x o superior
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd app-medico
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Firebase:**
   - Crear proyecto en Firebase Console
   - Habilitar Authentication (Email/Password y Google)
   - Crear base de datos Firestore
   - Copiar credenciales al archivo `src/firebase-config.ts`

4. **Iniciar en desarrollo:**
   ```bash
   npm run dev
   ```

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

## Scripts Disponibles

- `npm run dev`: Inicia servidor de desarrollo
- `npm run build`: Compila para producción
- `npm run lint`: Ejecuta linter ESLint
- `npm run preview`: Previsualiza build de producción

## Colecciones de Firestore

### users
```typescript
{
  id: string,
  name: string,
  email: string,
  role: 'patient' | 'doctor',
  profileCompleted: boolean,
  createdByDoctor?: boolean,
  // ... otros campos del perfil
}
```

### appointments
```typescript
{
  id: string,
  patientId: string,
  patientName: string,
  date: string,
  time: string,
  reason: string,
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled',
  requiresApproval?: boolean,
  isWeekend?: boolean,
  createdAt: string
}
```

### medicalRecords
```typescript
{
  id: string,
  patientId: string,
  doctorName: string,
  date: string,
  diagnosis: string,
  prescription: string,
  vitalSigns: {...},
  allergies: string[],
  currentMedications: string[]
}
```

### medicalHistories
```typescript
{
  id: string,
  patientId: string,
  doctorId: string,
  identification: {...},
  familyHistory: {...},
  pathologicalHistory: {...},
  nonPathologicalHistory: {...},
  gynecologicalHistory?: {...},
  systemsReview: {...}
}
```

## Próximas Funcionalidades

- Sistema de recordatorios por email/SMS
- Videoconsultas integradas
- Recetas digitales con firma electrónica
- Integración con laboratorios
- Reportes y estadísticas avanzadas
- Exportación de historias clínicas en PDF
- Sistema de pagos integrado
- Chat en tiempo real doctor-paciente
- Gestión de inventario de medicamentos
- Portal para farmacias

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y está bajo derechos reservados.

## Contacto

Para consultas o soporte, contactar al equipo de desarrollo.

---

Desarrollado con React, TypeScript y Firebase.
