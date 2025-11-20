# Simplificación del Registro de Pacientes

## 📋 Resumen de Cambios

Se ha simplificado el flujo de registro eliminando el wizard de 3 pasos y moviendo todos los datos personales al formulario de registro inicial. **El sistema está diseñado para un solo médico**, por lo que el registro de médicos está deshabilitado.

## ✨ Cambios Implementados

### 1. **Registro Simplificado** (`src/pages/Register.tsx`)

#### Antes:
- Formulario básico con: nombre, email, contraseña y selección de rol (paciente/médico)
- Redirección a wizard de 3 pasos (`/complete-profile`)
- Información médica mezclada con datos personales

#### Ahora:
- **Solo registro de pacientes** (no hay opción de médico)
- Formulario completo en una sola página con:
  - ✅ Nombre, email y contraseña
  - ✅ Teléfono
  - ✅ Fecha de nacimiento
  - ✅ Género
  - ✅ Dirección (opcional)
  - ✅ Contacto de emergencia (nombre, teléfono, relación)
- Redirección directa al dashboard del paciente después del registro
- Sin opciones de rol (siempre se registra como paciente)

### 2. **Tipos Actualizados** (`src/types/index.ts`)

Se removieron campos médicos de `PatientProfile`:
- ❌ `bloodType` (tipo de sangre)
- ❌ `height` (altura)
- ❌ `weight` (peso)
- ❌ `chronicConditions` (condiciones crónicas)
- ❌ `knownAllergies` (alergias)
- ❌ `currentMedications` (medicamentos actuales)
- ❌ `previousSurgeries` (cirugías previas)

**Estos datos ahora se manejan en la Historia Clínica** que el doctor crea durante la primera consulta.

Se mantienen en el perfil:
- ✅ Datos personales básicos
- ✅ Contacto de emergencia
- ✅ Seguro médico (opcional)
- ✅ Miembros de la familia

### 3. **Nueva Página de Perfil** (`src/pages/patient/PatientProfile.tsx`)

Se creó una página editable para que el paciente pueda:
- Ver y editar sus datos personales
- Actualizar contacto de emergencia
- Agregar/editar información del seguro médico
- Sin campos médicos (estos están en la historia clínica del doctor)

### 4. **Rutas Actualizadas** (`src/App.tsx`)

```tsx
// Eliminado:
// /complete-profile

// Agregado:
/patient/profile  // Perfil editable del paciente
```

### 5. **Navegación Mejorada**

#### Dashboard del Paciente:
- Nueva tarjeta de acción rápida: "Mi Perfil"
- Acceso directo a editar información personal

#### Layout/Menú:
- Nuevo botón "Perfil" en la barra de navegación superior
- Solo visible para pacientes

### 6. **Servicio de Autenticación** (`src/services/auth.ts`)

- Removido `profileCompleted: false` del registro inicial
- Los pacientes ya no necesitan "completar perfil" después de registrarse

## 🎯 Flujo Actual

### Para Pacientes:

```
1. Registro
   └─> Formulario con todos los datos personales
       └─> Guardado en Firestore
           └─> Redirección a /patient-dashboard

2. En Dashboard
   └─> Puede editar su perfil en cualquier momento
       └─> /patient/profile

3. Primera Consulta con el Doctor
   └─> El doctor crea la Historia Clínica completa
       └─> Incluye datos médicos: alergias, medicamentos, cirugías, etc.
```

### Para Médicos:

```
El médico ya debe tener una cuenta creada directamente en Firebase.
No hay registro público para médicos.
```

## 📊 Separación de Responsabilidades

### Perfil del Paciente (Editable por el Paciente):
- Datos personales de contacto
- Información demográfica
- Contacto de emergencia
- Seguro médico

### Historia Clínica (Creada por el Doctor):
- Ficha de identificación completa
- Antecedentes heredo-familiares
- Antecedentes personales patológicos
- Antecedentes personales no patológicos
- Antecedentes gineco-obstétricos
- Interrogatorio por aparatos y sistemas
- Datos médicos específicos (tipo de sangre, alergias, medicamentos, etc.)

## 🔐 Seguridad

- El paciente solo puede editar su información personal
- Los datos médicos críticos solo son creados y editados por el doctor
- La historia clínica se mantiene separada del perfil del paciente

## 🚀 Beneficios

1. **Experiencia de Usuario Mejorada**
   - Un solo paso para registro completo de pacientes
   - Sin wizard largo y confuso
   - Acceso inmediato al dashboard
   - Sin confusión de roles (solo pacientes)

2. **Datos Organizados**
   - Separación clara entre datos personales y médicos
   - El doctor tiene control sobre información clínica crítica

3. **Perfil Editable**
   - El paciente puede actualizar su información de contacto
   - No afecta los registros médicos

4. **Flujo Simplificado**
   - Menos pasos = menos abandono del registro
   - Información completa desde el inicio
   - Sistema diseñado para un solo médico (más seguro y simple)

## 📝 Notas Importantes

- Los usuarios que se registren con Google seguirán siendo redirigidos a `/patient/profile` para completar sus datos
- La historia clínica se crea durante la primera consulta con el doctor
- Los datos médicos críticos (alergias, medicamentos) están protegidos en la historia clínica
- **El médico debe ser agregado manualmente** en Firebase Authentication y Firestore con rol `doctor`
- No existe registro público para médicos por seguridad y simplicidad del sistema
