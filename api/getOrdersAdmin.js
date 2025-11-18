import { supabase } from "./supabase.js";

export async function getOrdersAdmin() {
    const { data } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

    return data;
}
