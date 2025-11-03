import 'dotenv/config';
import { supabaseAdmin } from '../config/supabase.js';

// Script para probar el sistema de actividades de docentes
async function probarSistemaActividadesDocente() {
  try {
    console.log('🧪 Probando Sistema de Actividades para Docentes\n');

    // 1. Verificar que el docente existe
    console.log('1. Verificando docente docentetomas@docente.com...');
    const { data: docente, error: docenteError } = await supabaseAdmin
      .from('usuario')
      .select(`
        id_usuario,
        nombre,
        apellido,
        email,
        docente:docente(id_docente)
      `)
      .eq('email', 'docentetomas@docente.com')
      .single();

    if (docenteError) {
      console.log('❌ Error:', docenteError.message);
      return;
    }

    console.log('✅ Docente encontrado:');
    console.log(`   📧 Email: ${docente.email}`);
    console.log(`   👤 Nombre: ${docente.nombre} ${docente.apellido}`);
    console.log(`   🆔 ID Docente: ${docente.docente.id_docente}\n`);

    // 2. Verificar aulas del docente
    console.log('2. Verificando aulas del docente...');
    const { data: aulas, error: aulasError } = await supabaseAdmin
      .from('aula')
      .select('id_aula, nombre_aula, grado, codigo_acceso')
      .eq('docente_id_docente', docente.docente.id_docente);

    if (aulasError) {
      console.log('❌ Error:', aulasError.message);
      return;
    }

    console.log(`✅ Aulas encontradas: ${aulas.length}`);
    aulas.forEach((aula, index) => {
      console.log(`   ${index + 1}. ${aula.nombre_aula} (Grado: ${aula.grado}) - Código: ${aula.codigo_acceso}`);
    });
    console.log('');

    // 3. Verificar cuentos públicos disponibles
    console.log('3. Verificando cuentos públicos disponibles...');
    const { data: cuentos, error: cuentosError } = await supabaseAdmin
      .from('cuento')
      .select('id_cuento, titulo, edad_publico')
      .limit(5);

    if (cuentosError) {
      console.log('❌ Error:', cuentosError.message);
      return;
    }

    console.log(`✅ Cuentos disponibles: ${cuentos.length}`);
    cuentos.forEach((cuento, index) => {
      console.log(`   ${index + 1}. ${cuento.titulo} (Edad: ${cuento.edad_publico})`);
    });
    console.log('');

    // 4. Mostrar ejemplo de creación de actividad
    console.log('4. Ejemplo de creación de actividad:');
    console.log('📋 Datos necesarios para crear una actividad:');
    console.log('   - Descripción: "Actividad sobre comprensión lectora"');
    console.log('   - Tipo: "multiple_choice" o "respuesta_abierta"');
    console.log('   - Cuento ID: Seleccionar de los cuentos disponibles');
    console.log('   - Aulas IDs: Seleccionar de las aulas del docente');
    console.log('   - Preguntas: Array con enunciados y respuestas\n');

    console.log('🚀 Endpoints disponibles para el docente:');
    console.log('   POST /api/docentes/actividades - Crear actividad');
    console.log('   GET /api/docentes/actividades - Listar actividades');
    console.log('   GET /api/docentes/actividades/:id - Ver actividad específica');
    console.log('   PUT /api/docentes/actividades/:id - Actualizar actividad');
    console.log('   DELETE /api/docentes/actividades/:id - Eliminar actividad');
    console.log('   PUT /api/docentes/actividades/:id/asignar-aulas - Asignar a aulas');
    console.log('   GET /api/docentes/actividades/aula/:id - Ver actividades de aula\n');

    console.log('📝 Ejemplo de request para crear actividad:');
    console.log(`POST /api/docentes/actividades`);
    console.log(`Authorization: Bearer {token}`);
    console.log(`Content-Type: application/json`);
    console.log(`{`);
    console.log(`  "descripcion": "Actividad de comprensión lectora",`);
    console.log(`  "tipo": "multiple_choice",`);
    console.log(`  "cuento_id_cuento": ${cuentos[0]?.id_cuento || 1},`);
    console.log(`  "aulas_ids": [${aulas.map(a => a.id_aula).join(', ')}],`);
    console.log(`  "preguntas": [`);
    console.log(`    {`);
    console.log(`      "enunciado": "¿Cuál es el personaje principal del cuento?",`);
    console.log(`      "respuestas": [`);
    console.log(`        { "respuesta": "El protagonista", "es_correcta": true },`);
    console.log(`        { "respuesta": "El antagonista", "es_correcta": false }`);
    console.log(`      ]`);
    console.log(`    }`);
    console.log(`  ]`);
    console.log(`}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  probarSistemaActividadesDocente();
}

export { probarSistemaActividadesDocente };



