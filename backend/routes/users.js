const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users — admin only
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: 1 });

    const usersWithCount = await Promise.all(users.map(async (u) => {
      const taskCount = await Task.countDocuments({
        $or: [{ assignedTo: u._id }, { createdBy: u._id }]
      });
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        taskCount,
      };
    }));

    res.json({ users: usersWithCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a specific user — admin only
router.get('/:id/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tasks = await Task.find({
      $or: [{ assignedTo: req.params.id }, { createdBy: req.params.id }]
    })
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

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      tasks: normalized,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role — admin only
router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
