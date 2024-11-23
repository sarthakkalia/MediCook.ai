document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recipe-form');
    const submitBtn = document.getElementById('submit-btn');
    const recipeOutput = document.getElementById('recipe-output');
    const recipeDisplay = document.getElementById('recipe-display');
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatContent = document.getElementById('chat-content');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const menuToggleButton = document.getElementById('menu-toggle-button');
    const navLinks = document.getElementById('nav-links');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        recipeOutput.textContent = 'Generating your recipe...';
        recipeDisplay.style.opacity = '1';

        const formData = new FormData(form);

        fetch('/generate_recipe', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                recipeOutput.textContent = data.error;
            } else {
                const recipeHTML = `
                    <div class="recipe-content">
                        <div class="recipe-title">
                            <h2>${data.description || 'Generated Recipe'}</h2>
                        </div>
                        <div class="recipe-instructions">
                            ${formatRecipe(data.recipe)}
                        </div>
                        <div class="nutrition-section">
                            <h3>Nutritional Information (per serving)</h3>
                            <table class="nutrient-table">
                                <tr>
                                    <th>Nutrient</th>
                                    <th>Amount</th>
                                </tr>
                                <tr>
                                    <td>Protein</td>
                                    <td>${data.nutrients?.Protein?.toFixed(2) || 0}g</td>
                                </tr>
                                <tr>
                                    <td>Carbohydrates</td>
                                    <td>${data.nutrients?.["Carbohydrate, by difference"]?.toFixed(2) || 0}g</td>
                                </tr>
                                <tr>
                                    <td>Fat</td>
                                    <td>${data.nutrients?.["Total lipid (fat)"]?.toFixed(2) || 0}g</td>
                                </tr>
                                <tr>
                                    <td>Fiber</td>
                                    <td>${data.nutrients?.["Fiber, total dietary"]?.toFixed(2) || 0}g</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `;
                recipeOutput.innerHTML = recipeHTML;
                showChatWidget();
            }
        })
        .catch(error => {
            recipeOutput.textContent = 'An error occurred while generating the recipe. Please try again.';
            console.error('Error:', error);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Recipe';
        });
    });

    function formatRecipe(text) {
        text = text.replace(/### (.*?)\n/g, '<h3>$1</h3>');
        text = text.replace(/#### (.*?)\n/g, '<h4>$1</h4>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>');
        text = text.replace(/(<li>.*?<\/li>)\n/g, '<ul>$1</ul>');
        text = text.split('\n').map(line => {
            line = line.trim();
            if (line && !line.startsWith('<')) {
                return `<p>${line}</p>`;
            }
            return line;
        }).join('');
        return text;
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });
    
    function showChatWidget() {
        chatWidget.classList.remove('hidden');
    }

    function toggleChatContent() {
        chatContent.classList.toggle('hidden');
    }

    chatToggle.addEventListener('click', toggleChatContent);
    closeChat.addEventListener('click', toggleChatContent);

    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            addMessage('user', message);
            // Get the original recipe
            const originalRecipe = document.querySelector('.recipe-content .recipe-instructions')?.innerText;
            // Send the message and original recipe to the backend
            fetch('/modify_recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipe: originalRecipe,
                    query: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    addMessage('bot', data.error);
                } else {
                    const modifiedRecipe = data.modified_recipe || "Couldn't retrieve the modified recipe.";
                    addMessage('bot', modifiedRecipe);
                }
            })
            .catch(error => {
                console.error('Error modifying recipe:', error);
                addMessage('bot', 'An error occurred while modifying the recipe. Please try again.');
            });
        }
        chatInput.value = '';
    });
    

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    menuToggleButton.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnToggle = menuToggleButton.contains(event.target);

        if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
});

