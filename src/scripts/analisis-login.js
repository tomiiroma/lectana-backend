// Script simple para verificar usuarios sin dependencias complejas
import 'dotenv/config';

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ No configurada'}\n`);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Variables de entorno de Supabase no configuradas correctamente');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas correctamente\n');

console.log('🔍 Análisis del problema de login:\n');
console.log('El servidor responde con: {"ok":false,"error":"Credenciales inválidas"}');
console.log('Esto significa que:\n');
console.log('1. ✅ El servidor está funcionando');
console.log('2. ✅ La conexión a Supabase está funcionando');
console.log('3. ❌ El usuario/contraseña no es válido\n');

console.log('💡 Posibles causas:\n');
console.log('1. 🔑 Contraseña incorrecta');
console.log('   - La contraseña "12345678" no coincide con la almacenada');
console.log('   - El usuario puede haber cambiado su contraseña\n');

console.log('2. 🚫 Usuario inactivo');
console.log('   - El usuario existe pero está marcado como activo=false');
console.log('   - Verificar en Supabase Dashboard\n');

console.log('3. 📧 Email incorrecto');
console.log('   - Verificar que el email esté escrito exactamente igual');
console.log('   - Puede haber espacios o caracteres especiales\n');

console.log('4. 🔄 Hash de contraseña corrupto');
console.log('   - El hash bcrypt está mal generado');
console.log('   - Problema en el proceso de registro\n');

console.log('🔧 Soluciones:\n');
console.log('1. Verificar en Supabase Dashboard:');
console.log('   - Ir a la tabla "usuario"');
console.log('   - Buscar por email: docentetomas@docente.com');
console.log('   - Verificar campos: activo, password\n');

console.log('2. Crear un nuevo usuario de prueba:');
console.log('   POST /api/docentes/crear-docente');
console.log('   Body: {');
console.log('     "nombre": "Tomás",');
console.log('     "apellido": "Docente",');
console.log('     "email": "docentetomas@docente.com",');
console.log('     "edad": 30,');
console.log('     "password": "12345678",');
console.log('     "dni": "12345678",');
console.log('     "telefono": "123456789",');
console.log('     "institucion_nombre": "Escuela de Prueba",');
console.log('     "institucion_pais": "Argentina",');
console.log('     "institucion_provincia": "Buenos Aires",');
console.log('     "nivel_educativo": "PRIMARIA"');
console.log('   }\n');

console.log('3. Resetear contraseña del usuario existente');
console.log('4. Verificar que el usuario tenga rol de docente asignado\n');

console.log('📞 Próximo paso:');
console.log('Revisa el Supabase Dashboard para ver el estado real del usuario');



