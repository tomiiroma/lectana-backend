import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/ping-db', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('docente').select('*').limit(1);
  if (error) return res.status(500).json({ ok: false, error });
  res.json({ ok: true, data });
});

export default router;
