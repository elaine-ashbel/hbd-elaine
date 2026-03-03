document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Hero & Gift Box Logic ---
    const giftBox = document.getElementById('gift-box');
    const message = document.getElementById('message');
    const heroContent = document.querySelector('.hero-content');
    const balloonContainer = document.getElementById('balloon-container');

    const colors = ['#ff8da1', '#ffd1d9', '#ffb6c1', '#f0c6d6', '#e6c8dc'];

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        // Randomize spawn configuration
        const leftPos = Math.random() * 100; // 0 to 100vw
        const width = 30 + Math.random() * 20; // 30px to 50px
        const height = width * 1.25;
        const animDuration = 5 + Math.random() * 5; // 5s to 10s
        const bgCol = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * .5;

        balloon.style.left = `${leftPos}vw`;
        balloon.style.width = `${width}px`;
        balloon.style.height = `${height}px`;
        // Re-coloring balloon via JS CSS overriding before element
        balloon.style.backgroundColor = bgCol;
        balloon.style.animationDuration = `${animDuration}s`;
        balloon.style.animationDelay = `${delay}s`;

        // Add dynamic CSS rule for pseudo element colors trick
        balloon.style.borderBottomColor = bgCol;

        // Make clickable to pop
        balloon.style.pointerEvents = 'auto';
        balloon.style.cursor = 'pointer';

        balloon.addEventListener('click', (e) => {
            // Tiny confetti burst from balloon center
            confetti({
                particleCount: 20,
                spread: 40,
                origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                colors: [bgCol, '#ffffff'],
                ticks: 40
            });
            balloon.remove();
        });

        balloonContainer.appendChild(balloon);

        // Remove balloon after animation completes to clean up DOM
        setTimeout(() => {
            if (document.body.contains(balloon)) balloon.remove();
        }, (animDuration + delay) * 1000);
    }

    function firePoppers() {
        // Left side
        confetti({
            particleCount: 100,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.8 },
            colors: colors
        });
        // Right side
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.8 },
            colors: colors
        });
    }

    giftBox.addEventListener('click', () => {
        // Hide initial hero elements and reveal message
        heroContent.classList.add('message-opened');

        // Hide scroll indicator initially if it was visible
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) scrollIndicator.style.opacity = '0';

        setTimeout(() => {
            message.classList.add('show');
            // Fire poppers
            firePoppers();

            // Continuous poppers for a bit
            setTimeout(firePoppers, 1000);
            setTimeout(firePoppers, 2500);

            // Generate Balloons
            const isPortrait = window.innerWidth <= 768;
            const balloonCount = isPortrait ? 20 : 40;
            for (let i = 0; i < balloonCount; i++) {
                setTimeout(createBalloon, i * 200);
            }

            // Reveal the rest of the page content after a slight delay
            setTimeout(() => {
                const hiddenContent = document.getElementById('hidden-content');
                if (hiddenContent) {
                    hiddenContent.style.display = 'block';
                    // Trigger reflow
                    void hiddenContent.offsetWidth;
                    hiddenContent.style.opacity = '1';
                }

                // Unlock the page scrolling now that the content is visible
                document.body.classList.add('scrollable');

                if (scrollIndicator) {
                    scrollIndicator.style.opacity = '0.6';
                    scrollIndicator.classList.add('visible');
                }
            }, 1000);

        }, 500); // Wait for fade out
    });


    // --- 2. Ambient Floating Hearts ---
    let heartsCollected = 0;
    let collectorHideTimeout = null;
    const heartCollectorUI = document.getElementById('heart-collector');
    const heartCountDisplay = document.getElementById('heart-count');

    function spawnAmbientHeart() {
        const obj = document.createElement('div');
        obj.classList.add('ambient-obj', 'heart-obj');
        obj.innerText = '❤';

        // Random size
        const sizeRem = 0.5 + Math.random() * 3.5;
        obj.style.fontSize = `${sizeRem}rem`;

        // Bias towards left/right sides
        let leftPos;
        if (Math.random() < 0.75) {
            leftPos = Math.random() < 0.5 ? Math.random() * 30 : 70 + Math.random() * 25;
        } else {
            leftPos = 30 + Math.random() * 40;
        }

        const topPos = Math.random() * 95;
        const animDuration = 6 + Math.random() * 9;

        obj.style.left = `${leftPos}vw`;
        obj.style.top = `${topPos}vh`;
        obj.style.animationDuration = `${animDuration}s`;

        obj.style.pointerEvents = 'auto';
        obj.style.cursor = 'pointer';

        obj.addEventListener('click', (e) => {
            // Freeze the exact current screen position so it doesn't jump
            const rect = obj.getBoundingClientRect();
            obj.style.left = `${rect.left}px`;
            obj.style.top = `${rect.top}px`;
            obj.style.transform = 'none'; // Remove the floating translateY transform
            obj.style.animation = 'none'; // Stop the floating animation

            // Trigger reflow to apply the freeze before applying the ripple effect
            void obj.offsetWidth;

            // Add the beautiful ripple CSS animation
            obj.classList.add('ripple-effect');

            // Update Collector
            heartsCollected++;
            if (heartCountDisplay) heartCountDisplay.innerText = heartsCollected;

            if (heartsCollected > 0 && heartsCollected % 5 === 0) {
                showerDaisies();   // ← This line must be here
            }

            // Show Collector UI temporarily and remove the initial zero-state hiding
            if (heartCollectorUI) {
                heartCollectorUI.classList.remove('zero');
                heartCollectorUI.classList.add('visible');

                clearTimeout(collectorHideTimeout);

                // Hide after 3 seconds of inactivity
                collectorHideTimeout = setTimeout(() => {
                    heartCollectorUI.classList.remove('visible');
                }, 3000);
            }

            // Wait for the 1.5s ripple animation to finish before removing the element from the DOM
            setTimeout(() => {
                if (document.body.contains(obj)) obj.remove();
            }, 1500);
        });

        document.body.appendChild(obj);

        setTimeout(() => {
            if (document.body.contains(obj)) obj.remove();
        }, animDuration * 1000);
    }

    function showerDaisies() {
        const daisyCount = 45;                    // more daisies = prettier explosion
        for (let i = 0; i < daisyCount; i++) {
            setTimeout(spawnDaisy, i * 100);      // staggered for a nice cascade
        }
    }

    function spawnDaisy() {
        const obj = document.createElement('div');
        obj.classList.add('ambient-obj', 'daisy-obj');

        // Premium SVG Daisy (exactly as used in the original site)
        obj.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 100 100">
            <g transform="translate(50, 50)" fill="#ffffff">
                <ellipse cx="0" cy="-25" rx="14" ry="25" />
                <ellipse cx="0" cy="25" rx="14" ry="25" />
                <g transform="rotate(60)"><ellipse cx="0" cy="-25" rx="14" ry="25" /><ellipse cx="0" cy="25" rx="14" ry="25" /></g>
                <g transform="rotate(120)"><ellipse cx="0" cy="-25" rx="14" ry="25" /><ellipse cx="0" cy="25" rx="14" ry="25" /></g>
            </g>
            <circle cx="50" cy="50" r="14" fill="#facc15" />
        </svg>`;

        const sizeRem = 1.6 + Math.random() * 2;
        obj.style.width = `${sizeRem}rem`;
        obj.style.height = `${sizeRem}rem`;

        const leftPos = Math.random() * 100;
        const animDuration = 4 + Math.random() * 3;

        obj.style.left = `${leftPos}vw`;
        obj.style.top = `-55px`;
        obj.style.animation = `daisyFall ${animDuration}s linear forwards`;
        obj.style.zIndex = 10000;
        obj.style.pointerEvents = 'none';

        document.body.appendChild(obj);

        setTimeout(() => {
            if (document.body.contains(obj)) obj.remove();
        }, animDuration * 1000);
    }

    // Create initial ambient hearts
    const isPortrait = window.innerWidth <= 768;
    const initialHearts = isPortrait ? 10 : 30;
    const spawnInterval = isPortrait ? 1200 : 800;

    for (let i = 0; i < initialHearts; i++) {
        setTimeout(spawnAmbientHeart, i * 150);
    }
    // Continuously create hearts
    setInterval(spawnAmbientHeart, spawnInterval);

    // --- 2.8 Mouse Sparkle Trail ---
    let lastHeartTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastHeartTime > 40) { // Throttle to 1 speck every 40ms for a smoother trail
            const speck = document.createElement('div');
            speck.classList.add('mouse-trail');
            speck.style.left = `${e.clientX}px`;
            speck.style.top = `${e.clientY}px`;
            document.body.appendChild(speck);
            setTimeout(() => speck.remove(), 600);
            lastHeartTime = now;
        }
    });

    // --- 2.5 Cards Carousel Logic (Swipe & Auto) ---
    const cards = document.querySelectorAll('.card');
    let currentCardIndex = 0;
    let autoPlayInterval;

    // Swipe Variables
    let startX = 0;
    let isDragging = false;
    let currentX = 0;

    function goToCard(index) {
        currentCardIndex = index;

        // Handle wrapping
        if (currentCardIndex < 0) currentCardIndex = cards.length - 1;
        if (currentCardIndex >= cards.length) currentCardIndex = 0;

        const prevIndex = (currentCardIndex - 1 + cards.length) % cards.length;
        const nextIndex = (currentCardIndex + 1) % cards.length;

        cards.forEach((card, i) => {
            card.className = 'card'; // Reset classes
            if (i === currentCardIndex) {
                card.classList.add('active');
            } else if (i === prevIndex) {
                card.classList.add('prev-card');
            } else if (i === nextIndex) {
                card.classList.add('next-card');
            }
        });
    }

    function nextCard() { goToCard(currentCardIndex + 1); }
    function prevCard() { goToCard(currentCardIndex - 1); }

    // Add click listeners to cards for peek navigation
    cards.forEach((card, i) => {
        card.addEventListener('click', () => {
            if (card.classList.contains('prev-card') || card.classList.contains('next-card')) {
                goToCard(i);
                resetAutoPlay();
            }
        });
    });

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextCard, 5000);
    }

    if (cards.length > 0) {
        // Initialize
        cards[currentCardIndex].classList.add('active');
        resetAutoPlay();

        // Touch / Swipe Events for Carousel Container
        const container = document.querySelector('.cards-container');

        const handleDragStart = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            clearInterval(autoPlayInterval); // Pause auto while dragging
        };

        const handleDragMove = (e) => {
            if (!isDragging) return;
            currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        };

        const handleDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            const diffX = currentX - startX;
            // 50px threshold to trigger swipe
            if (Math.abs(diffX) > 50 && currentX !== 0) {
                if (diffX > 0) prevCard(); // Swiped right -> go prev
                else nextCard();           // Swiped left -> go next
            }

            currentX = 0;
            resetAutoPlay();
        };

        // Mouse events (for desktop sweeping)
        container.addEventListener('mousedown', handleDragStart);
        container.addEventListener('mousemove', handleDragMove);
        container.addEventListener('mouseup', handleDragEnd);
        container.addEventListener('mouseleave', handleDragEnd);

        // Touch events (for mobile swiping)
        container.addEventListener('touchstart', handleDragStart, { passive: true });
        container.addEventListener('touchmove', handleDragMove, { passive: true });
        container.addEventListener('touchend', handleDragEnd);

        // Navigation Buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                prevCard();
                resetAutoPlay();
            });
            nextBtn.addEventListener('click', () => {
                nextCard();
                resetAutoPlay();
            });
        }
    }

    // --- 2.6 Letters Logic (23 + Infinity) ---
    const lettersData = [
        "If I had a dollar for every time you cross my mind, I would have exactly one dollar.",
        "You are the most special person in my life.",           // 1
        "I love you more than words can say.",               // 3                               // 4
        "You push me to be a better person. ",                 // 5
        "My heart skips a beat when I look at you.",                   // 6
        "Sharing the good news with you is more exiting than the good news itself.",
        "I love the way you sound when you talk about things you love.",                             // 7
        "Every moment with you feels like a dream I never want to wake up from.",// 8
        "Ruining eachothers insta feed is something i miss.",
        "I love your voice more than my favorite song.",                        // 9
        "I love how we used to laugh about the silliest things together.",           // 10                   // 11
        "you are so effortlessly elegant",              // 12
        "Kalyanathinu mloftil ninnu saree vangi tharam.",                 // 13                        // 14
        "Thinking about you is my favorite part of the day.",                    // 15
        "I'd rather lose my life than to lose you.",            // 16
        "You are my once in an eternity kind of love.",         // 17                           // 18
        "You turned romantic songs into something real for me.",                   // 19
        "I fall for you a little more every single day.",                        // 20
        "You're the sweetest addition to my life.",                             // 21
        "I'm looking forward for every sunrise and sunset we'll share together.",
        "I can't wait to look back one day and smile at how it all started.",
        "You complete me.",
        "Happy 23rd Birthday, Elaine .",          // 23
        "23 letters for today and a long lifetime of love waiting to be written"                     // 24 (Infinity)
    ];

    let currentLetterIndex = 0; // 0 to 23
    const btnUp = document.getElementById('letter-up');
    const btnDown = document.getElementById('letter-down');
    const displayCounter = document.getElementById('letter-counter');
    const mainEnvelope = document.getElementById('envelope');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const letterText = document.getElementById('letter-text');
    let isSwappingLetter = false;

    function renderLetterData() {
        // Update Counter (Display 1-23, then ∞ for 24th)
        if (currentLetterIndex === 23) {
            displayCounter.innerText = "∞";
        } else {
            displayCounter.innerText = currentLetterIndex + 1;
        }

        // Update Paper Text
        letterText.innerText = lettersData[currentLetterIndex];
    }

    // Initial Render
    renderLetterData();

    // Envelope Click Handler
    mainEnvelope.addEventListener('click', () => {
        if (!isSwappingLetter) {
            mainEnvelope.classList.toggle('open');
        }
    });

    // Helper to swap letter with animation
    function swapLetter(direction) {
        if (isSwappingLetter) return;
        isSwappingLetter = true;

        const isOpen = mainEnvelope.classList.contains('open');
        mainEnvelope.classList.remove('open');

        // Wait for flap to fully close if it was open (0.4s delay + 0.5s duration = 0.9s total), else start immediately
        const delay = isOpen ? 900 : 0;

        setTimeout(() => {
            // Initiate Slide Out
            if (direction === 'up') {
                envelopeWrapper.classList.add('slide-out-up');
            } else {
                envelopeWrapper.classList.add('slide-out-down');
            }

            // Wait for slide out, update text, set to opposite, then slide back in
            setTimeout(() => {
                // Update Index (Right button 'up' increments, Left button 'down' decrements)
                if (direction === 'up') {
                    currentLetterIndex = (currentLetterIndex + 1) % lettersData.length;
                } else {
                    currentLetterIndex = (currentLetterIndex - 1 + lettersData.length) % lettersData.length;
                }
                renderLetterData();

                // Swap classes to enter from the opposite side instantly
                envelopeWrapper.className = 'envelope-wrapper'; // Remove out animations
                if (direction === 'up') {
                    envelopeWrapper.classList.add('slide-in-up');
                } else {
                    envelopeWrapper.classList.add('slide-in-down');
                }

                // Force reflow so browser applies the instant opposite-side position
                void envelopeWrapper.offsetWidth;

                // Remove the forced entry position class to trigger CSS transition back to center
                envelopeWrapper.classList.remove('slide-in-up', 'slide-in-down');
                envelopeWrapper.classList.add('active');

                // Cleanup after slide in completes
                setTimeout(() => {
                    envelopeWrapper.classList.remove('active');
                    isSwappingLetter = false;
                }, 600);

            }, 600); // Duration of out slide
        }, delay);
    }

    btnUp.addEventListener('click', () => swapLetter('up'));
    btnDown.addEventListener('click', () => swapLetter('down'));

    // --- 3. Timer Logic (Since 21-12-22) ---
    // Month is 0-indexed in JS, so December is 11
    const startDate = new Date(2022, 11, 21, 0, 0, 0);

    function updateTimer() {
        const now = new Date();
        const difference = now.getTime() - startDate.getTime();

        // Calculate time units
        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('years').innerText = years;
        document.getElementById('months').innerText = months;
        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('minutes').innerText = minutes;
        document.getElementById('seconds').innerText = seconds;
    }

    // Update timer immediately and then every second
    updateTimer();
    setInterval(updateTimer, 1000);

    // --- 3. Shuffle Game Logic ---
    const couples = [
        "Carl & Ellie (Up)",
        "Wall-E & Eve (Wall-E)",
        "Rapunzel & Flynn (Tangled)",
        "Ariel & Eric (The Little Mermaid)",
        "Belle & Beast (Beauty and the Beast)",
        "Mickey & Minnie",
        "Jim & Pam (The Office)",
        "Marshall & Lily (HIMYM)",
        "Chandler & Monica (Friends)",
        "Gomez & Morticia Addams",
        "Troy & Gabriella (High School Musical)",
        "Peter Parker & MJ",
        "Shrek & Fiona",
        "Lois Lane & Superman",
        "Anna & Kristoff (Frozen)",
        "Tiana & Naveen (Princess & the Frog)",
        "Aladdin & Jasmine",
        "Simba & Nala (The Lion King)",
        "Ron & Hermione (Harry Potter)",
        "Percy & Annabeth (Percy Jackson)",
        "Gwen & Miles Morales",
        "Homer & Marge (The Simpsons)",
        "Bob & Linda (Bob's Burgers)",
        "Phil & Claire (Modern Family)",
        "Jake & Amy (Brooklyn Nine-Nine)",
        "Leslie & Ben (Parks and Rec)",
        "Ross & Rachel (Friends)",
        "Jess & Nick (New Girl)",
        "Eleanor & Chidi (The Good Place)",
        "Geralt & Yennefer (The Witcher)",
        "Edward & Bella (Twilight)",
        "Peeta & Katniss (Hunger Games)",
        "Han Solo & Leia (Star Wars)",
        "Tony Stark & Pepper Potts",
        "Steve Rogers & Peggy Carter",
        "Wanda & Vision",
        "Peter Quill & Gamora",
        "Scott Lang & Hope",
        "Goku & Chi-Chi (Dragon Ball)",
        "Naruto & Hinata",
        "Usagi & Mamoru (Sailor Moon)",
        "Inuyasha & Kagome",
        "Kiki & Tombo (Kiki's Delivery Service)",
        "Sophie & Howl (Howl's Moving Castle)",
        "Chihiro & Haku (Spirited Away)",
        "Mitsuha & Taki (Your Name)",

    ];

    const shuffleBtn = document.getElementById('shuffle-btn');
    const coupleResult = document.getElementById('couple-result');
    let isShuffling = false;

    // Fisher-Yates Shuffle Algorithm to ensure true non-repeating randomness
    function trueShuffle(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // Maintain a deck of shuffled couples
    let shuffledDeck = trueShuffle(couples);
    let deckIndex = 0;

    shuffleBtn.addEventListener('click', () => {
        if (isShuffling) return;
        isShuffling = true;

        let shuffles = 0;
        const maxShuffles = 20; // How many times it changes text before stopping
        const shuffleSpeed = 80;
        let lastVisualCouple = "";

        const interval = setInterval(() => {
            // Visual rolling effect without consecutive repeats
            let randomCouple;
            do {
                randomCouple = couples[Math.floor(Math.random() * couples.length)];
            } while (randomCouple === lastVisualCouple);
            lastVisualCouple = randomCouple;

            // Format to put the bracket part on a new line
            coupleResult.innerHTML = randomCouple.replace(' (', '<br>(');
            coupleResult.style.opacity = 0.5;
            shuffles++;

            if (shuffles >= maxShuffles) {
                clearInterval(interval);

                // Pick final winning couple strictly from the shuffled deck
                if (deckIndex >= shuffledDeck.length) {
                    shuffledDeck = trueShuffle(couples); // Reshuffle when deck is empty
                    deckIndex = 0;
                }
                const finalCouple = shuffledDeck[deckIndex++];

                coupleResult.innerHTML = finalCouple.replace(' (', '<br>(');
                coupleResult.style.opacity = 1;
                coupleResult.style.transform = 'scale(1.1)';

                // Add pop effect using CSS transition defined in CSS
                setTimeout(() => {
                    coupleResult.style.transform = 'scale(1)';
                    isShuffling = false;
                    // Mini confetti for shuffle win
                    confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.9 },
                        colors: colors
                    });
                }, 200);
            }
        }, shuffleSpeed);
    });
});


