import { registerDocente, registerAlumno, registerAdministrador } from '../services/auth.service.js';
import bcrypt from 'bcryptjs';

// Script para crear usuarios de prueba
async function crearUsuariosPrueba() {
  try {
    console.log('🚀 Creando usuarios de prueba...');

    // Crear docente de prueba
    const docentePrueba = await registerDocente({
      nombre: 'Tomás',
      apellido: 'Docente',
      email: 'docentetomas@docente.com',
      edad: 30,
      password: '12345678',
      dni: '12345678',
      telefono: '123456789',
      institucion_nombre: 'Escuela de Prueba',
      institucion_pais: 'Argentina',
      institucion_provincia: 'Buenos Aires',
      nivel_educativo: 'PRIMARIA'
    });

    console.log('✅ Docente creado:', docentePrueba.user.email);

    // Crear alumno de prueba
    const alumnoPrueba = await registerAlumno({
      nombre: 'Juan',
      apellido: 'Alumno',
      email: 'alumnojuan@alumno.com',
      edad: 8,
      password: '12345678'
    });

    console.log('✅ Alumno creado:', alumnoPrueba.user.email);

    // Crear administrador de prueba
    const adminPrueba = await registerAdministrador({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@admin.com',
      edad: 35,
      password: '12345678',
      dni: '87654321',
      telefono: '987654321'
    });

    console.log('✅ Administrador creado:', adminPrueba.user.email);

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('Docente: docentetomas@docente.com / 12345678');
    console.log('Alumno: alumnojuan@alumno.com / 12345678');
    console.log('Admin: admin@admin.com / 12345678');

  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  crearUsuariosPrueba();
}

export { crearUsuariosPrueba };

