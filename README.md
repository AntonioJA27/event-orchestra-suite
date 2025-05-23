
# BanquetPro - Plataforma de Gestión de Eventos

## 🎯 Descripción del Proyecto

BanquetPro es una solución integral para la digitalización y optimización de operaciones de empresas de banquetes y eventos. La plataforma aborda los principales desafíos del sector: gestión de eventos, experiencia del cliente, coordinación logística, control de inventario y análisis de rentabilidad.

## 🚀 Características Principales

### 📅 Gestión de Eventos y Agenda
- Visualización y coordinación de múltiples eventos
- Calendario en tiempo real con disponibilidad de recursos
- Prevención automática de solapamiento de recursos
- Asignación inteligente de venues, personal y equipo

### 👥 Experiencia del Cliente
- Portal personalizado para clientes
- Personalización de eventos (menú, decoración, música)
- Cotización dinámica y comparativa de paquetes
- Seguimiento en tiempo real del progreso del evento

### 🧑‍💼 Coordinación Logística y Personal
- Sistema de asignación automática de personal
- Gestión basada en disponibilidad y experiencia
- Generación automática de itinerarios
- Alertas automáticas para equipos

### 📦 Gestión de Inventario
- Control de inventario en tiempo real
- Alertas automáticas para stock crítico
- Gestión y evaluación de proveedores
- Historial de entregas y calidad

### 📊 Dashboard Administrativo
- Análisis de rentabilidad por evento
- Métricas de satisfacción del cliente
- Monitoreo de consumo de recursos
- Evaluación de desempeño del personal

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **React Router** para navegación
- **TanStack Query** para gestión de estado

### Backend (Preparado)
- **FastAPI** (Python)
- **SQLAlchemy** como ORM
- **PostgreSQL** como base de datos
- **Redis** para caché
- **Alembic** para migraciones

### DevOps
- **Docker** y **Docker Compose**
- **Nginx** como reverse proxy
- Configuración para producción lista

## 🏃‍♂️ Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose (opcional)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd banquet-pro
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:8080
```

### Con Docker

1. **Ejecutar toda la aplicación**
```bash
docker-compose up -d
```

2. **Acceder a la aplicación**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### PostgreSQL Admin (PgAdmin)

This project includes PgAdmin, a web-based administration tool for PostgreSQL. You can use it to view and manage the `banquet_db` database.

**Accessing PgAdmin:**

*   URL: [http://localhost:5050](http://localhost:5050)
*   Default Email: `admin@banquet.pro`
*   Default Password: `adminpassword`

Upon logging into PgAdmin, you should find the "BanquetPro DB" server pre-configured under "Servers". This connection uses the `banquet_user` and its associated password (as defined in the `docker-compose.yml` environment for the PostgreSQL service and utilized via a pgpass file for seamless authentication within PgAdmin). You can directly browse the database schema, tables, and execute SQL queries.

## 📁 Estructura del Proyecto

```
banquet-pro/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── EventPlanning.tsx
│   │   ├── ClientPortal.tsx
│   │   ├── InventoryManagement.tsx
│   │   ├── StaffCoordination.tsx
│   │   └── Analytics.tsx
│   ├── hooks/              # Hooks personalizados
│   └── lib/                # Utilidades
├── backend/                # API Backend (FastAPI)
│   ├── routers/           # Endpoints de la API
│   ├── models.py          # Modelos de base de datos
│   ├── schemas.py         # Esquemas Pydantic
│   └── main.py           # Aplicación principal
├── docker-compose.yml     # Configuración Docker
└── Dockerfile            # Imagen Docker frontend
```

## 🎨 Funcionalidades Implementadas

### ✅ Frontend Completo
- [x] Dashboard administrativo con métricas clave
- [x] Gestión de eventos con calendario
- [x] Portal del cliente con personalización
- [x] Coordinación de personal y disponibilidad
- [x] Gestión de inventario con alertas
- [x] Analytics y reportes visuales
- [x] Navegación responsive
- [x] Diseño moderno y profesional

### 🔧 Backend (Estructura Lista)
- [x] Modelos de base de datos definidos
- [x] Esquemas de API documentados
- [x] Estructura de endpoints preparada
- [x] Configuración Docker completa
- [x] Sistema de autenticación preparado

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción con Docker
```bash
docker-compose up -d --build
```

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:
```env
DATABASE_URL=postgresql://banquet_user:banquet_password@postgres:5432/banquet_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key-here
API_PREFIX=/api/v1
```

## 📈 Próximos Pasos

1. **Implementar endpoints del backend**
2. **Conectar frontend con API**
3. **Sistema de autenticación**
4. **Notificaciones en tiempo real**
5. **Módulo de facturación**
6. **Integración con sistemas de pago**
7. **App móvil para coordinadores**

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Crear un issue en GitHub
- Email: support@banquetpro.com

---

**BanquetPro** - Digitalizando el futuro de los eventos 🎉
