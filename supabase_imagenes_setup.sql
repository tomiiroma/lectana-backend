-- Configuración de Supabase Storage para imágenes de portadas de cuentos

-- 1. Crear el bucket para imágenes de cuentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cuentos-imagenes', 'cuentos-imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para lectura pública de imágenes
CREATE POLICY "Imágenes públicas para lectura" ON storage.objects
FOR SELECT USING (bucket_id = 'cuentos-imagenes');

-- 3. Política para subir imágenes (solo administradores)
CREATE POLICY "Subir imágenes de cuentos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cuentos-imagenes' 
  AND auth.role() = 'service_role'
);

-- 4. Política para eliminar imágenes (solo administradores)
CREATE POLICY "Eliminar imágenes de cuentos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cuentos-imagenes' 
  AND auth.role() = 'service_role'
);

-- 5. Política para actualizar imágenes (solo administradores)
CREATE POLICY "Actualizar imágenes de cuentos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'cuentos-imagenes' 
  AND auth.role() = 'service_role'
);
