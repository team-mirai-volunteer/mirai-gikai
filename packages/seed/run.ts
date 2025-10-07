import { bills, createMiraiStances } from "./data";
import { createBillContents } from "./bill-contents-data";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@mirai-gikai/supabase";

export function createAdminClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function seedDatabase() {
  const supabase = createAdminClient();
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
      .from("bill_contents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("bills")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert bills (force publish_status to 'published')
    console.log("📄 Inserting bills...");
    const billsToInsert = bills.map((b) => ({
      ...b,
      publish_status: "published" as Database["public"]["Enums"]["bill_publish_status"],
    }));
    const { data: insertedBills, error: billsError } = await supabase
      .from("bills")
      .insert(billsToInsert)
      .select("id, name");

    if (billsError) {
      throw new Error(`Failed to insert bills: ${billsError.message}`);
    }

    if (!insertedBills) {
      throw new Error("No bills were inserted");
    }

    console.log(`✅ Inserted ${insertedBills.length} bills`);

    // Insert bill_contents
    console.log("📚 Inserting bill contents...");
    const billContents = createBillContents(insertedBills);

    const { data: insertedContents, error: contentsError } = await supabase
      .from("bill_contents")
      .insert(billContents)
      .select("id");

    if (contentsError) {
      throw new Error(
        `Failed to insert bill contents: ${contentsError.message}`
      );
    }

    if (!insertedContents) {
      throw new Error("No bill contents were inserted");
    }

    console.log(`✅ Inserted ${insertedContents.length} bill contents`);

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
    console.log(`  Bill Contents: ${insertedContents.length}`);
    console.log(`  Mirai Stances: ${insertedStances.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
