import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";

/**
 * Retrieves the session user object from the server session.
 * @returns {Promise<Object|null>} The session user object, or null if the session or user is not found.
 */
export const getSessionUser = async () => {
  try {
    const session = await getServerSession(authOptions); // getting session from authOptions

    if (!session || !session.user) {
      return null;
    }

    return {
      user: session.user,
      userId: session.user.id,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
