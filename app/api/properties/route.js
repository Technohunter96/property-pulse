import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();

    const page = request.nextUrl.searchParams.get("page") || 1;
    const pageSize = request.nextUrl.searchParams.get("pageSize") || 6;

    const skip = (page - 1) * pageSize; // index is from 0, so at 0 index there wouldn't be skipped any properties, at page 2 it's (2-1) * pageSize, so there would be skipped pageSize amount of properties (from url or default )

    const total = await Property.countDocuments({});

    const properties = await Property.find({}).skip(skip).limit(pageSize);

    const result = {
      total,
      properties,
    };

    return Response.json(result);
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};

// POST /api/properties
export const POST = async (request) => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response("User ID is required", { status: 401 });
    }

    const { userId } = sessionUser;

    const formData = await request.formData();

    // Access all values from amenities and images
    const amenities = formData.getAll("amenities");

    const images = formData
      .getAll("images")
      .filter((image) => image.name !== "");

    // Create propertyData object for database
    const propertyData = {
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
        state: formData.get("location.state"),
        zipcode: formData.get("location.zipcode"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      rates: {
        weekly: formData.get("rates.weekly"),
        monthly: formData.get("rates.monthly"),
        nightly: formData.get("rates.nightly"),
      },
      seller_info: {
        name: formData.get("seller_info.name"),
        email: formData.get("seller_info.email"),
        phone: formData.get("seller_info.phone"),
      },
      owner: userId, // id from session
    };

    // Upload image(s) to Cloudinary
    const imageUrls = [];

    // turning it into a format that can be processed and uploaded to Cloudinary
    for (const image of images) {
      const imageBuffer = await image.arrayBuffer();
      const imagesArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imagesArray);

      // Convert the image data to base 64
      const imageBase64 = imageData.toString("base64");

      // Make request to upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        {
          folder: "propertypulse",
        }
      );

      imageUrls.push(result.secure_url);

      // Add uploaded images to the propertyData object
      propertyData.images = imageUrls;
    }

    //
    const newProperty = new Property(propertyData);
    await newProperty.save();

    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    );
  } catch (error) {
    return new Response("Failed to add property", { status: 500 });
  }
};
