import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Script para resetear la contraseña del usuario docentetomas@docente.com
async function resetearContraseñaDocente() {
  try {
    console.log('🔐 Reseteando contraseña para docentetomas@docente.com\n');

    // Generar nuevo hash para la contraseña "12345678"
    console.log('🔑 Generando nuevo hash para contraseña "12345678"...');
    const nuevaContraseña = '12345678';
    const nuevoHash = await bcrypt.hash(nuevaContraseña, 12);
    console.log('✅ Hash generado exitosamente\n');

    // Buscar el usuario
    console.log('🔍 Buscando usuario docentetomas@docente.com...');
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuario')
      .select('*')
      .eq('email', 'docentetomas@docente.com');

    if (usuariosError) {
      console.log('❌ Error buscando usuario:', usuariosError.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario docentetomas@docente.com no encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   📧 Email: ${usuario.email}`);
    console.log(`   👤 Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
    console.log(`   🆔 ID: ${usuario.id_usuario}\n`);

    // Verificar si está activo
    if (!usuario.activo) {
      console.log('⚠️  El usuario está inactivo. Activándolo...');
      const { error: activarError } = await supabaseAdmin
        .from('usuario')
        .update({ activo: true })
        .eq('id_usuario', usuario.id_usuario);

      if (activarError) {
        console.log('❌ Error activando usuario:', activarError.message);
        return;
      }
      console.log('✅ Usuario activado\n');
    }

    // Actualizar la contraseña
    console.log('🔄 Actualizando contraseña...');
    const { error: updateError } = await supabaseAdmin
      .from('usuario')
      .update({ password: nuevoHash })
      .eq('id_usuario', usuario.id_usuario);

    if (updateError) {
      console.log('❌ Error actualizando contraseña:', updateError.message);
      return;
    }

    console.log('✅ Contraseña actualizada exitosamente\n');

    // Verificar que el nuevo hash funciona
    console.log('🧪 Verificando nuevo hash...');
    const hashValido = await bcrypt.compare(nuevaContraseña, nuevoHash);
    console.log(`   🔑 Hash válido: ${hashValido ? 'Sí' : 'No'}\n`);

    // Verificar rol de docente
    console.log('👨‍🏫 Verificando rol de docente...');
    const { data: docente, error: docenteError } = await supabaseAdmin
      .from('docente')
      .select('*')
      .eq('usuario_id_usuario', usuario.id_usuario)
      .single();

    if (docenteError) {
      console.log('⚠️  El usuario no tiene rol de docente asignado');
      console.log('   Creando perfil de docente...');
      
      const { error: crearDocenteError } = await supabaseAdmin
        .from('docente')
        .insert({
          usuario_id_usuario: usuario.id_usuario,
          dni: '12345678',
          telefono: '123456789',
          institucion_nombre: 'Escuela de Prueba',
          institucion_pais: 'Argentina',
          institucion_provincia: 'Buenos Aires',
          nivel_educativo: 'PRIMARIA',
          verificado: true
        });

      if (crearDocenteError) {
        console.log('❌ Error creando perfil de docente:', crearDocenteError.message);
      } else {
        console.log('✅ Perfil de docente creado exitosamente');
      }
    } else {
      console.log('✅ Usuario ya tiene rol de docente');
      console.log(`   ✅ Verificado: ${docente.verificado ? 'Sí' : 'No'}`);
    }

    console.log('\n🎉 ¡Reset de contraseña completado!');
    console.log('\n📋 Credenciales actualizadas:');
    console.log('   📧 Email: docentetomas@docente.com');
    console.log('   🔑 Contraseña: 12345678');
    console.log('   ✅ Usuario activo: Sí');
    console.log('   👨‍🏫 Rol: Docente');
    console.log('\n🚀 Ahora puedes hacer login con estas credenciales');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  resetearContraseñaDocente();
}

export { resetearContraseñaDocente };




