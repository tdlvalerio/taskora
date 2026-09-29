import { NextResponse } from "next/server";

import { deleteSession } from "@/lib/session";

export async function POST(request: Request) {
  await deleteSession();

  // 303 makes the browser follow the redirect with GET after the form POST.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
