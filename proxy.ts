// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // This function can be marked `async` if using `await` inside
// export function proxy(request: NextRequest) {
//   return NextResponse.redirect(new URL("/login", request.url));
// }

// export const config = {
//   matcher: ["/about/:path*", "/", "/dashboard"],
// };

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });

  const isAuth = !!token;

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
