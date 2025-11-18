import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(400).json({ error });

  return res.status(200).json(data);
}
