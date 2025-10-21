import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Script para resetear contraseña directamente en la base de datos
async function resetearContraseñaDirecto() {
  try {
    console.log('🔐 Reseteando contraseña directamente en la base de datos\n');

    // Generar hash
    const password = '12345678';
    const hash = await bcrypt.hash(password, 12);
    console.log('✅ Hash generado para contraseña "12345678"\n');

    // Buscar y actualizar usuario
    console.log('🔍 Buscando usuario docentetomas@docente.com...');
    
    const { data: usuarios, error: searchError } = await supabaseAdmin
      .from('usuario')
      .select('id_usuario, nombre, apellido, email, activo')
      .eq('email', 'docentetomas@docente.com');

    if (searchError) {
      console.log('❌ Error buscando usuario:', searchError.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   📧 Email: ${usuario.email}`);
    console.log(`   👤 Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);

    // Actualizar contraseña y activar usuario
    console.log('🔄 Actualizando contraseña y activando usuario...');
    
    const { error: updateError } = await supabaseAdmin
      .from('usuario')
      .update({ 
        password: hash,
        activo: true 
      })
      .eq('id_usuario', usuario.id_usuario);

    if (updateError) {
      console.log('❌ Error actualizando usuario:', updateError.message);
      return;
    }

    console.log('✅ Usuario actualizado exitosamente\n');

    // Verificar que el docente existe
    console.log('👨‍🏫 Verificando perfil de docente...');
    const { data: docente, error: docenteError } = await supabaseAdmin
      .from('docente')
      .select('*')
      .eq('usuario_id_usuario', usuario.id_usuario)
      .single();

    if (docenteError) {
      console.log('⚠️  No hay perfil de docente. Creando...');
      
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
        console.log('❌ Error creando docente:', crearDocenteError.message);
      } else {
        console.log('✅ Perfil de docente creado');
      }
    } else {
      console.log('✅ Perfil de docente ya existe');
    }

    console.log('\n🎉 ¡Reset completado exitosamente!');
    console.log('\n📋 Credenciales actualizadas:');
    console.log('   📧 Email: docentetomas@docente.com');
    console.log('   🔑 Contraseña: 12345678');
    console.log('   ✅ Estado: Activo');
    console.log('   👨‍🏫 Rol: Docente');
    console.log('\n🚀 Ahora puedes hacer login desde Android');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
resetearContraseñaDirecto();


