import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: products } = await supabase.from("products").select("id, price").limit(1);
  if (!products || products.length === 0) {
    console.log("No products found.");
    return;
  }
  const pid = products[0].id;
  const oldPrice = products[0].price;

  console.log(`Updating product ${pid} from price ${oldPrice} to 100...`);

  const { data, error } = await supabase.from("products").update({ price: 100 }).eq("id", pid).select();
  
  if (error) {
    console.error("Update Error:", error);
  } else {
    console.log("Update Success:", data);
  }
}

main();
