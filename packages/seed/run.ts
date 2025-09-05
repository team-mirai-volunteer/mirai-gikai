import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.types";
import { bills, createMiraiStances } from "./data";

// Supabase client with service role key (for bypassing RLS)
const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in reverse order due to foreign key constraints)
    console.log("🧹 Clearing existing data...");

    await supabase
      .from("mirai_stances")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("chats")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("bills")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert bills
    console.log("📄 Inserting bills...");
    const { data: insertedBills, error: billsError } = await supabase
      .from("bills")
      .insert(bills)
      .select("id, name");

    if (billsError) {
      throw new Error(`Failed to insert bills: ${billsError.message}`);
    }

    if (!insertedBills) {
      throw new Error("No bills were inserted");
    }

    console.log(`✅ Inserted ${insertedBills.length} bills`);

    // Insert mirai_stances
    console.log("🎯 Inserting mirai stances...");
    const miraiStances = createMiraiStances(insertedBills);

    const { data: insertedStances, error: stancesError } = await supabase
      .from("mirai_stances")
      .insert(miraiStances)
      .select("id");

    if (stancesError) {
      throw new Error(
        `Failed to insert mirai stances: ${stancesError.message}`
      );
    }

    if (!insertedStances) {
      throw new Error("No mirai stances were inserted");
    }

    console.log(`✅ Inserted ${insertedStances.length} mirai stances`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  Bills: ${insertedBills.length}`);
    console.log(`  Mirai Stances: ${insertedStances.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
