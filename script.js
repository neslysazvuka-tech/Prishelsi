// Состояние игры
const gameState = {
    health: 100,
    time: 0,
    inventory: [],
    currentScene: 'start',
    visitedScenes: new Set(),
    gameOver: false,
    endings: new Set(),
    flags: {
        metAlien: false,
        hasWeapon: false,
        knowsPassword: false,
        shipRepaired: false,
        allianceFormed: false
    }
};

// Все сцены игры
const scenes = {
    start: {
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Вы просыпаетесь от громкого грохота. Вокруг темно, только мигает аварийное освещение. 
               Компьютерная система корабля сообщает: <span class="warning-text">"Обнаружено неизвестное 
               вмешательство. Целостность корпуса нарушена."</span></p>
               <p>Вы - инженер космического грузового судна "Арго". Похоже, что-то пошло не так во время 
               вашего гиперпрыжка. Нужно выяснить, что произошло.</p>`,
        choices: [
            { text: 'Осмотреть контрольные приборы', nextScene: 'checkControls' },
            { text: 'Проверить систему жизнеобеспечения', nextScene: 'lifeSupport' },
            { text: 'Выйти в коридор', nextScene: 'corridor' }
        ]
    },
    
    checkControls: {
        image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a7b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Вы подходите к панели управления. Экран покрыт статикой, но некоторые показатели все же видны. 
               <span class="warning-text">Уровень кислорода: 78%. Температура: -12°C. Внешние датчики: повреждены.</span></p>
               <p>Главный компьютер пытается восстановить связь с другими системами корабля. Похоже, 
               гипердвигатель вышел из строя, и вы оказались в неизвестном секторе космоса.</p>`,
        choices: [
            { text: 'Попытаться восстановить связь', nextScene: 'restoreComms', requirement: () => !gameState.flags.shipRepaired },
            { text: 'Проверить навигационные данные', nextScene: 'navData' },
            { text: 'Вернуться в каюту', nextScene: 'start' }
        ]
    },
    
    lifeSupport: {
        image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Система жизнеобеспечения работает на аварийных генераторах. Запасов кислорода хватит примерно 
               на 48 часов. Температура продолжает падать.</p>
               <p>В углу вы замечаете <span class="important-item">аварийный комплект</span>, который включает 
               в себя фонарь, аптечку и компактный инструментарий.</p>`,
        choices: [
            { text: 'Взять аварийный комплект', nextScene: 'takeKit', requirement: () => !gameState.inventory.includes('Аварийный комплект') },
            { text: 'Попытаться починить обогреватели', nextScene: 'fixHeaters' },
            { text: 'Вернуться в каюту', nextScene: 'start' }
        ]
    },
    
    takeKit: {
        image: 'https://images.unsplash.com/photo-1581093057306-9127bc3a9c87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Вы берете аварийный комплект. Теперь у вас есть:</p>
               <ul>
                 <li>Мощный фонарь</li>
                 <li>Аптечка (+20% к здоровью)</li>
                 <li>Мультитул</li>
               </ul>
               <p>Это может пригодиться в дальнейшем.</p>`,
        onEnter: () => {
            gameState.inventory.push('Аварийный комплект');
            gameState.health = Math.min(gameState.health + 20, 100);
            updateStats();
        },
        choices: [
            { text: 'Вернуться к системе жизнеобеспечения', nextScene: 'lifeSupport' },
            { text: 'Пойти в коридор', nextScene: 'corridor' }
        ]
    },
    
    corridor: {
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Коридор освещен только аварийными лампами. В воздухе пахнет гарью и чем-то... металлическим. 
               Вдалеке слышны странные звуки, похожие на скрежет.</p>
               <p>Вы можете пойти на мостик, в грузовой отсек или в инженерный отсек.</p>`,
        choices: [
            { text: 'Направиться на мостик', nextScene: 'bridge' },
            { text: 'Пойти в грузовой отсек', nextScene: 'cargoBay' },
            { text: 'Проверить инженерный отсек', nextScene: 'engineering' },
            { text: 'Вернуться в каюту', nextScene: 'start' }
        ]
    },
    
    bridge: {
        image: 'https://images.unsplash.com/photo-1581093057927-02a2cdf9627a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Мостик выглядит опустошенным. Все экраны мертвы, только один мигает с сообщением: 
               <span class="warning-text">"Обнаружено неизвестное судно. Приближается."</span></p>
               <p>Капитан и другие офицеры отсутствуют. На полу видны следы борьбы и... что-то похожее 
               на слизь.</p>`,
        choices: [
            { text: 'Попытаться включить системы мостика', nextScene: 'activateBridge', requirement: () => !gameState.flags.shipRepaired },
            { text: 'Осмотреть капитанское кресло', nextScene: 'captainChair' },
            { text: 'Вернуться в коридор', nextScene: 'corridor' }
        ]
    },
    
    captainChair: {
        image: 'https://images.unsplash.com/photo-1581093058242-dccd5f6e8b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Под креслом вы находите <span class="important-item">личный пистолет капитана</span>. 
               Похоже, он выпал во время борьбы. Также вы замечаете клочок бумаги с какими-то символами.</p>`,
        choices: [
            { text: 'Взять пистолет', nextScene: 'takeGun', requirement: () => !gameState.flags.hasWeapon },
            { text: 'Изучить символы', nextScene: 'studySymbols', requirement: () => !gameState.flags.knowsPassword },
            { text: 'Вернуться к системам мостика', nextScene: 'bridge' }
        ]
    },
    
    takeGun: {
        text: `<p>Вы берете пистолет капитана. Это компактный лазерный бластер модели "Феникс-7". 
               Заряд на 85%. Теперь вы можете защитить себя, если что-то пойдет не так.</p>`,
        onEnter: () => {
            gameState.inventory.push('Пистолет капитана');
            gameState.flags.hasWeapon = true;
            updateStats();
        },
        choices: [
            { text: 'Изучить символы', nextScene: 'studySymbols', requirement: () => !gameState.flags.knowsPassword },
            { text: 'Вернуться к системам мостика', nextScene: 'bridge' }
        ]
    },
    
    studySymbols: {
        text: `<p>Символы выглядят как чужеродная письменность, но некоторые из них напоминают цифры. 
               Вы замечает паттерн: <span class="important-item">7-3-9-5</span>. Возможно, это код?</p>`,
        onEnter: () => {
            gameState.flags.knowsPassword = true;
        },
        choices: [
            { text: 'Попытаться ввести код в систему мостика', nextScene: 'enterCode' },
            { text: 'Вернуться к системам мостика', nextScene: 'bridge' }
        ]
    },
    
    enterCode: {
        text: `<p>Вы вводите последовательность 7-3-9-5 в главный терминал. Система отвечает: 
               <span class="warning-text">"Доступ разрешен. Активация аварийного протокола."</span></p>
               <p>Часть систем оживает. Теперь вы можете попытаться отправить сигнал SOS или проверить 
               внешние камеры.</p>`,
        onEnter: () => {
            gameState.flags.shipRepaired = true;
        },
        choices: [
            { text: 'Отправить сигнал SOS', nextScene: 'sendSOS' },
            { text: 'Проверить внешние камеры', nextScene: 'checkCameras' },
            { text: 'Вернуться к основным системам', nextScene: 'bridge' }
        ]
    },
    
    checkCameras: {
        image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Внешние камеры показывают огромный корабль пришельцев, пристыкованный к вашему судну. 
               Его форма напоминает гигантского ската, покрытого шипами.</p>
               <p>Вы также видите несколько существ, передвигающихся по вашему кораблю. Они высокие, 
               с серой кожей и большими черными глазами.</p>`,
        choices: [
            { text: 'Попытаться скрытно наблюдать за пришельцами', nextScene: 'observeAliens' },
            { text: 'Активировать защитные системы', nextScene: 'activateDefenses' },
            { text: 'Вернуться к системам мостика', nextScene: 'bridge' }
        ]
    },
    
    observeAliens: {
        text: `<p>Вы наблюдаете, как пришельцы перемещаются по кораблю. Они кажутся организованными 
               и целенаправленными. Один из них использует устройство, которое испускает странный 
               голубой луч, сканируя окружающее пространство.</p>
               <p>Внезапно один из пришельцев поворачивается и смотрит прямо в камеру. Он что-то 
               говорит своим собратьям, и группа начинает двигаться в сторону мостика.</p>`,
        choices: [
            { text: 'Подготовиться к обороне', nextScene: 'prepareDefense' },
            { text: 'Попытаться спрятаться', nextScene: 'hideOnBridge' },
            { text: 'Попробовать установить контакт', nextScene: 'attemptContact' }
        ]
    },
    
    prepareDefense: {
        text: `<p>Вы блокируете двери мостика и готовите пистолет. Через несколько минут пришельцы 
               пытаются взломать дверь. Их инструменты легко справляются с замками.</p>
               <p>Когда первое существо входит, вы стреляете. Оно падает, но за ним еще трое. 
               Они реагируют мгновенно...</p>`,
        choices: [
            { text: 'Продолжать стрелять', nextScene: 'keepFighting' },
            { text: 'Попытаться договориться', nextScene: 'negotiateUnderFire' }
        ]
    },
    
    keepFighting: {
        text: `<p>Вы раните еще одного пришельца, но их оружие намного мощнее. Луч энергии 
               пронзает ваше плечо. <span class="warning-text">Здоровье: 45%</span></p>
               <p>Один из существ поднимает руку, и вы чувствуете, как ваше сознание 
               начинает мутнеть. Последнее, что вы видите - огромные черные глаза, 
               склонившиеся над вами...</p>`,
        onEnter: () => {
            gameState.health = 45;
            updateStats();
        },
        choices: [
            { text: '...', nextScene: 'captureEnding' }
        ]
    },
    
    captureEnding: {
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        text: `<p>Вы приходите в себя в странной камере с прозрачными стенами. Вокруг - десятки 
               таких же камер с людьми. Пришельцы изучают вас, как образцы.</p>
               <p>Ваше сопротивление было героическим, но безнадежным. Человечество узнает 
               о вашей судьбе слишком поздно.</p>
               <p class="warning-text">КОНЕЦ: ПЛЕННИК ЗВЕЗД</p>`,
        onEnter: () => {
            gameState.endings.add('Пленник звезд');
            endGame();
        },
        choices: [
            { text: 'Начать заново', nextScene: 'restart' }
        ]
    },
    
    // ... (много других сцен и концовок)
    
    restart: {
        onEnter: () => {
            resetGame();
            loadScene('start');
        }
    }
};

// Инициализация игры
function initGame() {
    document.getElementById('restart-btn').addEventListener('click', () => {
        resetGame();
        loadScene('start');
    });
    
    // Запуск таймера
    setInterval(() => {
        gameState.time++;
        updateStats();
    }, 1000);
    
    loadScene('start');
    playBackgroundMusic();
}

// Загрузка сцены
function loadScene(sceneId) {
    if (!scenes[sceneId]) {
        console.error(`Сцена ${sceneId} не найдена!`);
        return;
    }
    
    gameState.currentScene = sceneId;
    gameState.visitedScenes.add(sceneId);
    
    const scene = scenes[sceneId];
    const sceneTextElement = document.getElementById('scene-text');
    const sceneImageElement = document.getElementById('scene-image');
    const choicesElement = document.getElementById('choices');
    
    // Установка текста сцены
    sceneTextElement.innerHTML = scene.text || '';
    
    // Установка изображения сцены
    if (scene.image) {
        sceneImageElement.style.backgroundImage = `url('${scene.image}')`;
        sceneImageElement.classList.remove('hidden');
    } else {
        sceneImageElement.classList.add('hidden');
    }
    
    // Очистка предыдущих выборов
    choicesElement.innerHTML = '';
    
    // Добавление новых выборов
    if (scene.choices && scene.choices.length > 0) {
        scene.choices.forEach(choice => {
            if (choice.requirement && !choice.requirement()) return;
            
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', () => {
                playSoundEffect();
                loadScene(choice.nextScene);
            });
            choicesElement.appendChild(button);
        });
    }
    
    // Вызов функции при входе в сцену
    if (scene.onEnter) {
        scene.onEnter();
    }
    
    // Прокрутка к верху
    window.scrollTo(0, 0);
}

// Обновление статистики
function updateStats() {
    document.getElementById('health').textContent = `Здоровье: ${gameState.health}%`;
    
    const minutes = Math.floor(gameState.time / 60).toString().padStart(2, '0');
    const seconds = (gameState.time % 60).toString().padStart(2, '0');
    document.getElementById('time').textContent = `Время: ${minutes}:${seconds}`;
    
    const inventoryText = gameState.inventory.length > 0 
        ? `Инвентарь: ${gameState.inventory.join(', ')}`
        : 'Инвентарь: ничего';
    document.getElementById('inventory').textContent = inventoryText;
}

// Сброс игры
function resetGame() {
    gameState.health = 100;
    gameState.time = 0;
    gameState.inventory = [];
    gameState.currentScene = 'start';
    gameState.visitedScenes = new Set(['start']);
    gameState.gameOver = false;
    gameState.endings = new Set();
    gameState.flags = {
        metAlien: false,
        hasWeapon: false,
        knowsPassword: false,
        shipRepaired: false,
        allianceFormed: false
    };
    
    updateStats();
    document.getElementById('restart-btn').classList.add('hidden');
}

// Завершение игры
function endGame() {
    gameState.gameOver = true;
    document.getElementById('restart-btn').classList.remove('hidden');
}

// Воспроизведение фоновой музыки
function playBackgroundMusic() {
    const music = document.getElementById('background-music');
    music.volume = 0.3;
    music.play().catch(e => console.log('Автовоспроизведение музыки заблокировано'));
}

// Воспроизведение звукового эффекта
function playSoundEffect() {
    const sounds = [
        'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
        'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'
    ];
    
    const sound = document.getElementById('effect-sound');
    sound.src = sounds[Math.floor(Math.random() * sounds.length)];
    sound.volume = 0.2;
    sound.play();
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', initGame);
