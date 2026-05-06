const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get tasks — admin sees all, user sees own (created or assigned)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role !== 'admin'
      ? { $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }] }
      : {};

    // Admin can filter by status via query param
    if (req.user.role === 'admin' && req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    // Admin can filter by userId
    if (req.user.role === 'admin' && req.query.userId) {
      filter.$or = [{ assignedTo: req.query.userId }, { createdBy: req.query.userId }];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    const normalized = tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      assignedTo: t.assignedTo?._id || null,
      assignedToUser: t.assignedTo ? { id: t.assignedTo._id, name: t.assignedTo.name, email: t.assignedTo.email } : null,
      createdBy: t.createdBy?._id || null,
      createdByUser: t.createdBy ? { id: t.createdBy._id, name: t.createdBy.name, email: t.createdBy.email } : null,
    }));

    res.json({ tasks: normalized });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.createdBy?._id?.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo?._id?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task — both admin AND regular user can create
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const isAdmin = req.user.role === 'admin';

    // Only admin can assign tasks to other users
    let finalAssignedTo = null;
    if (isAdmin && assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) return res.status(400).json({ message: 'Assigned user not found' });
      finalAssignedTo = assignedTo;
    } else if (!isAdmin) {
      // Regular user — task is auto-assigned to themselves
      finalAssignedTo = req.user._id;
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: isAdmin ? (status || 'todo') : 'todo',
      priority: priority || 'medium',
      assignedTo: finalAssignedTo,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    const normalized = {
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedTo: task.assignedTo?._id || null,
      assignedToUser: task.assignedTo ? { id: task.assignedTo._id, name: task.assignedTo.name, email: task.assignedTo.email } : null,
      createdBy: task.createdBy?._id || null,
      createdByUser: task.createdBy ? { id: task.createdBy._id, name: task.createdBy.name, email: task.createdBy.email } : null,
    };

    res.status(201).json({ task: normalized });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.createdBy?.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (isAdmin) {
      if (title) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (assignedTo !== undefined) {
        if (assignedTo) {
          const exists = await User.findById(assignedTo);
          if (!exists) return res.status(400).json({ message: 'Assigned user not found' });
        }
        task.assignedTo = assignedTo || null;
      }
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    } else {
      // Owner or assigned user can update title, description, status, priority, dueDate of their own task
      if (title) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    const normalized = {
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignedTo: task.assignedTo?._id || null,
      assignedToUser: task.assignedTo ? { id: task.assignedTo._id, name: task.assignedTo.name, email: task.assignedTo.email } : null,
      createdBy: task.createdBy?._id || null,
      createdByUser: task.createdBy ? { id: task.createdBy._id, name: task.createdBy.name, email: task.createdBy.email } : null,
    };

    res.json({ task: normalized });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task — admin, creator, or assigned user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.createdBy?.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
