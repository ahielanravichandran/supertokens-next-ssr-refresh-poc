import { cookies } from "next/headers";

/**
 * A helper function to retrieve session details on the server side.
 *
 * NOTE: Parses the sFrontToken cookie to get session information for server-side components.
 * Returns session context containing user payload and token status.
 */

type SessionContext = {
  hasToken: boolean;
  accessTokenPayload: any | undefined;
  userId?: string;
  sAccessToken?: string;
  error?: Error;
};

export async function getSessionForSSR(): Promise<SessionContext> {
  const cookiesFromReq = cookies();
  const cookiesArray: Array<{ name: string; value: string }> = Array.from(
    cookiesFromReq.getAll()
  ).map(({ name, value }) => ({
    name,
    value,
  }));
  const sFrontToken = cookiesArray.find(
    (cookie) => cookie.name === "sFrontToken"
  )?.value;
  const sAccessToken = cookiesArray.find(
    (cookie) => cookie.name === "sAccessToken"
  )?.value;

  if (!sFrontToken) {
    return {
      hasToken: false,
      accessTokenPayload: undefined,
      error: undefined,
    };
  }

  try {
    const decoded = JSON.parse(atob(sFrontToken));

    if (!decoded || decoded.up === undefined) {
      return {
        hasToken: false,
        accessTokenPayload: undefined,
        error: new Error("Invalid token"),
      };
    }

    // Check token expiry
    if (decoded.up.iat && decoded.up.iat < Date.now() / 1000 - 5) {
      return {
        hasToken: true,
        accessTokenPayload: undefined,
        // error: new Error("Session expired"),
      };
    }

    return {
      hasToken: true,
      accessTokenPayload: decoded.up,
      userId: decoded.up.sub,
      sAccessToken: sAccessToken,
      error: undefined,
    };
  } catch (error) {
    return {
      hasToken: false,
      accessTokenPayload: undefined,
      error: error as Error,
    };
  }
}
