class AncientWisdomApp {
    constructor() {
        this.currentScreen = 'splashScreen';
        this.userData = {
            birthDate: '',
            imageBase64: '',
            characterAnalysis: ''
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('splashScreen');
    }

    bindEvents() {
        // Splash screen
        document.getElementById('startBtn').addEventListener('click', () => {
            this.showScreen('inputScreen');
        });

        // Input screen
        document.getElementById('photoUploadArea').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });

        document.getElementById('photoUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        document.getElementById('birthDate').addEventListener('change', () => {
            this.validateForm();
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeCharacter();
        });

        // Character screen
        document.getElementById('newReadingBtn').addEventListener('click', () => {
            this.resetApp();
        });

        // Premium cards
        document.querySelectorAll('.premium-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.showPremiumScreen(category);
            });
        });

        // Premium screen
        document.getElementById('purchaseBtn').addEventListener('click', () => {
            this.handlePurchase();
        });

        document.getElementById('backToCharacterBtn').addEventListener('click', () => {
            this.showScreen('characterScreen');
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.userData.imageBase64 = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            
            // Show preview
            const previewImage = document.getElementById('previewImage');
            const placeholder = document.querySelector('.upload-placeholder');
            
            previewImage.src = imageData;
            previewImage.style.display = 'block';
            placeholder.style.display = 'none';
            
            this.validateForm();
        };
        reader.readAsDataURL(file);
    }

    validateForm() {
        const birthDate = document.getElementById('birthDate').value;
        const hasImage = this.userData.imageBase64 !== '';
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (birthDate && hasImage) {
            this.userData.birthDate = birthDate;
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    }

    async analyzeCharacter() {
        this.showScreen('characterScreen');
        
        try {
            // Try to connect to your backend first
            const response = await fetch('http://127.0.0.1:5000/analyze-character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    birth_date: this.userData.birthDate,
                    image: this.userData.imageBase64
                } )
            });

            if (response.ok) {
                const data = await response.json();
                this.userData.characterAnalysis = data.analysis || data.message || 'Character analysis completed.';
            } else {
                throw new Error('Backend not available');
            }
            
        } catch (error) {
            console.log('Using demo analysis - backend not available');
            // Demo character analysis
            this.userData.characterAnalysis = this.getDemoCharacterAnalysis();
        }

        // Hide loading spinner and show result
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('characterResult').innerHTML = `
            <h3>Your Character Analysis</h3>
            <p>${this.userData.characterAnalysis}</p>
        `;
        
        // Show premium options
        document.getElementById('premiumOptions').style.display = 'block';
    }

    getDemoCharacterAnalysis() {
        const analyses = [
            "Based on your birth date and the energy captured in your photo, you possess a remarkable blend of intuition and analytical thinking. Your natural charisma draws people to you, while your thoughtful nature ensures you make decisions with both heart and mind. You have a gift for seeing the bigger picture while paying attention to important details. Your personality radiates warmth and authenticity, making others feel comfortable in your presence.",
            
            "Your birth date reveals someone with strong leadership qualities and a natural ability to inspire others. The photo shows a person who balances confidence with humility. You have an innate understanding of human nature and can easily connect with people from all walks of life. Your creative spirit is balanced by practical wisdom, making you both a dreamer and an achiever.",
            
            "The cosmic alignment of your birth date suggests you are someone who values both tradition and innovation. Your photo captures a spirit that is both grounded and adventurous. You have the rare ability to make others feel heard and understood. Your natural empathy, combined with your strong sense of justice, makes you a natural advocate for others."
        ];
        
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    showPremiumScreen(category) {
        const categoryInfo = {
            love: { emoji: '💕', title: 'Love Fortune', description: 'Discover insights about your romantic life and relationships' },
            health: { emoji: '🌿', title: 'Health Fortune', description: 'Get guidance on your physical and mental wellbeing' },
            wealth: { emoji: '💰', title: 'Wealth Fortune', description: 'Uncover predictions about your financial future' },
            career: { emoji: '🚀', title: 'Career Fortune', description: 'Explore your professional path and opportunities' }
        };

        const info = categoryInfo[category];
        document.getElementById('premiumTitle').textContent = info.title;
        document.getElementById('premiumDescription').textContent = info.description;
        document.getElementById('premiumIconLarge').textContent = info.emoji;
        
        // Store current category for purchase
        this.currentPremiumCategory = category;
        
        this.showScreen('premiumScreen');
    }

    async handlePurchase() {
        // Hide purchase button and show loading
        document.getElementById('purchaseBtn').style.display = 'none';
        document.getElementById('premiumResult').style.display = 'block';
        
        try {
            // Try to connect to your backend for payment processing
            const paymentResponse = await fetch('http://127.0.0.1:5000/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 2.99,
                    item_name: `${this.currentPremiumCategory} Fortune Reading`,
                    return_url: window.location.href,
                    cancel_url: window.location.href
                } )
            });

            if (paymentResponse.ok) {
                // In production, you would redirect to PayFast
                // For demo, we'll simulate successful payment
                setTimeout(() => {
                    this.processPremiumReading();
                }, 2000);
            } else {
                throw new Error('Payment service not available');
            }
            
        } catch (error) {
            console.log('Using demo payment - backend not available');
            // Demo payment processing
            setTimeout(() => {
                this.processPremiumReading();
            }, 2000);
        }
    }

    async processPremiumReading() {
        try {
            // Try to get premium reading from backend
            const response = await fetch(`http://127.0.0.1:5000/fortune/${this.currentPremiumCategory}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    birth_date: this.userData.birthDate,
                    image: this.userData.imageBase64,
                    character_analysis: this.userData.characterAnalysis
                } )
            });

            let fortuneText;
            if (response.ok) {
                const data = await response.json();
                fortuneText = data.fortune || data.message;
            } else {
                throw new Error('Backend not available');
            }

        } catch (error) {
            console.log('Using demo fortune - backend not available');
            fortuneText = this.getDemoFortune(this.currentPremiumCategory);
        }

        // Hide loading and show result
        document.getElementById('premiumLoadingSpinner').style.display = 'none';
        document.getElementById('premiumResult').innerHTML = `
            <h3>Your ${this.currentPremiumCategory.charAt(0).toUpperCase() + this.currentPremiumCategory.slice(1)} Fortune</h3>
            <p>${fortuneText}</p>
        `;
    }

    getDemoFortune(category) {
        const fortunes = {
            love: "The cosmic energies surrounding your heart are particularly strong right now. A significant romantic connection is approaching your life - someone who will appreciate your authentic self. For those already in relationships, expect a period of renewed passion and deeper understanding. Trust your intuition when it comes to matters of the heart, as the universe is aligning to bring you the love you deserve.",
            
            health: "Your life force energy is vibrant and strong. The stars indicate a period of improved vitality and wellbeing ahead. Focus on balance in all aspects of your life - physical, mental, and spiritual. A new health practice or lifestyle change you've been considering will bring remarkable benefits. Listen to your body's wisdom and don't ignore the importance of rest and rejuvenation.",
            
            wealth: "Financial abundance is flowing toward you through channels you may not yet see. Your natural talents and hard work are about to be recognized and rewarded in unexpected ways. A new opportunity for income or investment will present itself within the next few months. Trust your instincts when making financial decisions, as your intuition is particularly sharp regarding money matters.",
            
            career: "Your professional path is illuminated with golden opportunities. A significant advancement or new direction will present itself soon, possibly through a connection you already have. Your unique skills and perspective are exactly what the universe needs right now. Don't be afraid to step into leadership roles or share your innovative ideas - success is written in the stars for you."
        };
        
        return fortunes[category] || "The universe has special plans for you. Stay open to the signs and trust in your journey.";
    }

    resetApp() {
        // Reset user data
        this.userData = {
            birthDate: '',
            imageBase64: '',
            characterAnalysis: ''
        };

        // Reset form
        document.getElementById('birthDate').value = '';
        document.getElementById('photoUpload').value = '';
        document.getElementById('previewImage').style.display = 'none';
        document.querySelector('.upload-placeholder').style.display = 'block';
        document.getElementById('analyzeBtn').disabled = true;

        // Reset character screen
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('premiumOptions').style.display = 'none';

        // Reset premium screen
        document.getElementById('purchaseBtn').style.display = 'block';
        document.getElementById('premiumResult').style.display = 'none';
        document.getElementById('premiumLoadingSpinner').style.display = 'block';

        // Go back to splash screen
        this.showScreen('splashScreen');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AncientWisdomApp();
});
