const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: products } = await supabase.from("products").select("id, price, brand, section, old_price").limit(1);
  if (!products || products.length === 0) {
    console.log("No products found.");
    return;
  }
  const p = products[0];
  console.log("Product:", p);

  const { data, error } = await supabase.from("products").update({ price: 100, old_price: 200, brand: "FIZTOPZ" }).eq("id", p.id).select();
  
  if (error) {
    console.error("Update Error:", error);
  } else {
    console.log("Update Success:", data);
  }
}

main();
