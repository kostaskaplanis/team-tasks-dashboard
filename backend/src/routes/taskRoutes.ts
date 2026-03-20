import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = express.Router();

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof mongoose.Error.ValidationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

// GET ALL TASKS
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// POST CREATE TASK
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const task = await Task.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      status,
      priority,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: getErrorMessage(error, "Failed to create task"),
    });
  }
});

// UPDATE TASK
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const { title, description, status, priority } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: typeof description === "string" ? description.trim() : "",
        status,
        priority,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: getErrorMessage(error, "Failed to update task"),
    });
  }
});

// DELETE TASK
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid task id" });
      return;
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: getErrorMessage(error, "Failed to delete task"),
    });
  }
});

export default router;
