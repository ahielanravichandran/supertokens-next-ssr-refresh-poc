import Image from "next/image";
import { redirect } from "next/navigation";
import { CelebrateIcon, SeparatorLine } from "../../assets/images";
import styles from "../page.module.css";
import { getSessionForSSR } from "../util";
import { CallAPIButton } from "./callApiButton";
import { LinksComponent } from "./linksComponent";
import { SessionAuthForNextJS } from "./sessionAuthForNextJS";

export async function HomePage() {
  const { accessTokenPayload, hasToken, error } = await getSessionForSSR();

  if (error) {
    return (
      <div>
        Something went wrong while trying to get the session. Error -{" "}
        {error.message}
      </div>
    );
  }

  // `accessTokenPayload` will be undefined if it the session does not exist or has expired
  if (accessTokenPayload === undefined) {
    if (!hasToken) {
      /**
       * This means that the user is not logged in. If you want to display some other UI in this
       * case, you can do so here.
       */
      return redirect("/auth");
    }

    /**
     * This means that the session does not exist but we have session tokens for the user.
     * In this case, hitting the session refresh route will refresh the session and then redirect
     * to the home page.
     */
    if (!accessTokenPayload) {
      return redirect("api/auth/session/refresh");
    }
  }

  /**
   * SessionAuthForNextJS will handle proper redirection for the user based on the different session states.
   * It will redirect to the login page if the session does not exist etc.
   */
  return (
    <SessionAuthForNextJS>
      <div className={styles.homeContainer}>
        <div className={styles.mainContainer}>
          <div
            className={`${styles.topBand} ${styles.successTitle} ${styles.bold500}`}
          >
            <Image
              src={CelebrateIcon}
              alt="Login successful"
              className={styles.successIcon}
            />{" "}
            Login successful
          </div>
          <div className={styles.innerContent}>
            <div>Your userID is:</div>
            <div className={`${styles.truncate} ${styles.userId}`}>
              {accessTokenPayload.sub}
            </div>
            <CallAPIButton />
          </div>
        </div>
        <LinksComponent />
        <Image
          className={styles.separatorLine}
          src={SeparatorLine}
          alt="separator"
        />
      </div>
    </SessionAuthForNextJS>
  );
}
