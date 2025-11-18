import { createClient } from '@supabase/supabase-js';
import bcrypt from "bcryptjs";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
  const { username, password } = req.body;

  const { data: admin } = await supabase
    .from("admin")
    .select("*")
    .eq("username", username)
    .single();

  if (!admin) return res.status(401).json({ error: "Admin tidak ditemukan" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ error: "Password salah" });

  return res.status(200).json({ success: true });
}

