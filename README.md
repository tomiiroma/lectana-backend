# 📚 Lectana Backend

API REST para la plataforma de lectura educativa Lectana, desarrollada en Node.js y Express. Se conecta a PostgreSQL (Supabase) y sirve a la app móvil y al panel web.

---

## 🚀 Tecnologías Utilizadas (actual)

- Node.js + Express 5
- Supabase JS (PostgreSQL)
- JWT (jsonwebtoken)
- Zod (validación)
- bcryptjs (hash de contraseñas)
- Helmet, CORS, morgan
- express-rate-limit

> Nota: No se está usando Prisma, Multer, Cloudinary ni Firebase en esta versión.

---

## ⚙️ Configuración

1) Variables de entorno (.env en la raíz):

```
JWT_SECRET=una_clave_larga_unica
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

2) Instalar dependencias
```
npm install
```

3) Ejecutar
```
npm run dev   # desarrollo
npm start     # producción
```

---

## 📡 Endpoints principales

- Salud: `GET /health`
- Auth:
  - `POST /api/auth/login` ({ email, password })
- Usuarios:
  - `POST /api/usuarios` (crear { nombre, apellido, email, edad, password })
  - `GET /api/usuarios/:id`
  - `PUT /api/usuarios/:id` (actualizar email, edad, etc.)
- Docentes:
  - `POST /api/docentes` (vincula a usuario existente; dni, datos institucionales)
  - `GET /api/docentes/:id`
  - `PUT /api/docentes/:id`
- Administradores:
  - `POST /api/administradores` (vincula a usuario existente; dni)
  - `GET /api/administradores/:id`
  - `PUT /api/administradores/:id`
- Aulas:
  - `POST /api/aulas` (crea con `codigo_acceso` aleatorio)
  - `GET /api/aulas/:id`
  - `PUT /api/aulas/:id`
  - `DELETE /api/aulas/:id`
  - `GET /api/aulas/:id/alumnos` (lista alumnos del aula)
- Actividades:
  - `POST /api/actividades`
  - `GET /api/actividades/:id`
  - `PUT /api/actividades/:id`
  - `DELETE /api/actividades/:id`

---

## 🔐 Probar login rápido

1) Crear usuario:
```
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Ana",
    "apellido":"Pérez",
    "email":"ana.perez@example.com",
    "edad":12,
    "password":"SuperSegura123"
  }'
```

2) (Opcional docente) Crear docente vinculado con el id_usuario devuelto:
```
curl -X POST http://localhost:3000/api/docentes \
  -H "Content-Type: application/json" \
  -d '{
    "dni":"30123456",
    "telefono":"+54 9 11 5555-1234",
    "institucion_nombre":"Escuela 123",
    "institucion_pais":"Argentina",
    "institucion_provincia":"Buenos Aires",
    "nivel_educativo":"PRIMARIA",
    "usuario_id_usuario": 1
  }'
```

3) Login:
```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email":"ana.perez@example.com", "password":"SuperSegura123" }'
```

---

## ✅ Notas
- Asegúrate de que `.env` esté en la raíz (mismo nivel que `package.json`).
- `.env` está ignorado en Git por `.gitignore`.
- En producción, recuerda rotar secretos si se publicaron accidentalmente.



