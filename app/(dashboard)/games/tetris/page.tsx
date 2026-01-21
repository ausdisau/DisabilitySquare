"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color: "bg-cyan-500" }, // I
  { shape: [[1, 1], [1, 1]], color: "bg-yellow-500" }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: "bg-purple-500" }, // T
  { shape: [[1, 0, 0], [1, 1, 1]], color: "bg-blue-500" }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: "bg-orange-500" }, // L
  { shape: [[0, 1, 1], [1, 1, 0]], color: "bg-green-500" }, // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: "bg-red-500" }, // Z
];

export default function TetrisPage() {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  );
  const [currentPiece, setCurrentPiece] = useState<{shape: number[][], color: string, x: number, y: number} | null>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const spawnPiece = useCallback(() => {
    const randomTetromino = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    const newPiece = {
      shape: randomTetromino.shape,
      color: randomTetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(randomTetromino.shape[0].length / 2),
      y: 0,
    };
    
    if (checkCollision(newPiece.shape, newPiece.x, newPiece.y, board)) {
      setGameOver(true);
      setIsPlaying(false);
      return null;
    }
    
    return newPiece;
  }, [board]);

  function checkCollision(shape: number[][], x: number, y: number, currentBoard: number[][]) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 || newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && currentBoard[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function lockPiece() {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const y = currentPiece.y + row;
          const x = currentPiece.x + col;
          if (y >= 0) {
            newBoard[y][x] = 1;
          }
        }
      }
    }
    
    // Clear completed lines
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== EMPTY_CELL)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
        linesCleared++;
        row++;
      }
    }
    
    setScore(prev => prev + linesCleared * 100);
    setBoard(newBoard);
    
    const newPiece = spawnPiece();
    setCurrentPiece(newPiece);
  }

  function moveDown() {
    if (!currentPiece || !isPlaying) return;
    
    if (checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, board)) {
      lockPiece();
    } else {
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    }
  }

  function moveHorizontal(dir: number) {
    if (!currentPiece || !isPlaying) return;
    const newX = currentPiece.x + dir;
    if (!checkCollision(currentPiece.shape, newX, currentPiece.y, board)) {
      setCurrentPiece({ ...currentPiece, x: newX });
    }
  }

  function rotate() {
    if (!currentPiece || !isPlaying) return;
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    if (!checkCollision(rotated, currentPiece.x, currentPiece.y, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }

  function startGame() {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL)));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    const newPiece = {
      shape: TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)].shape,
      color: TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)].color,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    };
    setCurrentPiece(newPiece);
  }

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveDown, 500);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, currentPiece]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isPlaying) return;
      switch (e.key) {
        case "ArrowLeft": moveHorizontal(-1); break;
        case "ArrowRight": moveHorizontal(1); break;
        case "ArrowDown": moveDown(); break;
        case "ArrowUp": rotate(); break;
        case " ": rotate(); break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentPiece]);

  function renderBoard() {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPiece.y + row;
            const x = currentPiece.x + col;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = 2;
            }
          }
        }
      }
    }
    
    return displayBoard;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/games">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">🧱 Tetris</h1>
          <p className="text-muted-foreground">Classic block puzzle</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="max-w-xs mx-auto bg-gray-900 p-2 rounded-lg">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
                  {renderBoard().flat().map((cell, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${
                        cell === 2 ? currentPiece?.color || "bg-primary" : 
                        cell === 1 ? "bg-gray-400" : "bg-gray-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" /> Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary" data-testid="text-score">{score}</p>
              {gameOver && (
                <p className="text-destructive font-medium mt-2">Game Over!</p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            {!isPlaying ? (
              <Button onClick={startGame} className="flex-1 gap-2" data-testid="button-start-tetris">
                <Play className="w-4 h-4" /> {gameOver ? "Play Again" : "Start"}
              </Button>
            ) : (
              <Button onClick={() => setIsPlaying(false)} variant="outline" className="flex-1 gap-2" data-testid="button-pause-tetris">
                <Pause className="w-4 h-4" /> Pause
              </Button>
            )}
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li><kbd className="px-1 bg-background rounded">←</kbd> <kbd className="px-1 bg-background rounded">→</kbd> Move</li>
                <li><kbd className="px-1 bg-background rounded">↓</kbd> Drop faster</li>
                <li><kbd className="px-1 bg-background rounded">↑</kbd> or <kbd className="px-1 bg-background rounded">Space</kbd> Rotate</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
