import { program } from "commander";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";
import { createAdminClient } from "./db";
import type { PostingEventsConfig } from "./types";

// Note: posting_events table types will be available after running migration
// and executing `pnpm db:types:gen`
interface PostingEventRow {
  slug: string;
  title: string;
  description: string | null;
  active: boolean;
}

async function syncPostingEvents(dryRun: boolean): Promise<void> {
  const yamlPath = resolve(import.meta.dirname, "..", "posting_events.yaml");
  const yamlContent = readFileSync(yamlPath, "utf-8");
  const config: PostingEventsConfig = parse(yamlContent);

  if (!config.events || config.events.length === 0) {
    console.log("No events found in YAML file");
    return;
  }

  console.log(`Found ${config.events.length} events in YAML file`);

  if (dryRun) {
    console.log("\n[DRY RUN] Would sync the following events:\n");
    for (const event of config.events) {
      console.log(`  - ${event.slug}`);
      console.log(`    Title: ${event.title}`);
      console.log(`    Description: ${event.description || "(none)"}`);
      console.log(`    Active: ${event.active}`);
      console.log("");
    }
    console.log("[DRY RUN] No changes were made to the database.");
    return;
  }

  const supabase = createAdminClient();

  console.log("\nSyncing events to database...\n");

  for (const event of config.events) {
    const { slug, title, description, active } = event;

    const row: PostingEventRow = {
      slug,
      title,
      description: description || null,
      active,
    };

    // Type assertion needed until migration is run and types are regenerated
    const { error } = await (supabase as unknown as {
      from: (table: string) => {
        upsert: (
          data: PostingEventRow,
          options: { onConflict: string }
        ) => Promise<{ error: { message: string } | null }>;
      };
    })
      .from("posting_events")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`Failed to sync event "${slug}":`, error.message);
    } else {
      console.log(`Synced: ${slug}`);
    }
  }

  console.log("\nSync completed.");
}

program
  .name("posting-sync")
  .description("Sync posting events from YAML to database")
  .option("--dry-run", "Show what would be synced without making changes")
  .action(async (options: { dryRun?: boolean }) => {
    try {
      await syncPostingEvents(options.dryRun ?? false);
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

program.parse();
