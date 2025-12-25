const db = require('./../db');

// This endpoint is no longer needed - signup is handled by authController
// Keeping for backward compatibility but it just returns the current user
exports.createUser = async (req, res) => {
  try {
    // Get user from authenticated request
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated',
      });
    }

    const stmt = db.prepare('SELECT id, email, name FROM users WHERE id = ?');
    const user = stmt.get(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.getUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, name } = req.body;

  try {
    const getStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const existingUser = getStmt.get(userId);

    if (!existingUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    const updateStmt = db.prepare(
      'UPDATE users SET email = COALESCE(?, email), name = COALESCE(?, name) WHERE id = ?'
    );
    updateStmt.run(email, name, userId);

    const updatedUser = getStmt.get(userId);

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = deleteStmt.run(userId);

    if (result.changes === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
