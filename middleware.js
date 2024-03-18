export { default } from "next-auth/middleware";

// Protected routes
export const config = {
  matcher: ["/properties/add", "/profile", "/properties/saved", "/messages"],
};
