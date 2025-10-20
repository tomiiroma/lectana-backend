import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';

// Script simple para probar la conexión a Supabase
async function probarConexionSupabase() {
  try {
    console.log('🔌 Probando conexión a Supabase...\n');

    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada'}\n`);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Variables de entorno de Supabase no configuradas correctamente');
      return;
    }

    // Probar conexión simple
    console.log('🔍 Probando consulta simple...');
    const { data, error } = await supabaseAdmin
      .from('usuario')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Error de conexión:', error.message);
      return;
    }

    console.log('✅ Conexión a Supabase exitosa\n');

    // Buscar el usuario específico
    console.log('🔍 Buscando usuario: docentetomas@docente.com');
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuario')
      .select('*')
      .eq('email', 'docentetomas@docente.com');

    if (usuariosError) {
      console.log('❌ Error buscando usuario:', usuariosError.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario docentetomas@docente.com NO encontrado');
      return;
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   📧 Email: ${usuario.email}`);
    console.log(`   👤 Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
    console.log(`   🔑 Password: ${usuario.password ? 'Presente' : 'Ausente'}`);

    // Verificar si tiene rol de docente
    const { data: docente, error: docenteError } = await supabaseAdmin
      .from('docente')
      .select('*')
      .eq('usuario_id_usuario', usuario.id_usuario)
      .single();

    if (docenteError) {
      console.log('   👨‍🏫 Rol: No es docente');
    } else {
      console.log('   👨‍🏫 Rol: Docente');
      console.log(`   ✅ Verificado: ${docente.verificado ? 'Sí' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  probarConexionSupabase();
}

export { probarConexionSupabase };

