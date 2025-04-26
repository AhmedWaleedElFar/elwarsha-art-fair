import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Judge from "@/app/lib/models/judge";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();
  const judges = await Judge.find({}, "_id name email category");
  return Response.json({ judges });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { email, name, password, category } = await req.json();
  if (!email || !name || !password || !category) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }
  // Check if judge exists
  const exists = await Judge.findOne({ email });
  if (exists) {
    return Response.json({ error: "Judge already exists" }, { status: 400 });
  }
  // const hash = await bcrypt.hash(password, 10);
  const judge = await Judge.create({ email, name, password, category });
  return Response.json({ judge: { _id: judge._id, email: judge.email, name: judge.name, category: judge.category } });
}
