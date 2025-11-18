import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
  const { data } = await supabase
    .from("orders")
    .select("id, nama, barang, jumlah, status")
    .order("id", { ascending: false });

  return res.status(200).json(data);
}
