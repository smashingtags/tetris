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

  const mergePiece = () => {
    const newBoard = board.map(row => [...row])
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          newBoard[y + position.y][x + position.x] = 1
        }
      }
    }
    setBoard(newBoard)
  }

  const clearLines = () => {
    const newBoard = board.filter(row => !row.every(cell => cell))
    const linesCleared = BOARD_HEIGHT - newBoard.length
    if (linesCleared > 0) {
      setScore(s => s + (linesCleared * 100))
      setBoard([...Array(linesCleared).fill().map(() => Array(BOARD_WIDTH).fill(0)), ...newBoard])
    }
  }

  const moveDown = () => {
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
    const newX = position.x + direction
    if (!checkCollision(newX, position.y, currentPiece)) {
      setPosition(p => ({ ...p, x: newX }))
    }
  }

  const rotatePiece = () => {
    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[row.length - 1 - i])
    )
    if (!checkCollision(position.x, position.y, rotated)) {
      setCurrentPiece(rotated)
    }
  }

  useEffect(() => {
    if (gameOver) return
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') moveHorizontal(-1)
      if (e.key === 'ArrowRight') moveHorizontal(1)
      if (e.key === 'ArrowDown') moveDown()
      if (e.key === 'ArrowUp') rotatePiece()
      if (e.key === ' ') { // Hard drop
        while (!checkCollision(position.x, position.y + 1, currentPiece)) {
          setPosition(p => ({ ...p, y: p.y + 1 }))
        }
        moveDown()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [position, currentPiece, gameOver])

  useEffect(() => {
    if (gameOver) return
    const gameLoop = setInterval(moveDown, 1000)
    return () => clearInterval(gameLoop)
  }, [position, currentPiece, gameOver])

  useEffect(() => {
    createPiece()
  }, [])

  return (
    &lt;div className="game-container"&gt;
      &lt;div className="board"&gt;
        {board.map((row, y) =&gt;
          row.map((cell, x) =&gt; {
            const isCurrentPiece = currentPiece?.some(
              (row, py) =&gt; row[px = x - position.x] &amp;&amp; py === y - position.y
            )
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
        &lt;button onClick={() =&gt; { setGameOver(false); setScore(0); setBoard(Array(BOARD_HEIGHT).fill().map(() =&gt; Array(BOARD_WIDTH).fill(0))); createPiece() }}&gt;
          New Game
        &lt;/button&gt;
      )}
    &lt;/div&gt;
  )
}
