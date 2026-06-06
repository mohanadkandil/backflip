import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const imageStatus = ["uploaded", "processing", "done", "failed"] as const;
export type ImageStatus = (typeof imageStatus)[number];

export const images = pgTable(
  "images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid(10)),
    ownerCookie: text("owner_cookie").notNull(),
    originalKey: text("original_key").notNull(),
    processedKey: text("processed_key"),
    status: text("status", { enum: imageStatus }).notNull().default("uploaded"),
    errorMessage: text("error_message"),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    ownerIdx: index("images_owner_idx").on(t.ownerCookie),
    publicIdIdx: index("images_public_id_idx").on(t.publicId),
  }),
);

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
