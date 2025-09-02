# 📚 Lectana Backend

API REST para la plataforma de lectura educativa **Lectana**, desarrollada en **Node.js** y **Express**. Este backend centraliza la lógica de negocio y se conecta con una base de datos **PostgreSQL** alojada en **Supabase**. Sirve tanto al panel web de administración como a la app móvil para docentes y estudiantes.

---

## 🚀 Tecnologías Utilizadas

- Node.js + Express.js
- Prisma ORM
- PostgreSQL (via [Supabase](https://supabase.com/))
- JWT para autenticación
- Multer para manejo de archivos
- Cloudinary (opcional) para archivos multimedia
- Firebase Cloud Messaging para notificaciones push
- Google Cloud Text-to-Speech API para audiocuentos

---

## 🏗️ Estructura del Proyecto
lectana-backend/
│
├── src/
│ ├── controllers/ # Lógica de cada módulo
│ ├── services/ # Lógica de negocio
│ ├── routes/ # Rutas Express
│ ├── middleware/ # Middlewares personalizados
│ ├── prisma/ # Cliente y esquema de Prisma
│ ├── utils/ # Funciones auxiliares
│ └── app.js # App principal
│
├── .env # Variables de entorno
├── package.json
└── README.md




