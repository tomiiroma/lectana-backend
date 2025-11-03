// Script simple para resetear contraseña
import 'dotenv/config';
import bcrypt from 'bcryptjs';

console.log('🔐 Script de Reset de Contraseña\n');

// Verificar variables de entorno
console.log('📋 Verificando configuración:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}\n`);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Variables de entorno no configuradas');
  process.exit(1);
}

// Generar hash de la contraseña
console.log('🔑 Generando hash para contraseña "12345678"...');
const password = '12345678';
const hash = await bcrypt.hash(password, 12);
console.log('✅ Hash generado:', hash.substring(0, 20) + '...\n');

// Verificar que el hash funciona
console.log('🧪 Verificando hash...');
const isValid = await bcrypt.compare(password, hash);
console.log(`   Hash válido: ${isValid ? '✅ Sí' : '❌ No'}\n`);

console.log('📋 Instrucciones para actualizar manualmente:');
console.log('1. Ve a tu Supabase Dashboard');
console.log('2. Abre la tabla "usuario"');
console.log('3. Busca el usuario con email: docentetomas@docente.com');
console.log('4. Actualiza el campo "password" con este hash:');
console.log(`   ${hash}`);
console.log('5. Asegúrate de que el campo "activo" esté en "true"');
console.log('6. Guarda los cambios\n');

console.log('🚀 Después de actualizar, prueba el login con:');
console.log('   Email: docentetomas@docente.com');
console.log('   Contraseña: 12345678');



