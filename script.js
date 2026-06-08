document.addEventListener('DOMContentLoaded', () => {
    // --- STEP 1 & AUDIO TRANSITION ---
    const welcomeStep = document.getElementById('welcome-step');
    const mainStep = document.getElementById('main-step');
    const openBtn = document.getElementById('open-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // Canvas background
    const bgCanvas = document.getElementById('stars-hearts-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    let bgWidth = (bgCanvas.width = window.innerWidth);
    let bgHeight = (bgCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        bgWidth = (bgCanvas.width = window.innerWidth);
        bgHeight = (bgCanvas.height = window.innerHeight);
    });

    // Particle Background Classes (Stars and floating hearts)
    class Star {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * bgWidth;
            this.y = Math.random() * bgHeight;
            this.size = Math.random() * 1.5;
            this.opacity = Math.random();
            this.speed = 0.01 + Math.random() * 0.02;
            this.factor = Math.random() > 0.5 ? 1 : -1;
        }
        update() {
            this.opacity += this.speed * this.factor;
            if (this.opacity > 1 || this.opacity < 0) this.factor *= -1;
        }
        draw() {
            bgCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            bgCtx.fill();
        }
    }

    class HeartParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * bgHeight;
        }
        reset() {
            this.x = Math.random() * bgWidth;
            this.y = bgHeight + 20;
            this.size = 6 + Math.random() * 14;
            this.speedY = 0.5 + Math.random() * 1.2;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
            this.opacity = 0.1 + Math.random() * 0.4;
            this.wobble = Math.random() * 100;
            this.wobbleSpeed = 0.01 + Math.random() * 0.02;
        }
        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.wobble) * 0.5 + this.speedX;
            this.wobble += this.wobbleSpeed;
            if (this.y < -20 || this.opacity <= 0) this.reset();
        }
        draw() {
            bgCtx.save();
            bgCtx.translate(this.x, this.y);
            bgCtx.fillStyle = `rgba(255, 77, 109, ${this.opacity})`;
            bgCtx.beginPath();
            const size = this.size;
            bgCtx.moveTo(0, 0);
            bgCtx.bezierCurveTo(-size / 2, -size / 2, -size, -size / 6, 0, size);
            bgCtx.bezierCurveTo(size, -size / 6, size / 2, -size / 2, 0, 0);
            bgCtx.fill();
            bgCtx.restore();
        }
    }

    const stars = Array.from({ length: 80 }, () => new Star());
    const hearts = Array.from({ length: 20 }, () => new HeartParticle());

    function animateBg() {
        bgCtx.clearRect(0, 0, bgWidth, bgHeight);
        stars.forEach(s => { s.update(); s.draw(); });
        hearts.forEach(h => { h.update(); h.draw(); });
        requestAnimationFrame(animateBg);
    }
    animateBg();

    // Welcome Screen Transition
    openBtn.addEventListener('click', () => {
        bgMusic.volume = 0.35;
        bgMusic.play().then(() => {
            musicToggle.classList.remove('hidden');
        }).catch(() => {
            musicToggle.classList.remove('hidden');
            musicToggle.classList.add('muted');
        });

        welcomeStep.classList.add('fade-out');
        setTimeout(() => {
            welcomeStep.classList.add('hidden');
            mainStep.classList.remove('hidden');
            triggerConfettiShower();
        }, 600);
    });

    // Music Controls
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.remove('muted');
            musicToggle.textContent = '🎵';
        } else {
            bgMusic.pause();
            musicToggle.classList.add('muted');
            musicToggle.textContent = '🔇';
        }
    });

    // --- COUPONS MANAGEMENT (Simplified, No Codes) ---
    const couponCards = document.querySelectorAll('.coupon-card');
    const redeemModal = document.getElementById('redeem-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.querySelector('.modal-close');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    couponCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('redeem-btn')) return;
            if (window.innerWidth <= 576) {
                couponCards.forEach(c => { if (c !== card) c.classList.remove('flipped'); });
                card.classList.toggle('flipped');
            }
        });

        const redeemBtn = card.querySelector('.redeem-btn');
        redeemBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = card.getAttribute('data-name');
            showRedeemModal(name);
        });
    });

    function showRedeemModal(name) {
        modalMessage.innerHTML = `You have successfully claimed:<br><strong style="color: #ff4d6d; font-size: 1.3rem; display: block; margin-top: 10px;">${name}!</strong><br>Keep this coupon, I'm ready to treat you! 🥰`;
        redeemModal.classList.add('active');
        
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#ff4d6d', '#7209b7', '#ffd166', '#ffffff']
        });
    }

    function closeModal() {
        redeemModal.classList.remove('active');
    }

    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === redeemModal) closeModal();
    });

    // --- CHROME DINO-STYLE HEART RUNNER GAME ---
    const gameCanvas = document.getElementById('game-canvas');
    const gctx = gameCanvas.getContext('2d');
    
    // Fixed inner resolution for game coordinates, CSS handles scaling
    gameCanvas.width = 480;
    gameCanvas.height = 150;

    const gameOverlay = document.getElementById('game-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const startGameBtn = document.getElementById('start-game-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');
    const gameScoreVal = document.getElementById('game-score-val');

    let gameState = 'idle'; // idle, playing, gameover
    let score = 0;
    let obstacleTimer = 0;
    let collectibleTimer = 0;
    let gameSpeed = 2;
    let animId = null;

    let obstacles = [];
    let collectibles = [];
    const groundY = 120;

    const player = {
        x: 40,
        y: groundY - 20,
        width: 18,
        height: 18,
        vy: 0,
        gravity: 0.4,
        jumpForce: -9.5,
        isJumping: false,
        
        jump() {
            if (!this.isJumping) {
                this.vy = this.jumpForce;
                this.isJumping = true;
            }
        },
        update() {
            this.vy += this.gravity;
            this.y += this.vy;
            if (this.y > groundY - this.height) {
                this.y = groundY - this.height;
                this.vy = 0;
                this.isJumping = false;
            }
        },
        draw() {
            gctx.font = '18px serif';
            gctx.textAlign = 'left';
            gctx.textBaseline = 'top';
            // Align emoji to bounding box
            gctx.fillText('💖', this.x - 2, this.y - 2);
        }
    };

    class Obstacle {
        constructor() {
            this.x = gameCanvas.width;
            this.y = groundY - 18;
            this.width = 18;
            this.height = 18;
        }
        update() {
            this.x -= gameSpeed;
        }
        draw() {
            gctx.font = '18px serif';
            gctx.textAlign = 'left';
            gctx.textBaseline = 'top';
            gctx.fillText('☁️', this.x - 2, this.y - 2);
        }
    }

    class Collectible {
        constructor() {
            this.x = gameCanvas.width;
            // Float at different heights
            this.y = groundY - 50 - Math.random() * 40;
            this.width = 14;
            this.height = 14;
            this.collected = false;
        }
        update() {
            this.x -= gameSpeed;
        }
        draw() {
            gctx.font = '14px serif';
            gctx.textAlign = 'left';
            gctx.textBaseline = 'top';
            gctx.fillText('❤️', this.x, this.y);
        }
    }

    function startGame() {
        score = 0;
        obstacles = [];
        collectibles = [];
        gameSpeed = 1.8;
        obstacleTimer = 0;
        collectibleTimer = 0;
        player.y = groundY - player.height;
        player.vy = 0;
        player.isJumping = false;
        gameState = 'playing';

        gameOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');

        if (animId) cancelAnimationFrame(animId);
        gameLoop();
    }

    function triggerGameOver() {
        gameState = 'gameover';
        gameScoreVal.textContent = score;
        gameOverOverlay.classList.remove('hidden');
    }

    // AABB Collision detection with slight padding for emojis
    function rectCollision(r1, r2) {
        const padding = 3;
        return (
            r1.x + padding < r2.x + r2.width - padding &&
            r1.x + r1.width - padding > r2.x + padding &&
            r1.y + padding < r2.y + r2.height - padding &&
            r1.y + r1.height - padding > r2.y + padding
        );
    }

    function handleJumpInput() {
        if (gameState === 'playing') {
            player.jump();
        }
    }

    // Global Key Events
    window.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') {
            // Prevent page scrolling on spacebar press
            if (gameState === 'playing') e.preventDefault();
            handleJumpInput();
        }
    });

    // Mouse and Touch clicks on game canvas
    gameCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleJumpInput();
    });
    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleJumpInput();
    });

    startGameBtn.addEventListener('click', startGame);
    restartGameBtn.addEventListener('click', startGame);

    function gameLoop() {
        if (gameState !== 'playing') return;

        // Clear sub-canvas
        gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw Ground Line
        gctx.strokeStyle = 'rgba(255, 77, 109, 0.4)';
        gctx.lineWidth = 2;
        gctx.beginPath();
        gctx.moveTo(0, groundY);
        gctx.lineTo(gameCanvas.width, groundY);
        gctx.stroke();

        // Update & Draw Player
        player.update();
        player.draw();

        // Increment Speed very slowly over time
        gameSpeed += 0.00025;

        // Spawn Obstacles (clouds)
        obstacleTimer++;
        const obstacleSpawnRate = 90 + Math.random() * 60 - (gameSpeed * 5);
        if (obstacleTimer > Math.max(50, obstacleSpawnRate)) {
            obstacles.push(new Obstacle());
            obstacleTimer = 0;
        }

        // Spawn Collectibles (hearts)
        collectibleTimer++;
        if (collectibleTimer > 70 + Math.random() * 50) {
            collectibles.push(new Collectible());
            collectibleTimer = 0;
        }

        // Manage Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.update();
            obs.draw();

            // Check Collision
            if (rectCollision(player, obs)) {
                triggerGameOver();
                return;
            }

            // Remove offscreen obstacles
            if (obs.x < -20) {
                obstacles.splice(i, 1);
            }
        }

        // Manage Collectibles
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const col = collectibles[i];
            col.update();
            col.draw();

            // Collect check
            if (rectCollision(player, col)) {
                col.collected = true;
                score++;
                collectibles.splice(i, 1);
                
                // Micro-confetti pop for collection feedback
                confetti({
                    particleCount: 6,
                    spread: 15,
                    origin: { y: 0.5 }
                });
                continue;
            }

            // Remove offscreen collectibles
            if (col.x < -20) {
                collectibles.splice(i, 1);
            }
        }

        // Draw Scoreboard
        gctx.fillStyle = '#ff4d6d';
        gctx.font = 'bold 12px Outfit, sans-serif';
        gctx.textAlign = 'right';
        gctx.textBaseline = 'top';
        gctx.fillText(`Hearts: ${score}`, gameCanvas.width - 15, 12);

        animId = requestAnimationFrame(gameLoop);
    }

    // --- Helper Confetti Showers ---
    function triggerConfettiShower() {
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000 };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 40 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
});
