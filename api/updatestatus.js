import { supabase } from "./supabase.js";

export async function updateStatus(id, status) {
    return await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
}
