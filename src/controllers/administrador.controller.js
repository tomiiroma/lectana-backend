import { z } from "zod";
import {
  crearAdministrador,
  obtenerAdministradorPorId,
  actualizarAdministrador,
  listarAdministradores,
  obtenerPerfilAdministrador,
  actualizarPerfilAdministrador,
  obtenerEstadisticasUsuarios,
  obtenerTodosUsuariosActivos,
  obtenerTodosUsuariosInactivos,
  adminActualizarAdministrador,
  cambiarContrasenaAdministrador,
} from "../services/administrador.service.js";
import {
  crearAdministradorSchema,
  actualizarAdministradorSchema,
  adminActualizarAdministradorSchema,
  listarSchema,
  actualizarPerfilSchema,
  listarTodosSchema,
  cambiarContrasenaSchema,
} from "../schemas/adminSchema.js";
import { idSchema } from "../schemas/idSchema.js";

export async function crearAdministradorController(req, res, next) {
  try {
    const payload = crearAdministradorSchema.parse(req.body);
    const admin = await crearAdministrador(payload);
    res.status(201).json({ ok: true, administrador: admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Validación fallida",
          detalles: error.flatten(),
        });
    }
    if (String(error.message).toLowerCase().includes("no encontrado")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes("ya es administrador")) {
      return res.status(409).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerAdministradorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const admin = await obtenerAdministradorPorId(id);
    if (!admin)
      return res
        .status(404)
        .json({ ok: false, error: "Administrador no encontrado" });
    res.json({ ok: true, administrador: admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Parámetros inválidos",
          detalles: error.flatten(),
        });
    }
    next(error);
  }
}

export async function actualizarAdministradorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = actualizarAdministradorSchema.parse(req.body);
    const admin = await actualizarAdministrador(id, updates);
    res.json({ ok: true, administrador: admin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Validación fallida",
          detalles: error.flatten(),
        });
    }
    next(error);
  }
}

export async function listarAdministradoresController(req, res, next) {
  try {
    const params = listarSchema.parse(req.query);
    const result = await listarAdministradores(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Parámetros inválidos",
          detalles: error.flatten(),
        });
    }
    next(error);
  }
}

export async function obtenerPerfilAdministradorController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const result = await obtenerPerfilAdministrador(usuarioId);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (String(error.message).toLowerCase().includes("no encontrado")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function actualizarPerfilAdministradorController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const updates = actualizarPerfilSchema.parse(req.body);
    const result = await actualizarPerfilAdministrador(usuarioId, updates);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Validación fallida",
          detalles: error.flatten(),
        });
    }
    if (String(error.message).toLowerCase().includes("no encontrado")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerEstadisticasUsuariosController(req, res, next) {
  try {
    const result = await obtenerEstadisticasUsuarios();
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function adminActualizarAdministradorController(req, res, next) {
  try {
    const { id } = idSchema.parse(req.params);
    const updates = adminActualizarAdministradorSchema.parse(req.body);
    const result = await adminActualizarAdministrador(id, updates);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Validación fallida",
          detalles: error.flatten(),
        });
    }
    if (String(error.message).toLowerCase().includes("no encontrado")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    next(error);
  }
}

export async function obtenerTodosUsuariosActivosController(req, res, next) {
  try {
    const params = listarTodosSchema.parse(req.query);
    const result = await obtenerTodosUsuariosActivos(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Parámetros inválidos",
          detalles: error.flatten(),
        });
    }
    next(error);
  }
}

export async function obtenerTodosUsuariosInactivosController(req, res, next) {
  try {
    const params = listarTodosSchema.parse(req.query);
    const result = await obtenerTodosUsuariosInactivos(params);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Parámetros inválidos",
          detalles: error.flatten(),
        });
    }
    next(error);
  }
}

export async function cambiarContrasenaAdministradorController(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const payload = cambiarContrasenaSchema.parse(req.body);
    const result = await cambiarContrasenaAdministrador(usuarioId, payload);
    res.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({
          ok: false,
          error: "Validación fallida",
          detalles: error.flatten(),
        });
    }
    if (String(error.message).toLowerCase().includes("no encontrado")) {
      return res.status(404).json({ ok: false, error: error.message });
    }
    if (String(error.message).toLowerCase().includes("incorrecta")) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    next(error);
  }
}
