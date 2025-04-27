import connectDB from "@/app/lib/db";
import Judge from "@/app/lib/models/judge";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/authOptions';
import bcrypt from "bcryptjs";

// GET: List all judges (lean, error handling)
export async function GET() {
  try {
    await connectDB();
    const judges = await Judge.find({}, "_id name email categories").lean();
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
    const { email, name, password, categories } = await req.json();
    // Validate input
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!email || !emailRegex.test(email) || !name || !password || !categories || !Array.isArray(categories) || categories.length === 0) {
      return Response.json({ success: false, error: "All fields are required, email must be valid, and at least one category must be selected" }, { status: 400 });
    }
    // Check if judge exists (case-insensitive)
    const exists = await Judge.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (exists) {
      return Response.json({ success: false, error: "Judge already exists" }, { status: 409 });
    }
    // Debug logging for password
    console.log('Creating judge with password:', password);
    const judge = await Judge.create({ email, name, password, categories });
    return Response.json({ success: true, judge: { _id: judge._id, email: judge.email, name: judge.name, categories: judge.categories } }, { status: 201 });
  } catch (err) {
    return Response.json({ success: false, error: err.message || "Failed to create judge" }, { status: 500 });
  }
}
