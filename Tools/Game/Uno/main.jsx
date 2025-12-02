"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  User, 
  Bot, 
  RotateCcw, 
  Trophy, 
  Gamepad2, 
  Layers, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';
import gsap from 'gsap';

// --- Game Constants & Styles ---
const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

const CARD_STYLES = {
  red: 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-red-900/40 border-red-400/50',
  blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-blue-900/40 border-blue-400/50',
  green: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 shadow-emerald-900/40 border-emerald-400/50',
  yellow: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 shadow-yellow-900/40 border-yellow-300/50',
  black: 'bg-gradient-to-br from-gray-700 via-gray-800 to-black shadow-black/60 border-gray-600/50',
};

const TEXT_COLORS = {
  red: 'text-white drop-shadow-md',
  blue: 'text-white drop-shadow-md',
  green: 'text-white drop-shadow-md',
  yellow: 'text-yellow-50 drop-shadow-sm text-shadow-black', // Darker text for yellow
  black: 'text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-400', // Rainbow text for Wild
};

// --- Logic Helpers ---
const generateDeck = () => {
  let deck = [];
  let id = 0;
  COLORS.forEach(color => {
    VALUES.forEach(value => {
      const count = value === '0' ? 1 : 2;
      for (let i = 0; i < count; i++) {
        deck.push({ id: id++, color, value, type: 'normal' });
      }
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'black', value: 'wild', type: 'wild' });
    deck.push({ id: id++, color: 'black', value: '+4', type: 'wild4' });
  }
  return shuffle(deck);
};

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// --- Main Component ---
export default function Project() {
  // Game State
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [botHand, setBotHand] = useState([]);
  const [turn, setTurn] = useState('player');
  const [currentColor, setCurrentColor] = useState('');
  const [winner, setWinner] = useState(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [gameLog, setGameLog] = useState("Welcome to UNO!");
  const [unoCall, setUnoCall] = useState(null);
  
  // Refs for GSAP
  const containerRef = useRef(null);
  const logRef = useRef(null);
  const discardRef = useRef(null);

  // --- Initialization ---
  useEffect(() => {
    startNewGame();
  }, []);

  // GSAP: Animate Log changes
  useEffect(() => {
    if (logRef.current) {
        gsap.fromTo(logRef.current, 
            { y: -10, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        );
    }
  }, [gameLog]);

  // GSAP: Shake screen on wild/draw cards
  const triggerScreenShake = (intensity = 5) => {
     gsap.to(containerRef.current, {
         x: `random(-${intensity}, ${intensity})`,
         y: `random(-${intensity}, ${intensity})`,
         duration: 0.1,
         repeat: 3,
         yoyo: true,
         clearProps: "x,y"
     });
  };

  const startNewGame = () => {
    const newDeck = generateDeck();
    const pHand = newDeck.splice(0, 7);
    const bHand = newDeck.splice(0, 7);
    let firstCard = newDeck.pop();
    
    while (firstCard.color === 'black') {
        newDeck.unshift(firstCard);
        newDeck.sort(() => Math.random() - 0.5);
        firstCard = newDeck.pop();
    }

    setDeck(newDeck);
    setPlayerHand(pHand);
    setBotHand(bHand);
    setDiscardPile([firstCard]);
    setCurrentColor(firstCard.color);
    setTurn('player');
    setWinner(null);
    setUnoCall(null);
    setGameLog("Game Started!");
    setIsColorPickerOpen(false);

    // GSAP: Dealing Animation
    const ctx = gsap.context(() => {
        gsap.from(".card-hand", {
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.2
        });
        gsap.from(".card-bot", {
            y: -100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.2
        });
    }, containerRef);
    return () => ctx.revert();
  };

  // --- Bot AI & Game Checks ---
  useEffect(() => {
    if (playerHand.length === 1) setUnoCall('player');
    else if (botHand.length === 1) setUnoCall('bot');
    else setUnoCall(null);

    if (playerHand.length === 0 && deck.length > 0) return setWinner('Player');
    if (botHand.length === 0 && deck.length > 0) return setWinner('Bot');

    if (turn === 'bot' && !winner && !isColorPickerOpen) {
      const timer = setTimeout(botPlayLogic, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, isColorPickerOpen, playerHand, botHand]);

  // --- Actions ---
  const drawCard = (who, count = 1) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discardPile];
    let drawnCards = [];

    for (let i = 0; i < count; i++) {
        if (currentDeck.length === 0) {
            if (currentDiscard.length <= 1) {
                setGameLog("Draw! No cards left.");
                setWinner("Draw");
                return;
            }
            const top = currentDiscard.pop();
            currentDeck = shuffle(currentDiscard);
            currentDiscard = [top];
            setGameLog("Deck Reshuffled 🔄");
        }
        drawnCards.push(currentDeck.pop());
    }

    setDeck(currentDeck);
    setDiscardPile(currentDiscard);

    if (who === 'player') {
      setPlayerHand(prev => [...prev, ...drawnCards]);
      if (count === 1) {
        setGameLog("You drew a card.");
        setTurn('bot');
      }
    } else {
      setBotHand(prev => [...prev, ...drawnCards]);
      if (count === 1) {
        setGameLog("Bot drew a card.");
        setTurn('player');
      }
    }
  };

  const handleCardPlay = (card, who) => {
    const topCard = discardPile[discardPile.length - 1];
    const isColorMatch = card.color === currentColor;
    const isValueMatch = card.value === topCard.value && card.color !== 'black';
    const isWild = card.color === 'black';

    if (!isColorMatch && !isValueMatch && !isWild) {
      if (who === 'player') {
          // GSAP: Shake hand to indicate invalid move
          gsap.to(".player-hand-container", { x: 5, duration: 0.05, repeat: 5, yoyo: true, clearProps: "x" });
          setGameLog("❌ Invalid move!");
      }
      return;
    }

    // Play Card
    if (who === 'player') setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    else setBotHand(prev => prev.filter(c => c.id !== card.id));

    setDiscardPile(prev => [...prev, card]);
    
    // GSAP: Animate discard pile bounce
    gsap.fromTo(discardRef.current, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });

    if (isWild) {
        if (who === 'player') {
            setIsColorPickerOpen(true);
            setGameLog("Choose a color...");
        } else {
            const counts = { red:0, blue:0, green:0, yellow:0 };
            botHand.forEach(c => { if(c.color !== 'black') counts[c.color]++; });
            const bestColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            setCurrentColor(bestColor);
            setGameLog(`Bot chose ${bestColor.toUpperCase()}`);
            handleSpecialEffects(card, who);
        }
    } else {
        setCurrentColor(card.color);
        handleSpecialEffects(card, who);
    }
  };

  const handleSpecialEffects = (card, who) => {
    const opponent = who === 'player' ? 'bot' : 'player';
    
    if (['skip', 'reverse'].includes(card.value)) {
      setGameLog(who === 'player' ? "🚫 You skipped the Bot!" : "🚫 Bot skipped you!");
      triggerScreenShake(3);
      setTurn(who); 
    } 
    else if (card.value === 'draw2') {
      setGameLog(who === 'player' ? "💥 +2! Bot skipped." : "💥 +2! You skipped.");
      triggerScreenShake(5);
      drawCard(opponent, 2); 
      setTurn(who); 
    } 
    else if (card.value === '+4') {
        if (who === 'bot') {
            setGameLog("💣 Bot played +4! You draw 4.");
            triggerScreenShake(8);
            drawCard('player', 4);
            setTurn('bot'); 
        }
    } 
    else {
      setTurn(opponent);
    }
  };

  const handleColorPick = (color) => {
    setCurrentColor(color);
    setIsColorPickerOpen(false);
    
    const topCard = discardPile[discardPile.length - 1];
    if (topCard.value === '+4') {
        drawCard('bot', 4);
        triggerScreenShake(8);
        setGameLog(`You chose ${color.toUpperCase()}. Bot draws 4!`);
        setTurn('player'); 
    } else {
        setGameLog(`You chose ${color.toUpperCase()}.`);
        setTurn('bot');
    }
  };

  const botPlayLogic = () => {
    const topCard = discardPile[discardPile.length - 1];
    const playable = botHand.filter(c => 
        c.color === currentColor || 
        (c.value === topCard.value && c.color !== 'black') || 
        c.color === 'black'
    );

    if (playable.length > 0) {
        const nonWilds = playable.filter(c => c.color !== 'black');
        let cardToPlay;
        
        if (nonWilds.length > 0) {
            const actionCard = nonWilds.find(c => ['skip', 'reverse', 'draw2'].includes(c.value));
            cardToPlay = actionCard || nonWilds[0];
        } else {
            cardToPlay = playable[0];
        }
        handleCardPlay(cardToPlay, 'bot');
    } else {
        drawCard('bot');
    }
  };

  // --- UI Components ---
  const Card = ({ card, onClick, isHidden, index, totalCards, isPlayable }) => {
    const styleClass = isHidden ? 'bg-slate-800 border-slate-600' : (CARD_STYLES[card.color] || 'bg-gray-700');
    const txtClass = isHidden ? 'text-gray-500' : (TEXT_COLORS[card.color] || 'text-white');
    
    // Fan Math
    let rotation = 0;
    let translateY = 0;
    if (!isHidden && totalCards) {
        const mid = (totalCards - 1) / 2;
        rotation = (index - mid) * 4; 
        translateY = Math.abs(index - mid) * 4; 
    }

    // Display Logic for Special Cards
    const displayValue = () => {
        if (card.value === 'wild') return <Sparkles size={32} />;
        if (card.value === '+4') return <span className="text-3xl font-black">+4</span>;
        if (card.value === 'draw2') return <span className="text-3xl font-black">+2</span>;
        if (card.value === 'skip') return <AlertCircle size={32} />;
        if (card.value === 'reverse') return <RotateCcw size={32} />;
        return <span className="text-5xl font-black">{card.value}</span>;
    };

    return (
      <div 
        onClick={onClick}
        className={`
            relative w-20 h-32 md:w-28 md:h-44 rounded-xl border-2 shadow-2xl 
            flex flex-col items-center justify-center select-none transition-all duration-300
            ${isHidden ? 'card-bot' : 'card-hand hover:-translate-y-10 hover:scale-110 hover:z-50 cursor-pointer'}
            ${isPlayable && !isHidden ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-black/50' : ''}
            ${styleClass}
        `}
        style={{ 
            marginLeft: index === 0 ? 0 : '-40px', 
            transform: !isHidden ? `rotate(${rotation}deg) translateY(${translateY}px)` : '',
            zIndex: index
        }}
      >
        {!isHidden ? (
            <>
                <span className={`absolute top-2 left-2 text-lg font-bold ${txtClass}`}>{card.value === 'wild' ? 'W' : card.value}</span>
                <div className={`w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner ${txtClass}`}>
                    {displayValue()}
                </div>
                <span className={`absolute bottom-2 right-2 text-lg font-bold transform rotate-180 ${txtClass}`}>{card.value === 'wild' ? 'W' : card.value}</span>
            </>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black rounded-lg">
                 <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center bg-yellow-500 shadow-lg transform -rotate-12">
                     <span className="text-black font-black text-sm italic tracking-tighter">UNO</span>
                 </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#1a3c32] overflow-hidden font-sans relative">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

      {/* --- HUD --- */}
      <div className="relative z-10 flex justify-between items-center p-4 bg-black/30 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <User className="text-blue-400 w-6 h-6" />
            </div>
            <div>
                <h2 className="text-white font-bold tracking-wide">PLAYER</h2>
                <div className="text-xs text-blue-300 font-mono flex items-center gap-1">
                    <Layers size={12} /> {playerHand.length} CARDS
                </div>
            </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            {!winner && (
                <div ref={logRef} className="px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center gap-2">
                   <Gamepad2 size={16} className="text-emerald-400" />
                   <span className="text-sm font-medium text-emerald-100">{gameLog}</span>
                </div>
            )}
            {!winner && (
                <div className={`mt-2 px-3 py-1 rounded text-xs font-black tracking-widest uppercase transition-colors duration-300 ${turn === 'player' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' : 'bg-red-500 text-white shadow-lg shadow-red-500/50'}`}>
                    {turn === 'player' ? "Your Turn" : "Bot Thinking..."}
                </div>
            )}
        </div>

        <div className="flex items-center gap-4 text-right">
            <div>
                <h2 className="text-white font-bold tracking-wide">BOT</h2>
                <div className="text-xs text-red-300 font-mono flex items-center justify-end gap-1">
                     {botHand.length} CARDS <Layers size={12} /> 
                </div>
            </div>
            <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <Bot className="text-red-400 w-6 h-6" />
            </div>
        </div>
      </div>

      {/* --- Game Board --- */}
      <div className="relative h-[calc(100vh-90px)] flex flex-col justify-between py-4">
        
        {/* Bot Hand */}
        <div className="flex justify-center -space-x-2 opacity-90 scale-75 md:scale-90 transition-all">
            {botHand.map((card, i) => (
                <Card key={card.id} card={card} isHidden={true} index={i} totalCards={botHand.length} />
            ))}
        </div>

        {/* Center Table */}
        <div className="flex items-center justify-center gap-16 z-0">
            {/* Draw Pile */}
            <div 
                onClick={() => turn === 'player' && !winner && !isColorPickerOpen && drawCard('player')}
                className="group relative w-24 h-36 md:w-32 md:h-48 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
                <div className="absolute top-1 left-1 w-full h-full bg-slate-800 rounded-xl border border-slate-600 shadow-xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-black rounded-xl border-2 border-slate-500 shadow-2xl flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center bg-yellow-500 shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                         <span className="text-black font-black text-xl italic tracking-tighter">UNO</span>
                    </div>
                    {turn === 'player' && !winner && <span className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Draw</span>}
                </div>
            </div>

            {/* Discard Pile */}
            <div ref={discardRef} className="relative w-24 h-36 md:w-32 md:h-48">
                 {/* Active Color Glow */}
                 <div className={`absolute -inset-8 rounded-full blur-2xl opacity-40 transition-colors duration-1000 ${
                     currentColor === 'red' ? 'bg-red-500' : 
                     currentColor === 'blue' ? 'bg-blue-500' : 
                     currentColor === 'green' ? 'bg-emerald-500' : 
                     'bg-yellow-400'
                 }`}></div>

                 {discardPile.slice(-3).map((card, i) => (
                     <div key={card.id} className="absolute inset-0" style={{ 
                        transform: `rotate(${(card.id % 20) - 10}deg)`, 
                        zIndex: i 
                     }}>
                        <Card card={card} index={0} isHidden={false} />
                     </div>
                 ))}
            </div>
        </div>

        {/* Player Hand */}
        <div className="player-hand-container flex justify-center w-full px-4 z-20 pb-4">
             <div className="relative flex justify-center w-full max-w-5xl h-32 md:h-44">
                {playerHand.map((card, i) => {
                    const topCard = discardPile[discardPile.length - 1];
                    const isPlayable = (card.color === currentColor || card.value === topCard.value || card.color === 'black');
                    
                    return (
                        <Card 
                            key={card.id}
                            card={card}
                            index={i}
                            totalCards={playerHand.length}
                            isPlayable={isPlayable && turn === 'player' && !winner}
                            onClick={() => {
                                if (turn === 'player' && !winner && !isColorPickerOpen) {
                                    handleCardPlay(card, 'player');
                                }
                            }}
                        />
                    );
                })}
             </div>
        </div>
      </div>

      {/* --- Overlays --- */}
      
      {/* UNO Shout */}
      {unoCall && (
         <div className={`absolute left-1/2 -translate-x-1/2 ${unoCall === 'player' ? 'bottom-48' : 'top-48'} z-50 pointer-events-none`}>
             <div className="bg-yellow-500 text-black font-black text-4xl px-8 py-2 rounded-full border-4 border-white shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce skew-x-[-12deg]">
                 UNO!
             </div>
         </div>
      )}

      {/* Winner Modal */}
      {winner && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">{winner.toUpperCase()} WINS!</h1>
                  <p className="text-slate-400 mb-8 font-mono">Good game!</p>
                  <button 
                    onClick={startNewGame}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
                  >
                      <RotateCcw size={20} /> Play Again
                  </button>
              </div>
          </div>
      )}

      {/* Color Picker Modal */}
      {isColorPickerOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
               <div className="bg-slate-800 p-8 rounded-3xl border border-slate-600 shadow-2xl animate-in fade-in zoom-in duration-200">
                   <h2 className="text-center text-white font-bold text-xl mb-6">Select Color</h2>
                   <div className="grid grid-cols-2 gap-4">
                       {COLORS.map(c => (
                           <button 
                            key={c}
                            onClick={() => handleColorPick(c)}
                            className={`${CARD_STYLES[c]} w-24 h-24 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-transform ring-4 ring-transparent hover:ring-white/50`}
                           />
                       ))}
                   </div>
               </div>
          </div>
      )}
    </div>
  );
}