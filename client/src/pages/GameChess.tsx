import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubmitScore } from "@/hooks/use-games";
import { Trophy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GameChess() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const submitScore = useSubmitScore();
  const { toast } = useToast();

  // Basic random move computer opponent for demonstration
  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
      handleGameOver();
      return;
    }
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setGame(new Chess(game.fen()));
    
    if (game.isGameOver()) handleGameOver();
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (gameOver) return false;
    
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;
      setGame(new Chess(game.fen()));
      
      if (game.isGameOver()) {
        handleGameOver();
      } else {
        setTimeout(makeRandomMove, 200);
      }
      return true;
    } catch {
      return false;
    }
  }

  function handleGameOver() {
    setGameOver(true);
    let message = "Game Over";
    let score = 0;

    if (game.isCheckmate()) {
      if (game.turn() === 'w') { // Computer (black) won
        message = "Checkmate! The computer won.";
      } else {
        message = "Checkmate! You won!";
        score = 1000;
      }
    } else if (game.isDraw()) {
      message = "Draw!";
      score = 500;
    }

    toast({
      title: message,
      description: `You scored ${score} points!`,
    });

    if (score > 0) {
      submitScore.mutate({ gameName: 'chess', score });
    }
  }

  function resetGame() {
    setGame(new Chess());
    setGameOver(false);
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-display font-bold text-primary">Chess Arena</h1>
        
        <div className="w-full max-w-[600px] aspect-square shadow-2xl rounded-lg overflow-hidden border-8 border-accent/20">
          <Chessboard position={game.fen()} onPieceDrop={onDrop} />
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={resetGame} variant="outline" className="gap-2">
            <RotateCcw className="h-5 w-5" /> New Game
          </Button>
          <Button size="lg" disabled className="gap-2">
             <Trophy className="h-5 w-5" /> 
             {gameOver ? "Game Over" : "Playing..."}
          </Button>
        </div>

        <Card className="p-6 max-w-lg w-full bg-secondary/20">
          <h3 className="font-bold text-lg mb-2">How to Play</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Drag and drop pieces to move.</li>
            <li>You play as White. The computer plays as Black.</li>
            <li>Win by checkmate to earn 1000 points.</li>
            <li>Draw earns 500 points.</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
