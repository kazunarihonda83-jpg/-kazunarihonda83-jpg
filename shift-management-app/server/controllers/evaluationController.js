import { randomUUID } from 'crypto';
import db from '../db/sqlite.js';

// Get evaluations
export const getEvaluations = (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name as user_name,
        ev.first_name || ' ' || ev.last_name as evaluator_name
      FROM evaluations e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users ev ON e.evaluator_id = ev.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userId) {
      query += ' AND e.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY e.evaluation_date DESC';
    
    const evaluations = db.prepare(query).all(...params);
    
    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluations' });
  }
};

// Get evaluation by ID
export const getEvaluationById = (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = db.prepare(`
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name as user_name,
        ev.first_name || ' ' || ev.last_name as evaluator_name
      FROM evaluations e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users ev ON e.evaluator_id = ev.id
      WHERE e.id = ?
    `).get(id);
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation' });
  }
};

// Create evaluation
export const createEvaluation = (req, res) => {
  try {
    const evaluatorId = req.user.id;
    const {
      userId,
      evaluationDate,
      periodStart,
      periodEnd,
      workQuality = 3,
      punctuality = 3,
      teamwork = 3,
      customerService = 3,
      improvement = 3,
      strengths,
      areasForImprovement,
      goals,
      comments,
      status = 'draft'
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Calculate overall rating
    const overallRating = (workQuality + punctuality + teamwork + customerService + improvement) / 5;
    
    const evaluationId = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO evaluations (
        id, user_id, evaluator_id, evaluation_date, period_start, period_end,
        work_quality, punctuality, teamwork, customer_service, improvement,
        overall_rating, strengths, areas_for_improvement, goals, comments, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      evaluationId, userId, evaluatorId, evaluationDate, periodStart, periodEnd,
      workQuality, punctuality, teamwork, customerService, improvement,
      overallRating, strengths, areasForImprovement, goals, comments, status
    );
    
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(evaluationId);
    
    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Failed to create evaluation' });
  }
};

// Update evaluation
export const updateEvaluation = (req, res) => {
  try {
    const { id } = req.params;
    const {
      evaluationDate,
      periodStart,
      periodEnd,
      workQuality,
      punctuality,
      teamwork,
      customerService,
      improvement,
      strengths,
      areasForImprovement,
      goals,
      comments,
      status
    } = req.body;
    
    const updates = [];
    const params = [];
    
    if (evaluationDate !== undefined) {
      updates.push('evaluation_date = ?');
      params.push(evaluationDate);
    }
    if (periodStart !== undefined) {
      updates.push('period_start = ?');
      params.push(periodStart);
    }
    if (periodEnd !== undefined) {
      updates.push('period_end = ?');
      params.push(periodEnd);
    }
    if (workQuality !== undefined) {
      updates.push('work_quality = ?');
      params.push(workQuality);
    }
    if (punctuality !== undefined) {
      updates.push('punctuality = ?');
      params.push(punctuality);
    }
    if (teamwork !== undefined) {
      updates.push('teamwork = ?');
      params.push(teamwork);
    }
    if (customerService !== undefined) {
      updates.push('customer_service = ?');
      params.push(customerService);
    }
    if (improvement !== undefined) {
      updates.push('improvement = ?');
      params.push(improvement);
    }
    if (strengths !== undefined) {
      updates.push('strengths = ?');
      params.push(strengths);
    }
    if (areasForImprovement !== undefined) {
      updates.push('areas_for_improvement = ?');
      params.push(areasForImprovement);
    }
    if (goals !== undefined) {
      updates.push('goals = ?');
      params.push(goals);
    }
    if (comments !== undefined) {
      updates.push('comments = ?');
      params.push(comments);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    // Recalculate overall rating if any rating field changed
    if (workQuality !== undefined || punctuality !== undefined || teamwork !== undefined || 
        customerService !== undefined || improvement !== undefined) {
      
      const current = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
      const newWorkQuality = workQuality !== undefined ? workQuality : current.work_quality;
      const newPunctuality = punctuality !== undefined ? punctuality : current.punctuality;
      const newTeamwork = teamwork !== undefined ? teamwork : current.teamwork;
      const newCustomerService = customerService !== undefined ? customerService : current.customer_service;
      const newImprovement = improvement !== undefined ? improvement : current.improvement;
      
      const overallRating = (newWorkQuality + newPunctuality + newTeamwork + newCustomerService + newImprovement) / 5;
      updates.push('overall_rating = ?');
      params.push(overallRating);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE evaluations SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    
    res.json(evaluation);
  } catch (error) {
    console.error('Update evaluation error:', error);
    res.status(500).json({ error: 'Failed to update evaluation' });
  }
};

// Get feedback
export const getFeedback = (req, res) => {
  try {
    const { userId } = req.params;
    
    const feedback = db.prepare(`
      SELECT 
        f.*,
        u.first_name || ' ' || u.last_name as from_user_name
      FROM feedback f
      LEFT JOIN users u ON f.from_user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(userId);
    
    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Create feedback
export const createFeedback = (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { userId, feedbackType, category, message, isAnonymous = false } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }
    
    const feedbackId = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO feedback (id, user_id, from_user_id, feedback_type, category, message, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(feedbackId, userId, fromUserId, feedbackType, category, message, isAnonymous ? 1 : 0);
    
    const feedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(feedbackId);
    
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
};

// Get goals
export const getGoals = (req, res) => {
  try {
    const { userId } = req.params;
    
    const goals = db.prepare(`
      SELECT * FROM goals 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);
    
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// Create goal
export const createGoal = (req, res) => {
  try {
    const { userId, title, description, targetDate } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }
    
    const goalId = randomUUID();
    
    const stmt = db.prepare(`
      INSERT INTO goals (id, user_id, title, description, target_date, status, progress)
      VALUES (?, ?, ?, ?, ?, 'in_progress', 0)
    `);
    
    stmt.run(goalId, userId, title, description, targetDate);
    
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(goalId);
    
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

// Update goal
export const updateGoal = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status, progress } = req.body;
    
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (targetDate !== undefined) {
      updates.push('target_date = ?');
      params.push(targetDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      params.push(progress);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE goals SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// Get motivation stats
export const getMotivationStats = (req, res) => {
  try {
    const { userId } = req.params;
    
    // Latest evaluation rating
    const latestEval = db.prepare(`
      SELECT overall_rating FROM evaluations 
      WHERE user_id = ? 
      ORDER BY evaluation_date DESC 
      LIMIT 1
    `).get(userId);
    
    // Evaluation trend (last 3)
    const evalTrend = db.prepare(`
      SELECT overall_rating, evaluation_date FROM evaluations 
      WHERE user_id = ? 
      ORDER BY evaluation_date DESC 
      LIMIT 3
    `).all(userId);
    
    // Goal achievement rate
    const goalStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM goals 
      WHERE user_id = ?
    `).get(userId);
    
    const achievementRate = goalStats.total > 0 
      ? Math.round((goalStats.completed / goalStats.total) * 100) 
      : 0;
    
    // Positive feedback count
    const positiveFeedback = db.prepare(`
      SELECT COUNT(*) as count FROM feedback 
      WHERE user_id = ? AND feedback_type = 'positive'
    `).get(userId);
    
    res.json({
      latestRating: latestEval ? latestEval.overall_rating : 0,
      evaluationTrend: evalTrend.map(e => ({
        rating: e.overall_rating,
        date: e.evaluation_date
      })),
      goalAchievementRate: achievementRate,
      positiveFeedbackCount: positiveFeedback.count
    });
  } catch (error) {
    console.error('Get motivation stats error:', error);
    res.status(500).json({ error: 'Failed to fetch motivation stats' });
  }
};
