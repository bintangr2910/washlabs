import { supabase } from "./supabase.js";

export async function deleteOrder(id) {
    return await supabase
        .from("orders")
        .delete()
        .eq("id", id);
}
