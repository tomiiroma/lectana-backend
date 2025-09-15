import { z } from 'zod';
import { 
  subirPDFCuento, 
  obtenerURLPDF, 
  eliminarPDFCuento, 
  listarArchivosCuentos 
} from '../services/archivo.service.js';

const idSchema = z.object({
  id: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()),
});

export async function subirPDFController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Archivo PDF requerido' 
      });
    }

    // Validar que sea PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Solo se permiten archivos PDF' 
      });
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El archivo no puede superar los 10MB' 
      });
    }

    const result = await subirPDFCuento(id, req.file.buffer, req.file.originalname);
    
    res.status(201).json({ 
      ok: true, 
      data: result,
      message: 'PDF subido exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

export async function obtenerURLPDFController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const url = await obtenerURLPDF(id);
    
    res.json({ 
      ok: true, 
      data: { url },
      message: 'URL obtenida exitosamente' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

export async function eliminarPDFController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarPDFCuento(id);
    
    res.json({ 
      ok: true, 
      ...result 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Validación fallida', 
        detalles: error.flatten() 
      });
    }
    next(error);
  }
}

export async function listarArchivosController(req, res, next) {
  try {
    const result = await listarArchivosCuentos();
    res.json({ 
      ok: true, 
      data: result 
    });
  } catch (error) {
    next(error);
  }
}
