import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useSubmitScore } from "@/hooks/use-games";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";

// Simple Tetris Constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30; // px

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

export default function GameTetris() {
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(Array(COLS).fill('')));
  const [activePiece, setActivePiece] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const submitScore = useSubmitScore();
  const { toast } = useToast();

  const createPiece = () => {
    const typeIdx = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[typeIdx],
      color: COLORS[typeIdx],
      x: Math.floor(COLS / 2) - 1,
      y: 0
    };
  };

  const startGame = () => {
    setGrid(Array(ROWS).fill(Array(COLS).fill('')));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setActivePiece(createPiece());
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver || !activePiece) return;

    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, activePiece, grid]);

  const movePiece = (dx: number, dy: number) => {
    if (!activePiece) return;
    
    const newX = activePiece.x + dx;
    const newY = activePiece.y + dy;

    if (isValidMove(activePiece.shape, newX, newY)) {
      setActivePiece({ ...activePiece, x: newX, y: newY });
    } else if (dy > 0) {
      // Hit bottom or another piece
      lockPiece();
    }
  };

  const rotatePiece = () => {
    if (!activePiece) return;
    const newShape = activePiece.shape[0].map((_, i) =>
      activePiece.shape.map(row => row[i]).reverse()
    );
    if (isValidMove(newShape, activePiece.x, activePiece.y)) {
      setActivePiece({ ...activePiece, shape: newShape });
    }
  };

  const isValidMove = (shape: number[][], x: number, y: number) => {
    return shape.every((row, dy) =>
      row.every((cell, dx) => {
        if (!cell) return true;
        const newX = x + dx;
        const newY = y + dy;
        return (
          newX >= 0 && newX < COLS &&
          newY < ROWS &&
          (newY < 0 || !grid[newY][newX]) // Check bounds and collisions
        );
      })
    );
  };

  const lockPiece = () => {
    const newGrid = grid.map(row => [...row]);
    let gameOverLocal = false;

    activePiece.shape.forEach((row: number[], dy: number) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const y = activePiece.y + dy;
          const x = activePiece.x + dx;
          if (y < 0) {
            gameOverLocal = true;
          } else {
            newGrid[y][x] = activePiece.color;
          }
        }
      });
    });

    if (gameOverLocal) {
      endGame();
    } else {
      // Clear lines
      let linesCleared = 0;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (newGrid[y].every(cell => cell)) {
          newGrid.splice(y, 1);
          newGrid.unshift(Array(COLS).fill(''));
          linesCleared++;
          y++; // Check same row again
        }
      }
      
      if (linesCleared > 0) {
        setScore(s => s + (linesCleared * 100 * linesCleared)); // Bonus for multiple lines
      }
      
      setGrid(newGrid);
      setActivePiece(createPiece());
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    toast({
      title: "Game Over!",
      description: `Final Score: ${score}`,
    });
    if (score > 0) {
      submitScore.mutate({ gameName: 'tetris', score });
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      if (e.key === 'ArrowLeft') movePiece(-1, 0);
      if (e.key === 'ArrowRight') movePiece(1, 0);
      if (e.key === 'ArrowDown') movePiece(0, 1);
      if (e.key === 'ArrowUp' || e.key === ' ') rotatePiece();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, activePiece, grid]);

  // Render Logic
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    
    // Draw active piece
    if (activePiece) {
      activePiece.shape.forEach((row: number[], dy: number) => {
        row.forEach((cell, dx) => {
          if (cell) {
            const y = activePiece.y + dy;
            const x = activePiece.x + dx;
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              displayGrid[y][x] = activePiece.color;
            }
          }
        });
      });
    }
    
    return displayGrid;
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-8 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Block Stacker</h1>
          <p className="text-xl font-mono bg-accent/10 px-4 py-2 rounded-lg inline-block text-accent-foreground font-bold">
            Score: {score}
          </p>
        </div>

        <div 
          className="border-8 border-primary/20 bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative"
          style={{ width: COLS * 30 + 16, height: ROWS * 30 + 16 }}
        >
          {/* Game Board */}
          <div className="grid grid-cols-10 bg-black/80 backdrop-blur-sm" style={{ width: COLS * 30, height: ROWS * 30 }}>
            {renderGrid().map((row, y) => (
              row.map((color, x) => (
                <div 
                  key={`${y}-${x}`} 
                  className="w-[30px] h-[30px] border border-white/5"
                  style={{ backgroundColor: color || 'transparent' }}
                />
              ))
            ))}
          </div>

          {/* Overlay for start/gameover */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <Button size="lg" onClick={startGame} className="text-xl px-8 py-6 rounded-2xl animate-pulse">
                {gameOver ? <><RotateCcw className="mr-2"/> Try Again</> : <><Play className="mr-2"/> Start Game</>}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Controls (Visual only for desktop really) */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
           <div />
           <Button variant="outline" size="icon" onClick={rotatePiece}><RotateCw /></Button>
           <div />
           <Button variant="outline" size="icon" onClick={() => movePiece(-1, 0)}><ArrowLeft /></Button>
           <Button variant="outline" size="icon" onClick={() => movePiece(0, 1)}><ArrowDown /></Button>
           <Button variant="outline" size="icon" onClick={() => movePiece(1, 0)}><ArrowRight /></Button>
        </div>

        <p className="text-muted-foreground text-sm">
          Use Arrow Keys to move and rotate. Space to rotate.
        </p>
      </div>
    </Layout>
  );
}
