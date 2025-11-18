import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

export default async function handler(req, res) {
    const { data } = await supabase
        .from("orders")
        .select("nama, jumlah, status")
        .order("id", { ascending: false });

    return res.json(data);
}
