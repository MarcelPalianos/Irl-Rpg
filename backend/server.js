const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let goals = [];

let character = {
  level: 1,
  xp: 0,
  stats: {
    STR: 0,
    INT: 0,
    END: 0,
    CHA: 0,
    WIS: 0
  }
};

app.post("/tasks/:taskId/complete", (req, res) => {
  let foundTask = null;
  let goalType = null;

  // find task inside all goals
  goals.forEach(goal => {
    const task = goal.tasks.find(t => t.id === req.params.taskId);
    if (task) {
      foundTask = task;
      goalType = goal.type;
    }
  });

  if (!foundTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (foundTask.done) {
    return res.json({ message: "Task already completed" });
  }

  foundTask.done = true;

  // reward system
  character.xp += 10;

  if (character.stats[goalType] !== undefined) {
    character.stats[goalType] += 1;
  }

  // level up logic
  if (character.xp >= 100) {
    character.level += 1;
    character.xp = 0;
  }

  res.json({
    message: "Task completed",
    character
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/goals", (req, res) => {
  res.json(goals);
});

app.post("/goals", (req, res) => {
  const goal = {
    id: Date.now().toString(),
    name: req.body.name,
    type: req.body.type,
    tasks: []
  };

  goals.push(goal);
  res.json(goal);
});

app.post("/goals/:id/tasks", (req, res) => {
  const goal = goals.find(g => g.id === req.params.id);

  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  const task = {
    id: Date.now().toString(),
    text: req.body.text,
    done: false
  };

  goal.tasks.push(task);
  res.json(task);
});

app.get("/character", (req, res) => {
  res.json(character);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});