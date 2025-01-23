import { cookies } from "next/headers";

export default async function SessionRefreshPage() {
  const cookiesFromReq = cookies();
  const sRefreshToken = cookiesFromReq.get("sRefreshToken")?.value;

  return (
    <div>
      <h1>Session Refresh Token</h1>
      <pre>
        {sRefreshToken
          ? `Refresh Token exists: ${!!sRefreshToken}`
          : "No refresh token found"}
      </pre>
    </div>
  );
}
