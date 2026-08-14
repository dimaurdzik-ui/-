document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;

    function makeParticle() {
        return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, size: Math.random() * 2.2 + .7, speed: Math.random() * .22 + .08, drift: Math.random() * .25 - .125, alpha: Math.random() * .45 + .14, pulse: Math.random() * Math.PI * 2 };
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        particles = Array.from({ length: innerWidth < 600 ? 18 : 30 }, makeParticle);
    }

    function drawParticles() {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        particles.forEach(p => {
            p.y -= p.speed; p.x += p.drift; p.pulse += .018;
            if (p.y < -8) { p.y = innerHeight + 8; p.x = Math.random() * innerWidth; }
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 226, 231, ${p.alpha * (.72 + Math.sin(p.pulse) * .28)})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
        animationFrame = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    addEventListener('resize', resizeCanvas, { passive: true });
    if (!reducedMotion) drawParticles();

    const envelopeScene = document.getElementById('envelope-scene');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelope = document.getElementById('envelope');
    const mainContent = document.getElementById('main-content');
    let envelopeOpened = false;

    function openEnvelope() {
        if (envelopeOpened) return;
        envelopeOpened = true;
        envelopeScene.classList.add('opening');
        envelope.classList.add('opened');
        envelopeWrapper.classList.add('opened');
        envelopeWrapper.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
            envelopeScene.classList.add('gone');
            mainContent.classList.add('visible');
            mainContent.setAttribute('aria-hidden', 'false');
            document.getElementById('btn-yes').focus({ preventScroll: true });
        }, reducedMotion ? 80 : 1650);
    }
    envelopeWrapper.addEventListener('click', openEnvelope);

    const screens = {
        s1: document.getElementById('screen-1'), s2: document.getElementById('screen-2'), s3: document.getElementById('screen-3'), s4: document.getElementById('screen-4'), sTime: document.getElementById('screen-time'), sFinal: document.getElementById('screen-final')
    };
    const progressDots = [...document.querySelectorAll('.progress-dot')];
    const form = document.getElementById('date-form');
    const datePicker = document.getElementById('date-picker');
    const timePicker = document.getElementById('time-picker');
    const wishesInput = document.getElementById('wishes-input');
    const inputDate = document.getElementById('input-date');
    const inputType = document.getElementById('input-type');
    const screen4Title = document.getElementById('screen-4-title');
    const screen4Desc = document.getElementById('screen-4-desc');
    const btnNext4 = document.getElementById('btn-next-4');
    const btnSubmit4 = document.getElementById('btn-submit-4');
    let needsTime = false;

    const today = new Date();
    datePicker.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    function updateProgress(step) {
        progressDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === Math.min(step - 1, 3));
            dot.classList.toggle('done', index < step - 1);
        });
    }

    function goTo(from, to) {
        if (from === to) return;
        from.classList.add('leaving');
        from.classList.remove('active');
        setTimeout(() => {
            from.classList.add('hidden'); from.classList.remove('leaving');
            to.classList.remove('hidden'); void to.offsetWidth; to.classList.add('active');
            updateProgress(Number(to.dataset.step || 4));
            document.querySelector('.card-shell').scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        }, reducedMotion ? 10 : 280);
    }

    function markInvalid(input) {
        input.classList.remove('invalid'); void input.offsetWidth; input.classList.add('invalid'); input.focus();
        setTimeout(() => input.classList.remove('invalid'), 500);
    }

    const noLines = ['Ой, ця кнопка соромиться 🙈', 'Здається, вона передумала', 'Спробуй краще рожеву ♥', 'Ну майже… але ні 😌'];
    let noAttempts = 0;
    const btnNo = document.getElementById('btn-no');
    const noCaption = document.getElementById('no-caption');

    function moveNo(event) {
        if (event) event.preventDefault();
        const card = document.querySelector('.card-shell').getBoundingClientRect();
        const rect = btnNo.getBoundingClientRect();
        const padding = 16;
        const x = Math.random() * Math.max(1, card.width - rect.width - padding * 2) + card.left + padding;
        const y = Math.random() * Math.max(1, card.height - rect.height - padding * 2) + card.top + padding;
        btnNo.style.position = 'fixed'; btnNo.style.left = `${Math.min(x, innerWidth - rect.width - 8)}px`; btnNo.style.top = `${Math.min(y, innerHeight - rect.height - 8)}px`; btnNo.style.zIndex = '30';
        noCaption.textContent = noLines[noAttempts % noLines.length]; noAttempts += 1;
    }
    btnNo.addEventListener('pointerenter', moveNo);
    btnNo.addEventListener('pointerdown', moveNo);
    btnNo.addEventListener('click', moveNo);

    document.getElementById('btn-yes').addEventListener('click', () => {
        btnNo.style.display = 'none'; burstConfetti(48); goTo(screens.s1, screens.s2);
    });

    document.getElementById('btn-next-2').addEventListener('click', () => {
        if (!datePicker.value) return markInvalid(datePicker);
        inputDate.value = datePicker.value; goTo(screens.s2, screens.s3);
    });

    const configs = {
        'Поїсти': ['Смачно поїсти', 'Що тобі найбільше смакуватиме цього вечора?', 'Наприклад: суші, паста або той затишний ресторан…', true],
        'Поїздка': ['Наша мініподорож', 'Куди б ти хотіла втекти зі мною хоча б на день?', 'Наприклад: за місто, до озера або в нове красиве місце…', false],
        'Розваги': ['Трохи пригод', 'Які емоції обираємо для нашого побачення?', 'Наприклад: кіно, боулінг, квест або парк атракціонів…', true],
        'Відпочинок': ['Затишний вечір', 'Як виглядає твій ідеальний спокійний вечір удвох?', 'Наприклад: фільм, прогулянка, спа або вечеря вдома…', false]
    };

    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.option-card').forEach(item => item.classList.remove('selected'));
            card.classList.add('selected');
            const type = card.dataset.type;
            const [title, description, placeholder, withTime] = configs[type];
            inputType.value = type;
            screen4Title.innerHTML = `${title}<br><em>разом</em>`;
            screen4Desc.textContent = description;
            wishesInput.placeholder = placeholder;
            needsTime = withTime;
            timePicker.required = withTime;
            btnNext4.classList.toggle('hidden', !withTime);
            btnSubmit4.classList.toggle('hidden', withTime);
            setTimeout(() => goTo(screens.s3, screens.s4), reducedMotion ? 10 : 220);
        });
    });

    wishesInput.maxLength = 180;
    wishesInput.addEventListener('input', () => { document.getElementById('char-count').textContent = wishesInput.value.length; });
    btnNext4.addEventListener('click', () => {
        if (!wishesInput.value.trim()) return markInvalid(wishesInput);
        goTo(screens.s4, screens.sTime);
    });

    function formatDate(value) {
        if (!value) return '';
        return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`));
    }

    async function submitForm(event) {
        event.preventDefault();
        if (!wishesInput.value.trim()) return markInvalid(wishesInput);
        if (needsTime && !timePicker.value) return markInvalid(timePicker);
        const activeButton = needsTime ? document.getElementById('btn-submit-time') : btnSubmit4;
        const buttonSpan = activeButton.querySelector('span');
        buttonSpan.textContent = 'Готуємо сюрприз…'; activeButton.disabled = true;
        const accessKey = form.querySelector('[name="access_key"]').value;
        if (accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE') {
            try {
                const formData = new FormData(form);
                const object = Object.fromEntries(formData);
                const json = JSON.stringify(object);

                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });
                if (!response.ok) throw new Error('Не вдалося надіслати форму');
            } catch (error) { console.warn('Форма не надіслана, але відповідь збережена у сценарії.', error); }
        }
        const typeLabels = { 'Поїсти': 'смачна вечеря', 'Поїздка': 'мініподорож', 'Розваги': 'трохи пригод', 'Відпочинок': 'затишний вечір' };
        const timeText = timePicker.value ? ` о ${timePicker.value}` : '';
        document.getElementById('final-summary').textContent = `${formatDate(datePicker.value)}${timeText} · ${typeLabels[inputType.value] || inputType.value}`;
        setTimeout(() => { goTo(needsTime ? screens.sTime : screens.s4, screens.sFinal); burstConfetti(90); }, reducedMotion ? 20 : 450);
    }
    form.addEventListener('submit', submitForm);

    function burstConfetti(count) {
        if (reducedMotion) return;
        const layer = document.getElementById('confetti-layer');
        const colors = ['#e4526e', '#f1bd73', '#fff1ec', '#b976a8', '#ef8fa0'];
        for (let i = 0; i < count; i += 1) {
            const piece = document.createElement('i'); piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`; piece.style.background = colors[i % colors.length];
            piece.style.setProperty('--duration', `${2.4 + Math.random() * 2.2}s`); piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`); piece.style.setProperty('--rotate', `${Math.random() * 900 - 450}deg`); piece.style.animationDelay = `${Math.random() * .45}s`;
            layer.appendChild(piece); setTimeout(() => piece.remove(), 5200);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrame) cancelAnimationFrame(animationFrame);
        else if (!document.hidden && !reducedMotion) drawParticles();
    });
});
