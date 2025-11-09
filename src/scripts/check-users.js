import { supabaseAdmin } from '../config/supabase.js';

// Script para verificar usuarios existentes
async function verificarUsuariosExistentes() {
  try {
    console.log('🔍 Verificando usuarios existentes...\n');

    // Obtener todos los usuarios
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuario')
      .select(`
        id_usuario,
        nombre,
        apellido,
        email,
        edad,
        activo,
        docente:docente(id_docente, verificado),
        administrador:administrador(id_administrador),
        alumno:alumno(id_alumno)
      `);

    if (usuariosError) {
      throw new Error(usuariosError.message);
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log(`📊 Total de usuarios encontrados: ${usuarios.length}\n`);

    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🎂 Edad: ${usuario.edad}`);
      console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      
      if (usuario.docente) {
        console.log(`   👨‍🏫 Rol: Docente (Verificado: ${usuario.docente.verificado ? 'Sí' : 'No'})`);
      } else if (usuario.administrador) {
        console.log(`   👨‍💼 Rol: Administrador`);
      } else if (usuario.alumno) {
        console.log(`   👦 Rol: Alumno`);
      } else {
        console.log(`   ❓ Rol: Sin asignar`);
      }
      
      console.log('   ---');
    });

    // Buscar específicamente el email del docente
    const docenteTomas = usuarios.find(u => u.email === 'docentetomas@docente.com');
    if (docenteTomas) {
      console.log('\n✅ Usuario docentetomas@docente.com encontrado:');
      console.log(`   Estado: ${docenteTomas.activo ? 'Activo' : 'Inactivo'}`);
      console.log(`   Rol: ${docenteTomas.docente ? 'Docente' : 'Sin rol asignado'}`);
    } else {
      console.log('\n❌ Usuario docentetomas@docente.com NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verificarUsuariosExistentes();
}

export { verificarUsuariosExistentes };







