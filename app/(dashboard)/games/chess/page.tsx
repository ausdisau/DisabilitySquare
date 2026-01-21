"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

export default function ChessPage() {
  const [message, setMessage] = useState("Click a piece to start playing!");
  const [board, setBoard] = useState<string[][]>(getInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");

  function getInitialBoard() {
    return [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ];
  }

  function getPieceSymbol(piece: string) {
    const symbols: Record<string, string> = {
      k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
      K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    };
    return symbols[piece] || "";
  }

  function isWhitePiece(piece: string) {
    return piece === piece.toUpperCase() && piece !== "";
  }

  function handleSquareClick(row: number, col: number) {
    const piece = board[row][col];
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const selectedPiece = board[fromRow][fromCol];
      
      // Simple move (no validation for simplicity)
      if (row !== fromRow || col !== fromCol) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[fromRow][fromCol] = "";
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
        setMessage(`${currentPlayer === "white" ? "Black" : "White"}'s turn`);
      }
      setSelectedSquare(null);
    } else if (piece) {
      const isWhite = isWhitePiece(piece);
      if ((currentPlayer === "white" && isWhite) || (currentPlayer === "black" && !isWhite)) {
        setSelectedSquare([row, col]);
        setMessage(`Selected ${getPieceSymbol(piece)}`);
      } else {
        setMessage(`It's ${currentPlayer}'s turn!`);
      }
    }
  }

  function resetGame() {
    setBoard(getInitialBoard());
    setSelectedSquare(null);
    setCurrentPlayer("white");
    setMessage("Game reset! White starts.");
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
          <h1 className="text-3xl font-display font-bold text-primary">♟️ Chess</h1>
          <p className="text-muted-foreground">Classic strategy game</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square max-w-md mx-auto">
                <div className="grid grid-cols-8 gap-0 border-2 border-primary rounded overflow-hidden">
                  {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
                      
                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold transition-colors
                            ${isLight ? "bg-amber-100" : "bg-amber-700"}
                            ${isSelected ? "ring-4 ring-accent ring-inset" : ""}
                            hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          aria-label={`Row ${8 - rowIndex}, Column ${String.fromCharCode(65 + colIndex)}${piece ? `, ${piece}` : ""}`}
                          data-testid={`chess-square-${rowIndex}-${colIndex}`}
                        >
                          <span className={isWhitePiece(piece) ? "text-white drop-shadow-md" : "text-gray-900"}>
                            {getPieceSymbol(piece)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-2">
                {currentPlayer === "white" ? "⚪" : "⚫"} {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn
              </p>
              <p className="text-muted-foreground">{message}</p>
            </CardContent>
          </Card>

          <Button onClick={resetGame} variant="outline" className="w-full gap-2" data-testid="button-reset-chess">
            <RotateCcw className="w-4 h-4" /> Reset Game
          </Button>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" /> How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li>Click a piece to select it</li>
                <li>Click a destination to move</li>
                <li>White moves first</li>
                <li>Take turns with black</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
