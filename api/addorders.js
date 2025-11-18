import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
    const { nama, jumlah, status } = req.body;

    const { error } = await supabase
        .from("orders")
        .insert([{ nama, jumlah, status }]);

    return res.json({ success: !error });
}
