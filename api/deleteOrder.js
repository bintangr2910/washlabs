import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
    const { id } = req.body;

    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

    return res.json({ success: !error });
}
