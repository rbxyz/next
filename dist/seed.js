import { db } from "./index.js";
import * as schema from "./schema.js";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
console.log("🌱 Seeding database...");
async function main() {
    // Clean up existing data
    await db.delete(schema.notes);
    await db.delete(schema.workspaceMembers);
    await db.delete(schema.invites);
    await db.delete(schema.workspaces);
    await db.delete(schema.users);
    console.log("🧹 Cleaned up database");
    const hashedPassword = await bcrypt.hash("123456", 10);
    // Create users
    const [user1] = await db
        .insert(schema.users)
        .values({
        name: "John Doe",
        email: "john.doe@example.com",
        passwordHash: hashedPassword,
        emailVerified: new Date(),
    })
        .returning();
    const [user2] = await db
        .insert(schema.users)
        .values({
        name: "Jane Smith",
        email: "jane.smith@example.com",
        passwordHash: hashedPassword,
        emailVerified: new Date(),
    })
        .returning();
    if (!user1 || !user2) {
        throw new Error("Failed to create users");
    }
    console.log(`👤 Created users: ${user1.name}, ${user2.name}`);
    // Create workspaces
    const [workspace1] = await db
        .insert(schema.workspaces)
        .values({
        name: `${user1.name}'s Workspace`,
        description: "A personal workspace for John Doe",
        ownerId: user1.id,
    })
        .returning();
    const [workspace2] = await db
        .insert(schema.workspaces)
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
    await db.insert(schema.workspaceMembers).values([
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
        .insert(schema.notes)
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
