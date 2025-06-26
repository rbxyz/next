import "dotenv/config";
import { db } from "./index.js";
import * as schema from "./schema.js";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar, } from "drizzle-orm/pg-core";
console.log("🌱 Seeding database...");
async function main() {
    // Clean up existing data
    await db.delete(schema.note).execute();
    await db.delete(schema.workspaceMember).execute();
    await db.delete(schema.invite).execute();
    await db.delete(schema.workspace).execute();
    await db.delete(schema.session).execute();
    await db.delete(schema.user).execute();
    console.log("🧹 Cleaned up database");
    const hashedPassword = await bcrypt.hash("123456", 10);
    // Create users
    const [user1] = await db
        .insert(schema.user)
        .values({
        id: "user1",
        name: "John Doe",
        email: "john.doe@example.com",
        passwordHash: hashedPassword,
        emailVerified: true,
    })
        .returning();
    const [user2] = await db
        .insert(schema.user)
        .values({
        id: "user2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        passwordHash: hashedPassword,
        emailVerified: true,
    })
        .returning();
    const [user3] = await db
        .insert(schema.user)
        .values({
        id: "user3",
        name: "rbxyz",
        email: "rbcr4z1@gmail.com",
        passwordHash: await bcrypt.hash("admin6969", 10),
        emailVerified: true,
    })
        .returning();
    if (!user1 || !user2 || !user3) {
        throw new Error("Failed to create users");
    }
    console.log(`👤 Created users: ${user1.name}, ${user2.name}, ${user3.name}`);
    // Create workspaces
    const [workspace1] = await db
        .insert(schema.workspace)
        .values({
        name: `${user1.name}'s Workspace`,
        description: "A personal workspace for John Doe",
        ownerId: user1.id,
    })
        .returning();
    const [workspace2] = await db
        .insert(schema.workspace)
        .values({
        name: `${user2.name}'s Workspace`,
        description: "A collaborative space for Jane Smith",
        ownerId: user2.id,
    })
        .returning();
    if (!workspace1 || !workspace2) {
        throw new Error("Failed to create workspaces");
    }
    console.log(`🏢 Created workspaces: ${workspace1.name}, ${workspace2.name}`);
    // Add owners as members
    await db.insert(schema.workspaceMember).values([
        {
            userId: user1.id,
            workspaceId: workspace1.id,
            role: "admin",
        },
        {
            userId: user2.id,
            workspaceId: workspace2.id,
            role: "admin",
        },
    ]);
    console.log("👨‍💼 Added owners as workspace members");
    // Create a note
    const [note1] = await db
        .insert(schema.note)
        .values({
        title: "Welcome Note",
        content: "# Welcome to your new workspace!\n\nThis is a sample note to get you started.",
        slug: "welcome-note",
        workspaceId: workspace1.id,
        authorId: user1.id,
    })
        .returning();
    if (!note1) {
        throw new Error("Failed to create note");
    }
    console.log(`📝 Created note: "${note1.title}"`);
}
main()
    .then(() => {
    console.log("✅ Seeding complete");
    process.exit(0);
})
    .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
