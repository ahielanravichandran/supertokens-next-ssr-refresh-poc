import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import Session from "supertokens-node/recipe/session";
import type { SessionContainer } from "supertokens-node/recipe/session";
import { redirect } from "next/navigation";
import { ensureSuperTokensInit } from "@/app/config/backend";

// Initialize SuperTokens
ensureSuperTokensInit();

const setCookie = (
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
    maxAge?: number;
    sameSite?: "strict" | "lax" | "none";
  }
) => {
  cookies().set(name, value, options);
};

export async function GET(request: NextRequest) {
  const cookiesFromReq = cookies();
  const sRefreshToken = cookiesFromReq.get("sRefreshToken")?.value;

  if (!sRefreshToken) {
    return Response.redirect(new URL("/auth", request.url));
  }

  let session: SessionContainer;

  try {
    session = await Session.refreshSessionWithoutRequestResponse(
      sRefreshToken,
      true
    );
  } catch (error) {
    console.log(error);
    redirect("/auth");
  }

  try {
    const {
      accessToken,
      refreshToken: updatedRefreshToken,
      frontToken,
    } = session.getAllSessionTokensDangerously();

    if (!updatedRefreshToken) {
      return Response.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    setCookie("sAccessToken", accessToken, {
      httpOnly: true,
    });
    setCookie("sRefreshToken", updatedRefreshToken, {
      httpOnly: true,
      path: "/auth/session/refresh",
    });
    setCookie("sFrontToken", frontToken, {});
    setCookie("st-last-access-token-update", Date.now().toString(), {});

    // Get return URL from query params
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
    return Response.redirect(new URL(returnTo, request.url));
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.redirect(new URL("/auth", request.url));
  }
}
