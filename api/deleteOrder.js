import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
  const { id } = req.body;

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) return res.status(400).json({ error });

  return res.status(200).json({ success: true });

  
}
