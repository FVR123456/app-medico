# Configuración para el Equipo

## 1. Clonar el repositorio

```bash
git clone https://github.com/FVR123456/app-medico.git
cd app-medico
npm install
```

## 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

**⚠️ IMPORTANTE:** 
- Solicita las credenciales al administrador del proyecto
- **NUNCA** subas el archivo `.env.local` a GitHub
- Cada desarrollador debe tener su propia copia local

## 3. Ejecutar el proyecto

```bash
npm run dev
```

## 4. Flujo de trabajo con Git

### Antes de comenzar a trabajar:
```bash
git pull origin main
```

### Después de hacer cambios:
```bash
git add .
git commit -m "Descripción clara del cambio"
git push origin main
```

### Buenas prácticas:
- Haz commits frecuentes y descriptivos
- Sincroniza con `git pull` antes de empezar a trabajar
- Resuelve conflictos inmediatamente
- Comunica cambios grandes al equipo

## 5. Estructura del proyecto

- `src/pages/patient/` - Vistas de pacientes
- `src/pages/doctor/` - Vistas de médicos
- `src/components/` - Componentes reutilizables
- `src/services/` - Lógica de negocio y Firebase
- `src/types/` - Definiciones de TypeScript

## Contacto

Si tienes problemas con la configuración, contacta al administrador del proyecto.
