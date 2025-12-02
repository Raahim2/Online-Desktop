"use client";

import React, { useState } from 'react';
// Importing standard Chess icons from react-icons (Font Awesome 6)
import { 
  FaChessPawn, 
  FaChessKnight, 
  FaChessBishop, 
  FaChessRook, 
  FaChessQueen, 
  FaChessKing 
} from 'react-icons/fa6'; // or 'react-icons/fa'

// --- Component: Piece Renderer ---
const ChessPiece = ({ type, color, className = "" }) => {
  const isWhite = color === 'w';
  
  // Mapping types to Icons
  const Icons = {
    p: FaChessPawn,
    n: FaChessKnight,
    b: FaChessBishop,
    r: FaChessRook,
    q: FaChessQueen,
    k: FaChessKing
  };

  const IconComponent = Icons[type];

  if (!IconComponent) return null;

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <IconComponent 
        className={`
          w-4/5 h-4/5 transition-all duration-200
          ${isWhite 
            ? 'text-white drop-shadow-[0_3px_2px_rgba(0,0,0,0.6)] stroke-black stroke-2' 
            : 'text-gray-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]'
          }
        `}
        // Adding a slight stroke effect for better visibility
        style={{ 
          filter: isWhite 
            ? 'drop-shadow(1px 2px 2px rgba(0,0,0,0.7))' 
            : 'drop-shadow(0px 2px 3px rgba(0,0,0,0.5))' 
        }}
      />
    </div>
  );
};

// --- Game Constants & Logic ---

const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Helpers
const isWhite = (p) => p && p === p.toUpperCase();
const getPieceType = (p) => p ? p.toLowerCase() : null;
const getPieceColor = (p) => {
    if (!p) return null;
    return isWhite(p) ? 'w' : 'b';
};

export default function Project() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [turn, setTurn] = useState('w'); // 'w' or 'b'
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null); 
  const [winner, setWinner] = useState(null);
  const [checkState, setCheckState] = useState(null); 
  
  const [castlingRights, setCastlingRights] = useState({ 
    w: { kingside: true, queenside: true }, 
    b: { kingside: true, queenside: true } 
  });
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [captured, setCaptured] = useState({ w: [], b: [] });
  const [moveHistory, setMoveHistory] = useState([]);
  const [promotionPending, setPromotionPending] = useState(null); 

  // --- Core Logic ---

  const calculateValidMoves = (row, col, currentBoard, currentCastling, currentEnPassant) => {
    const piece = currentBoard[row][col];
    if (!piece) return [];
    
    const color = getPieceColor(piece);
    const type = getPieceType(piece);
    let moves = [];
    const isValid = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

    const checkSlide = (r, c) => {
        if (!isValid(r, c)) return false;
        const target = currentBoard[r][c];
        if (!target) {
            moves.push({ r, c });
            return true;
        } else if (getPieceColor(target) !== color) {
            moves.push({ r, c });
            return false;
        }
        return false;
    };

    if (type === 'p') {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        if (isValid(row + dir, col) && !currentBoard[row + dir][col]) {
            moves.push({ r: row + dir, c: col });
            if (row === startRow && !currentBoard[row + dir * 2][col]) {
                moves.push({ r: row + dir * 2, c: col });
            }
        }
        [[-1, dir], [1, dir]].forEach(([dc, dr]) => { 
            const nr = row + dr, nc = col + dc;
            if (isValid(nr, nc)) {
                const target = currentBoard[nr][nc];
                if (target && getPieceColor(target) !== color) moves.push({ r: nr, c: nc });
                if (currentEnPassant && nr === currentEnPassant.r && nc === currentEnPassant.c) {
                    moves.push({ r: nr, c: nc, isEnPassant: true });
                }
            }
        });
    }

    if (type === 'n') {
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
            const nr = row + dr, nc = col + dc;
            if (isValid(nr, nc)) {
                const target = currentBoard[nr][nc];
                if (!target || getPieceColor(target) !== color) moves.push({ r: nr, c: nc });
            }
        });
    }

    if (['r', 'b', 'q'].includes(type)) {
        const dirs = [];
        if (type !== 'b') dirs.push([0,1], [0,-1], [1,0], [-1,0]);
        if (type !== 'r') dirs.push([1,1], [1,-1], [-1,1], [-1,-1]);
        dirs.forEach(([dr, dc]) => {
            let nr = row + dr, nc = col + dc;
            while(checkSlide(nr, nc)) { nr += dr; nc += dc; }
        });
    }

    if (type === 'k') {
        [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
             const nr = row + dr, nc = col + dc;
             if (isValid(nr, nc)) {
                const target = currentBoard[nr][nc];
                if (!target || getPieceColor(target) !== color) moves.push({ r: nr, c: nc });
             }
        });
        const rank = color === 'w' ? 7 : 0;
        if (row === rank && col === 4 && !isSquareAttacked(row, col, color, currentBoard)) {
             if (currentCastling[color].kingside && !currentBoard[rank][5] && !currentBoard[rank][6]) {
                 moves.push({ r: rank, c: 6, isCastle: 'k' });
             }
             if (currentCastling[color].queenside && !currentBoard[rank][3] && !currentBoard[rank][2] && !currentBoard[rank][1]) {
                 moves.push({ r: rank, c: 2, isCastle: 'q' });
             }
        }
    }

    return moves.filter(m => {
        const tempBoard = currentBoard.map(r => [...r]);
        tempBoard[m.r][m.c] = tempBoard[row][col];
        tempBoard[row][col] = null;
        if (m.isCastle) {
             const transitCol = m.isCastle === 'k' ? 5 : 3;
             if (isSquareAttacked(row, transitCol, color, currentBoard)) return false;
        }
        let kingPos = null;
        for(let r=0; r<8; r++) { for(let c=0; c<8; c++) {
            const p = tempBoard[r][c];
            if (p && getPieceType(p) === 'k' && getPieceColor(p) === color) kingPos = {r, c};
        }}
        return !isSquareAttacked(kingPos.r, kingPos.c, color, tempBoard);
    });
  };

  const isSquareAttacked = (r, c, myColor, boardState) => {
      const enemyColor = myColor === 'w' ? 'b' : 'w';
      const enemyPawnDir = enemyColor === 'w' ? -1 : 1;
      
      if (r - enemyPawnDir >= 0 && r - enemyPawnDir < 8) {
          if (c-1>=0 && boardState[r-enemyPawnDir][c-1] && getPieceColor(boardState[r-enemyPawnDir][c-1])===enemyColor && getPieceType(boardState[r-enemyPawnDir][c-1])==='p') return true;
          if (c+1<8 && boardState[r-enemyPawnDir][c+1] && getPieceColor(boardState[r-enemyPawnDir][c+1])===enemyColor && getPieceType(boardState[r-enemyPawnDir][c+1])==='p') return true;
      }
      
      const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (let m of knightMoves) {
          const nr = r + m[0], nc = c + m[1];
          if (nr>=0 && nr<8 && nc>=0 && nc<8) {
              const p = boardState[nr][nc];
              if (p && getPieceColor(p) === enemyColor && getPieceType(p) === 'n') return true;
          }
      }
      
      const straights = [[0,1], [0,-1], [1,0], [-1,0]];
      const diags = [[1,1], [1,-1], [-1,1], [-1,-1]];
      
      for (let d of straights) {
          let nr = r + d[0], nc = c + d[1];
          while(nr>=0 && nr<8 && nc>=0 && nc<8) {
              const p = boardState[nr][nc];
              if (p) { if (getPieceColor(p)===enemyColor && (getPieceType(p)==='r' || getPieceType(p)==='q')) return true; break; }
              nr+=d[0]; nc+=d[1];
          }
      }
      for (let d of diags) {
          let nr = r + d[0], nc = c + d[1];
          while(nr>=0 && nr<8 && nc>=0 && nc<8) {
              const p = boardState[nr][nc];
              if (p) { if (getPieceColor(p)===enemyColor && (getPieceType(p)==='b' || getPieceType(p)==='q')) return true; break; }
              nr+=d[0]; nc+=d[1];
          }
      }

      for(let rr=-1; rr<=1; rr++) { for(let cc=-1; cc<=1; cc++) {
          if(rr===0&&cc===0) continue;
          const nr=r+rr, nc=c+cc;
          if(nr>=0&&nr<8&&nc>=0&&nc<8) {
              const p = boardState[nr][nc];
              if(p && getPieceColor(p)===enemyColor && getPieceType(p)==='k') return true;
          }
      }}
      return false;
  };

  const handleSquareClick = (r, c) => {
      if (winner || promotionPending) return;
      const clickedPiece = board[r][c];
      const isMyPiece = clickedPiece && getPieceColor(clickedPiece) === turn;

      if (selected && !isMyPiece) {
          const move = validMoves.find(m => m.r === r && m.c === c);
          if (move) executeMove(selected.r, selected.c, move);
          else { setSelected(null); setValidMoves([]); }
      } else if (isMyPiece) {
          if (selected && selected.r === r && selected.c === c) { setSelected(null); setValidMoves([]); }
          else {
              setSelected({ r, c });
              setValidMoves(calculateValidMoves(r, c, board, castlingRights, enPassantTarget));
          }
      } else { setSelected(null); setValidMoves([]); }
  };

  const executeMove = (fromR, fromC, move, promotionPiece = null) => {
      const newBoard = board.map(row => [...row]);
      const piece = newBoard[fromR][fromC];
      const target = newBoard[move.r][move.c];
      
      if (getPieceType(piece) === 'p' && (move.r === 0 || move.r === 7) && !promotionPiece) {
          setPromotionPending({ fromR, fromC, move });
          return;
      }

      if (target) {
          const capColor = getPieceColor(target);
          setCaptured(prev => ({ ...prev, [capColor]: [...prev[capColor], target] }));
      }

      newBoard[move.r][move.c] = promotionPiece ? (turn === 'w' ? promotionPiece.toUpperCase() : promotionPiece) : piece;
      newBoard[fromR][fromC] = null;

      if (move.isEnPassant) {
          const capRow = turn === 'w' ? move.r + 1 : move.r - 1;
          const capPiece = newBoard[capRow][move.c];
          newBoard[capRow][move.c] = null;
          setCaptured(prev => ({ ...prev, [turn==='w'?'b':'w']: [...prev[turn==='w'?'b':'w'], capPiece] }));
      }
      
      if (move.isCastle) {
          const rank = turn === 'w' ? 7 : 0;
          const rookFrom = move.isCastle === 'k' ? 7 : 0;
          const rookTo = move.isCastle === 'k' ? 5 : 3;
          newBoard[rank][rookTo] = newBoard[rank][rookFrom];
          newBoard[rank][rookFrom] = null;
      }

      const nextTurn = turn === 'w' ? 'b' : 'w';
      const newCastling = { ...castlingRights };
      if (getPieceType(piece) === 'k') newCastling[turn] = { kingside: false, queenside: false };
      if (getPieceType(piece) === 'r') {
          if (fromR === 7 && fromC === 0) newCastling.w.queenside = false;
          if (fromR === 7 && fromC === 7) newCastling.w.kingside = false;
          if (fromR === 0 && fromC === 0) newCastling.b.queenside = false;
          if (fromR === 0 && fromC === 7) newCastling.b.kingside = false;
      }

      let newEnPassant = null;
      if (getPieceType(piece) === 'p' && Math.abs(move.r - fromR) === 2) {
          newEnPassant = { r: (move.r + fromR) / 2, c: fromC };
      }

      let inCheck = false;
      let kingPos = null;
      for(let r=0; r<8; r++) { for(let c=0; c<8; c++) {
           const p = newBoard[r][c];
           if (p && getPieceType(p) === 'k' && getPieceColor(p) === nextTurn) kingPos = {r,c};
      }}
      if (kingPos && isSquareAttacked(kingPos.r, kingPos.c, nextTurn, newBoard)) inCheck = true;
      
      let hasLegalMoves = false;
      outerLoop:
      for(let r=0; r<8; r++) { for(let c=0; c<8; c++) {
              if (newBoard[r][c] && getPieceColor(newBoard[r][c]) === nextTurn) {
                  if (calculateValidMoves(r, c, newBoard, newCastling, newEnPassant).length > 0) {
                      hasLegalMoves = true; break outerLoop;
                  }
              }
      }}

      // Notation logic
      const type = getPieceType(piece);
      const pieceName = type === 'p' ? '' : type.toUpperCase();
      const logMsg = `${pieceName}${FILES[move.c]}${8-move.r}${inCheck?'+':''}`;
      
      setMoveHistory(prev => {
          if (turn === 'w') return [...prev, { w: logMsg, b: '' }];
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, b: logMsg }];
      });

      setBoard(newBoard);
      setTurn(nextTurn);
      setCastlingRights(newCastling);
      setEnPassantTarget(newEnPassant);
      setLastMove({ from: {r: fromR, c: fromC}, to: {r: move.r, c: move.c} });
      setSelected(null);
      setValidMoves([]);
      setPromotionPending(null);
      setCheckState(inCheck ? nextTurn : null);

      if (!hasLegalMoves) {
          if (inCheck) setWinner(turn === 'w' ? 'White' : 'Black');
          else setWinner('Draw (Stalemate)');
      }
  };

  const handlePromotionSelect = (type) => {
      const { fromR, fromC, move } = promotionPending;
      executeMove(fromR, fromC, move, type);
  };

  const resetGame = () => {
      setBoard(INITIAL_BOARD);
      setTurn('w');
      setSelected(null);
      setValidMoves([]);
      setCaptured({ w: [], b: [] });
      setWinner(null);
      setLastMove(null);
      setCheckState(null);
      setMoveHistory([]);
      setCastlingRights({ w: { kingside: true, queenside: true }, b: { kingside: true, queenside: true } });
  };

  const getSquareClass = (r, c) => {
      const isDark = (r + c) % 2 === 1;
      let base = isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'; 
      if (selected && selected.r === r && selected.c === c) base = 'bg-[#baca44]'; 
      else if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) base = 'bg-[#f5f682]'; 
      const piece = board[r][c];
      if (piece && getPieceType(piece) === 'k' && checkState === getPieceColor(piece)) return 'bg-red-500 radial-gradient';
      return base;
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#302e2c] flex flex-col xl:flex-row items-center justify-center p-4 font-sans text-[#c3c3c3]">
      
      <div className="flex flex-col gap-4 w-full max-w-[600px]">
        {/* Black HUD */}
        <div className="flex justify-between items-end px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 border-2 border-[#403e3c] rounded flex items-center justify-center shadow-md">
                   {/* Avatar/Icon placeholder */}
                   <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">Opponent</h3>
                    <div className="flex h-6 flex-wrap pl-1 items-center">
                        {captured['w'].map((p, i) => (
                            <div key={i} className="w-4 h-4 -ml-1">
                                <ChessPiece type={getPieceType(p)} color="w" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`px-3 py-1 rounded bg-[#262522] text-white/80 font-mono shadow-inner border border-white/5 ${turn === 'b' ? 'bg-white/10 text-white' : ''}`}>
                10:00
            </div>
        </div>

        {/* Board */}
        <div className="relative w-full aspect-square bg-[#302e2c] rounded shadow-2xl overflow-hidden select-none border-[3px] border-[#403e3c]">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {board.map((row, r) => row.map((piece, c) => {
                    const isValid = validMoves.find(m => m.r === r && m.c === c);
                    return (
                        <div key={`${r}-${c}`} onClick={() => handleSquareClick(r, c)} className={`relative flex items-center justify-center ${getSquareClass(r, c)}`}>
                            {c === 0 && <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${((r+c)%2===1)?'text-[#eeeed2]':'text-[#769656]'}`}>{8-r}</span>}
                            {r === 7 && <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${((r+c)%2===1)?'text-[#eeeed2]':'text-[#769656]'}`}>{FILES[c]}</span>}
                            
                            {/* Move Indicators */}
                            {isValid && !piece && <div className="absolute w-[20%] h-[20%] bg-black/20 rounded-full"></div>}
                            {isValid && piece && <div className="absolute w-full h-full border-[6px] border-black/10 rounded-full z-0"></div>}
                            
                            {/* Piece */}
                            {piece && (
                                <div className="z-10 w-full h-full cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                                    <ChessPiece type={getPieceType(piece)} color={getPieceColor(piece)} />
                                </div>
                            )}
                        </div>
                    );
                }))}
            </div>

            {/* Promotion */}
            {promotionPending && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#262522] p-4 rounded-xl shadow-2xl flex gap-3 border border-white/10">
                        {['q','r','b','n'].map(type => (
                            <button key={type} onClick={() => handlePromotionSelect(type)} className="w-16 h-16 bg-[#3c3b39] hover:bg-[#4d4d4b] rounded-lg transition-colors p-2 flex items-center justify-center">
                                <ChessPiece type={type} color={turn} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Game Over */}
            {winner && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div className="bg-[#262522] border border-white/10 p-8 rounded-xl shadow-2xl text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">{winner.includes('Draw') ? 'Draw' : `${winner} Wins!`}</h2>
                        <p className="text-gray-400 mb-6 font-medium">By {checkState ? 'Checkmate' : 'Resignation'}</p>
                        <button onClick={resetGame} className="bg-[#81b64c] hover:bg-[#a3d160] text-white font-bold py-3 px-8 rounded shadow-[0_4px_0_0_#45753c] active:translate-y-1 transition-all">New Game</button>
                    </div>
                </div>
            )}
        </div>

        {/* White HUD */}
        <div className="flex justify-between items-start px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 border-2 border-white rounded flex items-center justify-center shadow-md">
                   {/* Avatar/Icon placeholder */}
                   <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">You</h3>
                    <div className="flex h-6 flex-wrap pl-1 items-center">
                        {captured['b'].map((p, i) => (
                            <div key={i} className="w-4 h-4 -ml-1">
                                <ChessPiece type={getPieceType(p)} color="b" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`px-3 py-1 rounded bg-[#262522] text-white/80 font-mono shadow-inner border border-white/5 ${turn === 'w' ? 'bg-white text-black' : ''}`}>
                10:00
            </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="mt-8 xl:mt-0 xl:ml-8 w-full max-w-[600px] xl:w-[350px] xl:h-[650px] bg-[#262522] rounded-lg shadow-xl flex flex-col overflow-hidden border border-[#ffffff05]">
        <div className="bg-[#21201d] p-3 border-b border-[#ffffff10] flex justify-between items-center">
            <span className="font-bold text-white tracking-wide">Moves</span>
            <button onClick={resetGame} className="text-xs text-gray-400 hover:text-white transition-colors bg-[#3c3b39] px-2 py-1 rounded">Reset Board</button>
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <table className="w-full text-sm text-left border-collapse">
                <tbody>
                    {moveHistory.map((m, i) => (
                        <tr key={i} className={`${i%2===0 ? 'bg-[#262522]' : 'bg-[#21201d]'}`}>
                            <td className="p-2 w-10 text-[#5c5a57] text-center border-r border-[#ffffff05] bg-[#21201d]">{i+1}.</td>
                            <td className="p-2 text-white font-medium pl-4">{m.w}</td>
                            <td className="p-2 text-white font-medium pl-4">{m.b}</td>
                        </tr>
                    ))}
                    {moveHistory.length === 0 && <tr><td colSpan="3" className="text-center py-20 text-gray-600 italic">Game Start</td></tr>}
                </tbody>
            </table>
        </div>
        <div className="bg-[#21201d] p-4 border-t border-[#ffffff10] grid grid-cols-2 gap-3">
            <button className="py-3 bg-[#3c3b39] hover:bg-[#4a4947] text-gray-200 font-semibold rounded transition-colors text-sm shadow-sm">Offer Draw</button>
            <button onClick={() => setWinner(turn === 'w' ? 'Black' : 'White')} className="py-3 bg-[#3c3b39] hover:bg-[#4a4947] text-gray-200 font-semibold rounded transition-colors text-sm shadow-sm">Resign</button>
        </div>
      </div>
    </div>
  );
}