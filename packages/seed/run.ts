import {
  bills,
  tags,
  dietSessions,
  createMiraiStances,
  createBillsTags,
} from "./data";
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
      .from("bills_tags")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("bills")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("tags")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("diet_sessions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert tags
    console.log("🏷️  Inserting tags...");
    const { data: insertedTags, error: tagsError } = await supabase
      .from("tags")
      .insert(tags)
      .select("id, label");

    if (tagsError) {
      throw new Error(`Failed to insert tags: ${tagsError.message}`);
    }

    if (!insertedTags) {
      throw new Error("No tags were inserted");
    }

    console.log(`✅ Inserted ${insertedTags.length} tags`);

    // Insert diet sessions
    console.log("🏛️  Inserting diet sessions...");
    const { data: insertedDietSessions, error: dietSessionsError } =
      await supabase.from("diet_sessions").insert(dietSessions).select("id");

    if (dietSessionsError) {
      throw new Error(
        `Failed to insert diet sessions: ${dietSessionsError.message}`
      );
    }

    if (!insertedDietSessions) {
      throw new Error("No diet sessions were inserted");
    }

    console.log(`✅ Inserted ${insertedDietSessions.length} diet sessions`);

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

    // Link first 3 bills to the 219 diet session (current session)
    const session219Id = insertedDietSessions[0]?.id;
    if (session219Id) {
      const billsToLink = insertedBills.slice(0, 3);
      for (const bill of billsToLink) {
        await supabase
          .from("bills")
          .update({ diet_session_id: session219Id })
          .eq("id", bill.id);
      }
      console.log(`🔗 Linked ${billsToLink.length} bills to 219 diet session`);
    }

    // Link remaining bills to the 218 diet session (previous session)
    const session218Id = insertedDietSessions[1]?.id;
    if (session218Id) {
      const bills218 = insertedBills.slice(3);
      for (const bill of bills218) {
        await supabase
          .from("bills")
          .update({ diet_session_id: session218Id })
          .eq("id", bill.id);
      }
      console.log(`🔗 Linked ${bills218.length} bills to 218 diet session`);
    }

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

    // Insert bills_tags (関連付け)
    console.log("🔗 Inserting bills-tags relations...");
    const billsTags = createBillsTags(insertedBills, insertedTags);

    const { data: insertedBillsTags, error: billsTagsError } = await supabase
      .from("bills_tags")
      .insert(billsTags)
      .select();

    if (billsTagsError) {
      throw new Error(
        `Failed to insert bills-tags relations: ${billsTagsError.message}`
      );
    }

    if (!insertedBillsTags) {
      throw new Error("No bills-tags relations were inserted");
    }

    console.log(`✅ Inserted ${insertedBillsTags.length} bills-tags relations`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  Diet Sessions: ${insertedDietSessions.length}`);
    console.log(`  Tags: ${insertedTags.length}`);
    console.log(`  Bills: ${insertedBills.length}`);
    console.log(`  Bill Contents: ${insertedContents.length}`);
    console.log(`  Mirai Stances: ${insertedStances.length}`);
    console.log(`  Bills-Tags Relations: ${insertedBillsTags.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
