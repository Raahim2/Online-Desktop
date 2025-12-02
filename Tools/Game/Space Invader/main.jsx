"use client";
import React, { useEffect, useRef, useState } from 'react';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';
import MobileControls from './MobileControls';
import GameUIOverlays from './GameUIOverlays';

const Project = () => {
  const canvasRef = useRef(null);
  
  // React State for UI switching
  const [gameState, setGameState] = useState('start');
  const [finalScore, setFinalScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [bonusScore, setBonusScore] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [highScores, setHighScores] = useState([]);

  // Game configuration refs
  const gameActive = useRef(false);
  const gamePaused = useRef(false);
  const lives = useRef(3);
  const gameLevel = useRef(1);
  const gameScore = useRef(0);
  
  useEffect(() => {
    const stored = localStorage.getItem('spaceInvadersHighScores');
    if (stored) setHighScores(JSON.parse(stored));
  }, []);

  // THE GAME ENGINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize handler
    const handleResize = () => {
        const container = canvas.parentElement;
        if(container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const aspectRatio = 800 / 600;
            let newWidth, newHeight;
            
            if (containerWidth / containerHeight > aspectRatio) {
                newHeight = containerHeight;
                newWidth = containerHeight * aspectRatio;
            } else {
                newWidth = containerWidth;
                newHeight = containerWidth / aspectRatio;
            }
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // --- Audio System ---
    const sounds = {
        shoot: new Audio(), explosion: new Audio(), playerExplosion: new Audio(),
        powerUp: new Audio(), levelComplete: new Audio(), gameOver: new Audio(),
        alienMove: new Audio(), bossAppear: new Audio(), backgroundMusic: new Audio(), bossMusic: new Audio()
    };
    Object.values(sounds).forEach(s => s.volume = 0.5);

    // --- Game Objects ---
    let lastTime = 0;
    let animationId;
    let gameObjects = {
        player: null, aliens: [], bullets: [], alienBullets: [],
        barriers: [], powerUps: [], particles: [], boss: null, mysteryShip: null
    };
    
    // --- Input Handling (FIXED) ---
    const keys = { ArrowLeft: false, ArrowRight: false, Space: false, a: false, d: false, p: false };
    
    const handleKeyDown = (e) => {
        // FIX: Map the empty string " " (Spacebar) to our internal "Space" key
        const keyName = e.key === ' ' ? 'Space' : e.key;

        if (keys.hasOwnProperty(keyName)) {
            keys[keyName] = true;
            // Prevent scrolling with arrows/space
            if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
                e.preventDefault();
            }
        }
        
        if (e.key.toLowerCase() === 'p' && gameActive.current) {
            gamePaused.current = !gamePaused.current;
            const indicator = document.getElementById('pauseIndicator');
            if(indicator) indicator.style.display = gamePaused.current ? 'block' : 'none';
        }
    };

    const handleKeyUp = (e) => {
        // FIX: Map the empty string " " (Spacebar) to our internal "Space" key here as well
        const keyName = e.key === ' ' ? 'Space' : e.key;
        if (keys.hasOwnProperty(keyName)) keys[keyName] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- Game Classes ---
    class Player {
        constructor() {
            this.width = 50; this.height = 30;
            this.x = 800 / 2 - this.width / 2;
            this.y = 600 - this.height - 20;
            this.speed = 5; this.color = '#00ff00';
            this.bulletSpeed = 7; this.bulletCooldown = 500;
            this.lastBulletTime = 0;
            this.powerUps = {
                rapidFire: {active: false, duration: 0, maxDuration: 8000},
                doubleBullet: {active: false, duration: 0, maxDuration: 10000},
                shield: {active: false, duration: 0, maxDuration: 15000, hits: 0}
            };
            this.invincible = false; this.invincibleTimeout = null;
            this.frame = 0; this.frameCount = 0;
        }
        draw() {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath(); ctx.fill();
            
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + 10, 10, 10);
            
            if (this.powerUps.shield.active) {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.8, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (this.invincible) {
                this.frameCount++;
                if (this.frameCount % 10 === 0) this.frame = !this.frame;
                if (this.frame) ctx.globalAlpha = 0.5;
            }
            ctx.restore();
        }
        update(deltaTime) {
            // Powerup Logic
            for (const [name, p] of Object.entries(this.powerUps)) {
                if (p.active) {
                    p.duration -= deltaTime;
                    if (p.duration <= 0) {
                        p.active = false;
                        updatePowerUpIndicator(name, false);
                    } else {
                        updatePowerUpTimer(name, p.duration / p.maxDuration);
                    }
                }
            }
            
            // Movement
            if (keys.ArrowLeft || keys.a) this.x = Math.max(0, this.x - this.speed);
            if (keys.ArrowRight || keys.d) this.x = Math.min(800 - this.width, this.x + this.speed);
            
            // Firing
            const mobileFire = window.mobileFireActive || false;
            
            // Check checks for keys.Space OR mobileFire
            if ((keys.Space || mobileFire) && gameActive.current && !gamePaused.current) {
                const now = Date.now();
                const cd = this.powerUps.rapidFire.active ? this.bulletCooldown / 3 : this.bulletCooldown;
                
                if (now - this.lastBulletTime > cd) {
                    this.shoot();
                    this.lastBulletTime = now;
                }
            }
        }
        shoot() {
            sounds.shoot.currentTime = 0; 
            sounds.shoot.play().catch(()=>{}); // Ignore audio errors
            
            if (this.powerUps.doubleBullet.active) {
                gameObjects.bullets.push(new Bullet(this.x + 10, this.y, this.bulletSpeed, 'player'));
                gameObjects.bullets.push(new Bullet(this.x + this.width - 10, this.y, this.bulletSpeed, 'player'));
            } else {
                gameObjects.bullets.push(new Bullet(this.x + this.width / 2, this.y, this.bulletSpeed, 'player'));
            }
        }
        hit() {
            if (this.invincible) return false;
            if (this.powerUps.shield.active) {
                this.powerUps.shield.hits++;
                if (this.powerUps.shield.hits >= 3) {
                    this.powerUps.shield.active = false;
                    this.powerUps.shield.hits = 0;
                    updatePowerUpIndicator('shield', false);
                }
                return false;
            }
            sounds.playerExplosion.currentTime = 0; sounds.playerExplosion.play().catch(()=>{});
            createParticles(this.x + this.width/2, this.y + this.height/2, 30, '#ff0000', 2, 3);
            lives.current--;
            if (lives.current > 0) {
                this.invincible = true;
                clearTimeout(this.invincibleTimeout);
                this.invincibleTimeout = setTimeout(() => { this.invincible = false; }, 3000);
                return false;
            }
            return true;
        }
        activatePowerUp(type) {
            if (this.powerUps[type]) {
                this.powerUps[type].active = true;
                this.powerUps[type].duration = this.powerUps[type].maxDuration;
                updatePowerUpIndicator(type, true);
            }
        }
    }

    class Bullet {
        constructor(x, y, speed, type, horizontalSpeed = 0) {
            this.x = x; this.y = y; this.width = 4; this.height = type === 'player' ? 15 : 10;
            this.speed = speed; this.type = type; this.horizontalSpeed = horizontalSpeed;
            this.color = type === 'player' ? '#00ffff' : '#ff0000';
        }
        draw() {
            ctx.save(); ctx.fillStyle = this.color;
            if (this.type === 'player') {
                ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
            } else {
                ctx.beginPath(); ctx.ellipse(this.x, this.y, this.width, this.height, 0, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        }
        update() {
            this.y -= this.speed; this.x += this.horizontalSpeed;
            return this.y < 0 || this.y > 600;
        }
    }

    class Alien {
        constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type;
            this.width = 40; this.height = 30; this.speed = 1; this.direction = 1;
            this.points = this.type * 10;
            this.color = type === 1 ? '#ff0000' : type === 2 ? '#00ff00' : type === 3 ? '#0000ff' : '#ffff00';
            this.frame = 0; this.frameCount = 0;
        }
        draw() {
            ctx.save(); ctx.fillStyle = this.color;
            this.frameCount++;
            if (this.frameCount >= 30) { this.frame = !this.frame; this.frameCount = 0; }
            ctx.fillRect(this.x, this.y, this.width, this.height); 
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 10, this.y + 10, 5, 5);
            ctx.fillRect(this.x + this.width - 15, this.y + 10, 5, 5);
            ctx.restore();
        }
        update() {
            this.x += this.speed * this.direction;
            if (Math.random() < 0.001) gameObjects.alienBullets.push(new Bullet(this.x + this.width/2, this.y + this.height, -4, 'alien'));
        }
    }

    class Particle {
        constructor(x, y, color, size, speed) {
            this.x = x; this.y = y; this.color = color; this.size = size; this.speed = speed;
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * speed; this.vy = Math.sin(this.angle) * speed;
            this.lifetime = 60;
        }
        draw() {
            ctx.save(); ctx.fillStyle = this.color; ctx.globalAlpha = this.lifetime/60;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }
        update() { this.x += this.vx; this.y += this.vy; this.lifetime--; return this.lifetime <= 0; }
    }

    // --- Helper Functions ---
    function createParticles(x, y, count, color, min, max) {
        for(let i=0; i<count; i++) {
            gameObjects.particles.push(new Particle(x, y, color, Math.random()*(max-min)+min, Math.random()*3+1));
        }
    }

    function updatePowerUpIndicator(type, active) {
        const container = document.getElementById('powerUpIndicator');
        if(!container) return;
        const id = `powerup-${type}`;
        const existing = document.getElementById(id);
        
        if (existing && !active) {
            existing.remove();
        } else if (!existing && active) {
            const div = document.createElement('div');
            div.className = 'power-up-item';
            div.id = id;
            div.innerHTML = `<div class="power-up-icon" style="background-color:gold"></div><span>${type}</span><div class="power-up-timer" style="width:100%"></div>`;
            container.appendChild(div);
        }
    }
    
    function updatePowerUpTimer(type, pct) {
        const timer = document.getElementById(`powerup-${type}`)?.querySelector('.power-up-timer');
        if(timer) timer.style.width = `${pct * 100}%`;
    }

    function createLevel() {
        gameObjects.aliens = [];
        const rows = Math.min(5, 3 + Math.floor(gameLevel.current / 3));
        const cols = Math.min(11, 8 + Math.floor(gameLevel.current / 2));
        const startX = (800 - (cols * 50)) / 2;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const alien = new Alien(startX + c * 50, 50 + r * 40, Math.min(5, rows - r));
                alien.speed = 1 + gameLevel.current * 0.2;
                gameObjects.aliens.push(alien);
            }
        }
    }

    function initGame() {
        gameObjects.player = new Player();
        gameObjects.aliens = [];
        gameObjects.bullets = [];
        gameObjects.alienBullets = [];
        gameObjects.particles = [];
        gameObjects.powerUps = [];
        
        lives.current = 3;
        gameScore.current = 0;
        gameLevel.current = 1;
        gameActive.current = true;
        gamePaused.current = false;
        
        createLevel();
        requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        if (!gameActive.current) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, 800, 600);

        if (gamePaused.current) {
            gameObjects.player.draw();
            gameObjects.aliens.forEach(a => a.draw());
            drawHUD();
            requestAnimationFrame(gameLoop);
            return;
        }

        gameObjects.player.update(deltaTime);
        
        let changeDir = false;
        gameObjects.aliens.forEach(a => {
            a.update();
            if ((a.x <= 0 && a.direction === -1) || (a.x + a.width >= 800 && a.direction === 1)) changeDir = true;
        });
        if (changeDir) gameObjects.aliens.forEach(a => { a.direction *= -1; a.y += 20; });

        // Bullet Logic
        gameObjects.bullets = gameObjects.bullets.filter(b => {
            if (b.update()) return false;
            let hit = false;
            for (let i = gameObjects.aliens.length - 1; i >= 0; i--) {
                const a = gameObjects.aliens[i];
                if (b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) {
                    gameScore.current += a.points;
                    createParticles(a.x+20, a.y+15, 10, a.color, 2, 4);
                    gameObjects.aliens.splice(i, 1);
                    hit = true;
                    if(Math.random() < 0.1) {
                         const types = ['rapidFire', 'doubleBullet', 'shield'];
                         const type = types[Math.floor(Math.random()*3)];
                         gameObjects.player.activatePowerUp(type);
                    }
                    break;
                }
            }
            return !hit;
        });

        gameObjects.alienBullets = gameObjects.alienBullets.filter(b => {
            if (b.update()) return false;
            if (b.x > gameObjects.player.x && b.x < gameObjects.player.x + gameObjects.player.width && 
                b.y > gameObjects.player.y && b.y < gameObjects.player.y + gameObjects.player.height) {
                if (gameObjects.player.hit()) {
                    setFinalScore(gameScore.current);
                    setGameState('gameover');
                    gameActive.current = false;
                }
                return false;
            }
            return true;
        });

        gameObjects.particles = gameObjects.particles.filter(p => !p.update());

        if (gameObjects.aliens.length === 0) {
            gameActive.current = false;
            const bonus = lives.current * 100;
            setLevelScore(gameScore.current);
            setBonusScore(bonus);
            gameScore.current += bonus;
            setGameState('levelcomplete');
        }

        if (gameObjects.aliens.some(a => a.y + a.height >= gameObjects.player.y)) {
             setFinalScore(gameScore.current);
             setGameState('gameover');
             gameActive.current = false;
        }

        gameObjects.aliens.forEach(a => a.draw());
        gameObjects.bullets.forEach(b => b.draw());
        gameObjects.alienBullets.forEach(b => b.draw());
        gameObjects.particles.forEach(p => p.draw());
        gameObjects.player.draw();
        
        drawHUD();

        if (gameActive.current) {
            animationId = requestAnimationFrame(gameLoop);
        }
    }

    function drawHUD() {
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${gameScore.current}`, 20, 30);
        ctx.fillText(`LEVEL: ${gameLevel.current}`, 300, 30);
        ctx.textAlign = 'right';
        ctx.fillText(`LIVES: ${lives.current}`, 780, 30);
    }

    window.gameControl = {
        start: () => {
            setGameState('loading');
            let p = 0;
            const int = setInterval(() => {
                p += 5;
                setLoadingProgress(p);
                if (p >= 100) {
                    clearInterval(int);
                    setGameState('playing');
                    initGame();
                }
            }, 50);
        },
        nextLevel: () => {
            gameLevel.current++;
            gameActive.current = true;
            setGameState('playing');
            createLevel();
            requestAnimationFrame(gameLoop);
        },
        restart: () => {
            setGameState('start');
        }
    };

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationId);
        delete window.gameControl;
    };
  }, []);

  const handleMobileInput = (type, active) => {
      const e = new KeyboardEvent(active ? 'keydown' : 'keyup', { 
          key: type === 'left' ? 'ArrowLeft' : type === 'right' ? 'ArrowRight' : ' ' 
      });
      if (type === 'fire') window.mobileFireActive = active;
      else window.dispatchEvent(e);
  };

  return (
    <div className="game-wrapper bg-black text-white relative w-full h-screen overflow-hidden font-mono flex flex-col justify-center items-center">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .game-font { font-family: 'Press Start 2P', cursive; }
        canvas { background-color: #000; box-shadow: 0 0 20px rgba(0,255,255,0.2); }
        .btn { padding: 15px 30px; margin: 10px; border: none; cursor: pointer; font-family: 'Press Start 2P'; font-size: 16px; border-radius: 5px; transition: 0.3s; color: white; }
        .btn-primary { background-color: #4CAF50; }
        .btn-primary:hover { transform: scale(1.05); background-color: #45a049; }
        .btn-secondary { background-color: #3498db; }
        .btn-secondary:hover { background-color: #2980b9; }
        .screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; background: rgba(0,0,0,0.85); }
        .power-up-item { margin: 5px; padding: 5px; background: rgba(0,0,0,0.7); display: flex; align-items: center; border-radius: 4px; font-size: 12px; }
        .power-up-icon { width: 15px; height: 15px; margin-right: 5px; border-radius: 50%; }
        .power-up-timer { height: 3px; background: #00ff00; margin-top: 2px; }
      `}</style>

      <canvas ref={canvasRef} width={800} height={600} className="block max-w-full" />

      {gameState === 'start' && <StartScreen onStart={() => window.gameControl.start()} onLeaderboard={() => setGameState('leaderboard')} />}
      
      {gameState === 'loading' && (
          <div className="screen game-font">
              <h2 className="text-3xl mb-6 text-white">LOADING...</h2>
              <div className="w-64 h-8 border-2 border-white rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-75" style={{width: `${loadingProgress}%`}}></div>
              </div>
          </div>
      )}

      {gameState === 'gameover' && (
          <GameOverScreen score={finalScore} onRestart={() => window.gameControl.restart()} onMenu={() => setGameState('start')} />
      )}

      {gameState === 'levelcomplete' && (
          <LevelCompleteScreen score={levelScore} bonus={bonusScore} onNext={() => window.gameControl.nextLevel()} />
      )}

      {gameState === 'leaderboard' && (
          <div className="screen game-font">
              <h2 className="text-yellow-400 text-3xl mb-6">LEADERBOARD</h2>
              <div className="bg-gray-900 border-2 border-blue-500 p-6 rounded-lg w-full max-w-md">
                  {highScores.length === 0 ? <p className="text-center">No scores yet</p> : 
                    highScores.map((s, i) => (
                        <div key={i} className="flex justify-between border-b border-blue-900 py-2">
                            <span>{i+1}. {s.name || 'Player'}</span><span>{s.score}</span>
                        </div>
                    ))
                  }
              </div>
              <button className="btn btn-secondary mt-6" onClick={() => setGameState('start')}>BACK</button>
          </div>
      )}

      <GameUIOverlays paused={gameState === 'playing' && gamePaused.current} />
      
      <div className="md:hidden absolute bottom-4 w-full px-4 z-20">
        <MobileControls onInput={handleMobileInput} />
      </div>
    </div>
  );
};

export default Project;