import connectDB from "@/app/lib/db";
import Judge from "@/app/lib/models/judge";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/authOptions';
import bcrypt from "bcryptjs";

// GET: List all judges (lean, error handling)
export async function GET() {
  try {
    await connectDB();
    const judges = await Judge.find({}, "_id username firstName name categories").lean();
    return Response.json({ success: true, judges });
  } catch (err) {
    return Response.json({ success: false, error: err.message || "Failed to fetch judges" }, { status: 500 });
  }
}

// POST: Create a new judge (with validation, hashed password, error handling)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const { username, firstName, name, password, categories } = await req.json();
    // Validate input
    if (!username || !name || !password || !categories || !Array.isArray(categories) || categories.length === 0) {
      return Response.json({ success: false, error: "All fields are required and at least one category must be selected" }, { status: 400 });
    }
    // Check if judge exists (case-insensitive)
    const exists = await Judge.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
    if (exists) {
      return Response.json({ success: false, error: "Judge already exists" }, { status: 409 });
    }
    // Create the judge and let the model handle password hashing
    console.log('Creating judge with unhashed password to let model middleware handle it');
    const judge = await Judge.create({ 
      username, 
      firstName, 
      name, 
      password, // Let the pre-save middleware hash this
      categories 
    });
    
    console.log('Judge created with ID:', judge._id);
    return Response.json({ success: true, judge: { _id: judge._id, username: judge.username, firstName: judge.firstName, name: judge.name, categories: judge.categories } }, { status: 201 });
  } catch (err) {
    return Response.json({ success: false, error: err.message || "Failed to create judge" }, { status: 500 });
  }
}
