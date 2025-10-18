"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;

    // First, try to find user by clerkId
    let existingUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (existingUser) return existingUser;

    // If not found by clerkId, try to find by email and update clerkId
    const email = user.emailAddresses[0]?.emailAddress;
    if (email) {
      existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Update the existing user with the new clerkId
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { 
            clerkId: user.id,
            firstName: user.firstName || existingUser.firstName,
            lastName: user.lastName || existingUser.lastName,
            phone: user.phoneNumbers[0]?.phoneNumber || existingUser.phone,
          },
        });
        return updatedUser;
      }
    }

    // If no existing user found, create a new one
    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress || "",
        phone: user.phoneNumbers[0]?.phoneNumber,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
    return null;
  }
}
