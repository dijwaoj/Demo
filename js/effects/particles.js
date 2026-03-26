// ===== Canvas粒子特效系统 =====

class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = 0;
        this.friction = 0.99;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.running = false;
    }

    add(particle) {
        this.particles.push(particle);
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.update();
            p.draw(this.ctx);
        });
        this.ctx.globalAlpha = 1;
    }

    run(duration, callback) {
        this.running = true;
        const start = Date.now();
        const loop = () => {
            this.update();
            if (Date.now() - start < duration && this.running) {
                requestAnimationFrame(loop);
            } else {
                this.running = false;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (callback) callback();
            }
        };
        loop();
    }

    stop() {
        this.running = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// ===== 预设特效 =====
const EFFECTS = {
    // 愚者途径：空间撕裂 - 蓝紫色漩涡
    spatial_rift: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const p = new Particle(
                cx, cy,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                `hsl(${260 + Math.random() * 40}, 80%, ${50 + Math.random() * 30}%)`,
                Math.random() * 6 + 2,
                60
            );
            ps.add(p);
        }
        ps.run(2000);
    },

    // 太阳途径：天使降临 - 金色光柱
    holy_descent: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        for (let i = 0; i < 150; i++) {
            const x = cx + (Math.random() - 0.5) * 100;
            const p = new Particle(
                x, 0,
                (Math.random() - 0.5) * 2,
                Math.random() * 8 + 4,
                `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
                Math.random() * 5 + 2,
                40
            );
            p.gravity = 0.1;
            ps.add(p);
        }
        ps.run(2000);
    },

    // 黑暗途径：暗影吞噬 - 黑色漩涡
    dark_devour: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 120; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 150 + 50;
            const p = new Particle(
                cx + Math.cos(angle) * dist,
                cy + Math.sin(angle) * dist,
                -Math.cos(angle) * 3,
                -Math.sin(angle) * 3,
                `hsl(260, ${50 + Math.random() * 50}%, ${20 + Math.random() * 30}%)`,
                Math.random() * 8 + 3,
                50
            );
            ps.add(p);
        }
        ps.run(2000);
    },

    // 红祭司途径：烈焰风暴 - 红色火焰
    flame_storm: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height;
        for (let i = 0; i < 200; i++) {
            const p = new Particle(
                cx + (Math.random() - 0.5) * 200,
                cy,
                (Math.random() - 0.5) * 4,
                -Math.random() * 10 - 5,
                `hsl(${Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
                Math.random() * 8 + 3,
                50
            );
            p.gravity = 0.2;
            ps.add(p);
        }
        ps.run(2000);
    },

    // 暴君途径：风暴雷电 - 蓝色闪电
    storm_fury: (canvas) => {
        const ps = new ParticleSystem(canvas);
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * canvas.width;
            const p = new Particle(
                x, 0,
                (Math.random() - 0.5) * 3,
                Math.random() * 15 + 10,
                `hsl(${200 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
                Math.random() * 4 + 1,
                30
            );
            ps.add(p);
        }
        ps.run(1500);
    },

    // 母亲途径：生命绽放 - 绿色光点
    life_bloom: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const p = new Particle(
                cx, cy,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                `hsl(${100 + Math.random() * 40}, 80%, ${50 + Math.random() * 30}%)`,
                Math.random() * 6 + 2,
                60
            );
            p.friction = 0.98;
            ps.add(p);
        }
        ps.run(2000);
    },

    // 月亮途径：血月 - 红色满月
    blood_moon: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height / 3;
        // 月亮光环
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 20;
            const p = new Particle(
                cx + Math.cos(angle) * dist,
                cy + Math.sin(angle) * dist,
                Math.cos(angle) * 0.5,
                Math.sin(angle) * 0.5,
                `hsl(${340 + Math.random() * 20}, 80%, ${50 + Math.random() * 30}%)`,
                Math.random() * 4 + 2,
                80
            );
            ps.add(p);
        }
        ps.run(2500);
    },

    // 死神途径：灵魂收割 - 灰白灵魂
    death_reaper: (canvas) => {
        const ps = new ParticleSystem(canvas);
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * canvas.width;
            const y = canvas.height;
            const p = new Particle(
                x, y,
                (Math.random() - 0.5) * 3,
                -Math.random() * 6 - 3,
                `hsl(0, 0%, ${60 + Math.random() * 30}%)`,
                Math.random() * 8 + 3,
                60
            );
            ps.add(p);
        }
        ps.run(2000);
    },

    // 默认特效
    default: (canvas) => {
        const ps = new ParticleSystem(canvas);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            const p = new Particle(
                cx, cy,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                `hsl(${Math.random() * 360}, 70%, 60%)`,
                Math.random() * 5 + 2,
                50
            );
            ps.add(p);
        }
        ps.run(2000);
    }
};

// 播放特效
function playEffect(effectName, canvas) {
    const effect = EFFECTS[effectName] || EFFECTS.default;
    effect(canvas);
}
