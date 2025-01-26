import { useEffect, useState, useCallback } from 'react'
import './index.css'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const TETROMINOES = {
  I: [[1, 1, 1, 1]], 
  J: [[1, 0, 0], [1, 1, 1]], 
  L: [[0, 0, 1], [1, 1, 1]], 
  O: [[1, 1], [1, 1]], 
  S: [[0, 1, 1], [1, 1, 0]], 
  T: [[0, 1, 0], [1, 1, 1]], 
  Z: [[1, 1, 0], [0, 1, 1]]
}

export default function App() {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)))
  const [currentPiece, setCurrentPiece] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const createPiece = useCallback(() => {
    const shapes = Object.keys(TETROMINOES)
    const shape = TETROMINOES[shapes[Math.floor(Math.random() * shapes.length)]]
    setCurrentPiece(shape)
    setPosition({ x: Math.floor(BOARD_WIDTH/2 - shape[0].length/2), y: 0 })
  }, [])

  const checkCollision = (newX, newY, piece) => {
    if (!piece) return true
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const boardX = newX + x
          const boardY = newY + y
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) return true
          if (boardY >= 0 && board[boardY][boardX]) return true
        }
      }
    }
    return false
  }

  // ... (keep previous mergePiece and clearLines functions unchanged)

  const moveDown = () => {
    if (!currentPiece) return
    if (!checkCollision(position.x, position.y + 1, currentPiece)) {
      setPosition(p => ({ ...p, y: p.y + 1 }))
    } else {
      mergePiece()
      clearLines()
      createPiece()
      if (checkCollision(position.x, position.y, currentPiece)) {
        setGameOver(true)
      }
    }
  }

  const moveHorizontal = (direction) => {
    if (!currentPiece) return
    const newX = position.x + direction
    if (!checkCollision(newX, position.y, currentPiece)) {
      setPosition(p => ({ ...p, x: newX }))
    }
  }

  const rotatePiece = () => {
    if (!currentPiece) return
    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[row.length - 1 - i])
    )
    if (!checkCollision(position.x, position.y, rotated)) {
      setCurrentPiece(rotated)
    }
  }

  // ... (keep previous useEffect hooks with added currentPiece checks)

  return (
    &lt;div className="game-container"&gt;
      &lt;div className="board"&gt;
        {board.map((row, y) =&gt;
          row.map((cell, x) =&gt; {
            const isCurrentPiece = currentPiece?.some((row, py) => {
              const px = x - position.x
              return px >= 0 &amp;&amp; px &lt; row.length &amp;&amp; row[px] &amp;&amp; py === y - position.y
            })
            return (
              &lt;div
                key={`${y}-${x}`}
                className={`cell ${cell || isCurrentPiece ? 'filled' : ''}`}
              /&gt;
            )
          })
        )}
      &lt;/div&gt;
      &lt;div className="score"&gt;Score: {score}&lt;/div&gt;
      {gameOver &amp;&amp; (
        &lt;button onClick={() =&gt; { 
          setGameOver(false)
          setScore(0)
          setBoard(Array(BOARD_HEIGHT).fill().map(() =&gt; Array(BOARD_WIDTH).fill(0)))
          createPiece()
        }}&gt;
          New Game
        &lt;/button&gt;
      )}
    &lt;/div&gt;
  )
}
