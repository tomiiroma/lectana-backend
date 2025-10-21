import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Script para verificar específicamente el usuario docentetomas@docente.com
async function verificarDocenteTomas() {
  try {
    console.log('🔍 Verificando usuario: docentetomas@docente.com\n');

    // Buscar el usuario específico
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuario')
      .select(`
        id_usuario,
        nombre,
        apellido,
        email,
        edad,
        activo,
        password,
        docente:docente(id_docente, dni, verificado, institucion_nombre),
        administrador:administrador(id_administrador),
        alumno:alumno(id_alumno)
      `)
      .eq('email', 'docentetomas@docente.com');

    if (usuariosError) {
      console.error('❌ Error consultando usuarios:', usuariosError.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario docentetomas@docente.com NO encontrado en la base de datos');
      return;
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   📧 Email: ${usuario.email}`);
    console.log(`   👤 Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   🎂 Edad: ${usuario.edad}`);
    console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
    console.log(`   🔑 Password hash: ${usuario.password ? 'Presente' : 'Ausente'}`);

    // Verificar roles
    if (usuario.docente) {
      console.log(`   👨‍🏫 Rol: Docente`);
      console.log(`   🆔 ID Docente: ${usuario.docente.id_docente}`);
      console.log(`   ✅ Verificado: ${usuario.docente.verificado ? 'Sí' : 'No'}`);
      console.log(`   🏫 Institución: ${usuario.docente.institucion_nombre || 'No especificada'}`);
    } else if (usuario.administrador) {
      console.log(`   👨‍💼 Rol: Administrador`);
    } else if (usuario.alumno) {
      console.log(`   👦 Rol: Alumno`);
    } else {
      console.log(`   ❓ Rol: Sin asignar`);
    }

    // Probar la contraseña
    console.log('\n🔐 Probando contraseña "12345678"...');
    if (usuario.password) {
      const passwordMatch = await bcrypt.compare('12345678', usuario.password);
      console.log(`   🔑 Contraseña correcta: ${passwordMatch ? 'Sí' : 'No'}`);
      
      if (!passwordMatch) {
        console.log('   ⚠️  La contraseña "12345678" no coincide con el hash almacenado');
        console.log('   💡 Posibles causas:');
        console.log('      - La contraseña fue cambiada');
        console.log('      - Se usó una contraseña diferente al registrarse');
        console.log('      - El hash está corrupto');
      }
    } else {
      console.log('   ❌ No hay password hash almacenado');
    }

    // Verificar si hay múltiples usuarios con el mismo email
    if (usuarios.length > 1) {
      console.log(`\n⚠️  ADVERTENCIA: Se encontraron ${usuarios.length} usuarios con el mismo email`);
      usuarios.forEach((u, index) => {
        console.log(`   ${index + 1}. ID: ${u.id_usuario}, Activo: ${u.activo ? 'Sí' : 'No'}`);
      });
    }

    // Simular el proceso de login
    console.log('\n🧪 Simulando proceso de login...');
    
    if (!usuario.activo) {
      console.log('❌ Login fallaría: Usuario inactivo');
      return;
    }

    if (!usuario.password) {
      console.log('❌ Login fallaría: Sin password hash');
      return;
    }

    const passwordMatch = await bcrypt.compare('12345678', usuario.password);
    if (!passwordMatch) {
      console.log('❌ Login fallaría: Contraseña incorrecta');
      return;
    }

    if (!usuario.docente) {
      console.log('⚠️  Login exitoso pero sin rol de docente asignado');
      console.log('   El usuario se autenticaría como "alumno" por defecto');
    } else {
      console.log('✅ Login sería exitoso como docente');
    }

  } catch (error) {
    console.error('❌ Error verificando usuario:', error.message);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verificarDocenteTomas();
}

export { verificarDocenteTomas };
