import connectDB from "@/config/database";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

// POST /api/bookmarks/check - Check if property is bookmarked by user to display correct button state
export const POST = async (request) => {
  try {
    await connectDB();

    const { propertyId } = await request.json();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response("User ID is required", { status: 401 });
    }

    const { userId } = sessionUser;

    // Find user in database
    const user = await User.findById(userId);

    // Check if property is bookmarked
    let isBookmarked = user.bookmarks.includes(propertyId);

    return Response.json(isBookmarked);
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
