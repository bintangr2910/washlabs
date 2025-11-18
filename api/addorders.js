import { supabase } from "./supabase.js";

export async function addOrder(nama, telpon, barang, jumlah, status) {
    return await supabase
        .from("orders")
        .insert([{ nama, telpon, barang, jumlah, status }]);
}
