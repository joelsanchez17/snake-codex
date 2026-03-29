# Classic Snake

Small zero-dependency Snake game built as a static browser app.

## Run

From this folder:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Files

- `index.html`: minimal UI shell
- `styles.css`: repo-local styling for the board and controls
- `snake-logic.js`: deterministic game state transitions
- `snake-game.js`: browser rendering, input handling, restart/pause loop

## Manual checklist

- Start moving with arrow keys or `WASD`
- Confirm the snake grows and score increments after eating food
- Confirm reversing direction directly into yourself is blocked
- Confirm hitting a wall or your own body ends the game
- Confirm `Space` pauses/resumes and `Restart` resets the run
- Confirm the on-screen controls work on narrow/mobile layouts
