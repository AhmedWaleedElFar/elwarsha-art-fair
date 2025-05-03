import connectDB from "@/app/lib/db";
import Judge from "@/app/lib/models/judge";
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/authOptions';

// PUT: Update a judge by ID
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const { id } = params;
    const { username, firstName, name, password, categories } = await req.json();
    
    // Validate input
    if (!username || !name || !categories || !Array.isArray(categories) || categories.length === 0) {
      return Response.json({ success: false, error: "Username, name, and at least one category are required" }, { status: 400 });
    }
    
    // Check if username is already taken by another judge
    const existingJudge = await Judge.findOne({ 
      username: { $regex: `^${username}$`, $options: 'i' },
      _id: { $ne: id }
    });
    
    if (existingJudge) {
      return Response.json({ success: false, error: "Username is already taken by another judge" }, { status: 409 });
    }
    
    // Prepare update data
    const updateData = { username, firstName, name, categories };
    
    // Only update password if provided - let the findOneAndUpdate middleware handle hashing
    if (password) {
      console.log('Adding password to update data, middleware will handle hashing');
      updateData.password = password;
    }
    
    // Update the judge
    const updatedJudge = await Judge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedJudge) {
      return Response.json({ success: false, error: "Judge not found" }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      judge: {
        _id: updatedJudge._id,
        username: updatedJudge.username,
        firstName: updatedJudge.firstName,
        name: updatedJudge.name,
        categories: updatedJudge.categories
      }
    });
  } catch (err) {
    console.error("Error updating judge:", err);
    return Response.json({ success: false, error: err.message || "Failed to update judge" }, { status: 500 });
  }
}

// DELETE: Remove a judge by ID
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const { id } = params;
    
    const deletedJudge = await Judge.findByIdAndDelete(id);
    
    if (!deletedJudge) {
      return Response.json({ success: false, error: "Judge not found" }, { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("Error deleting judge:", err);
    return Response.json({ success: false, error: err.message || "Failed to delete judge" }, { status: 500 });
  }
}
