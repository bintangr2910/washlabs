import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.DB_URL,
    process.env.DB_KEY
);

export default async function handler(req, res) {
    const { username, password } = req.body;

    const { data, error } = await supabase
        .from("admin")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

    if (data) {
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
}
