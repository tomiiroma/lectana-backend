import { z } from 'zod';
import { 
  crearItem, 
  obtenerItemPorId, 
  listarItems, 
  actualizarItem, 
  eliminarItem,
  comprarItem,
  obtenerItemsComprados
} from '../services/item.service.js';

const crearItemSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria: z.enum(['avatar', 'marco', 'badge', 'tema']),
  precio_puntos: z.number().int().min(1),
  imagen_url: z.string().url().optional(),
  activo: z.boolean().default(true)
});

const actualizarItemSchema = crearItemSchema.partial();

const idSchema = z.object({
  id: z.string().uuid(),
});

export async function crearItemController(req, res, next) {
  try {
    const data = crearItemSchema.parse(req.body);
    const result = await crearItem(data);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function obtenerItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await obtenerItemPorId(id);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('no encontrado')) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function listarItemsController(req, res, next) {
  try {
    const result = await listarItems();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function actualizarItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const data = actualizarItemSchema.parse(req.body);
    const result = await actualizarItem(id, data);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function eliminarItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const result = await eliminarItem(id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    next(error);
  }
}

export async function comprarItemController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const usuarioId = req.user.sub;
    
    const result = await comprarItem(usuarioId, id);
    res.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ ok: false, error: 'Validación fallida', detalles: error.flatten() });
    }
    if (String(error.message).toLowerCase().includes('puntos insuficientes') ||
        String(error.message).toLowerCase().includes('ya tienes')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerItemsCompradosController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerItemsComprados(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}
