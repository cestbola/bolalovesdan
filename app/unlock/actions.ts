"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  UNLOCK_COOKIE,
  buildUnlockCookie,
  constantTimeEqual,
} from "@/lib/site-auth";

export async function unlockAction(formData: FormData) {
  const pin = formData.get("pin");
  const expected = process.env.SITE_PIN;
  const secret = process.env.SITE_SECRET;

  if (!expected || !secret) {
    throw new Error("Missing SITE_PIN or SITE_SECRET in environment.");
  }
  if (typeof pin !== "string" || !constantTimeEqual(pin, expected)) {
    redirect("/unlock?error=1");
  }

  const value = await buildUnlockCookie(secret);
  const store = await cookies();
  store.set(UNLOCK_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
