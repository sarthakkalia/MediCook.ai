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
                fetch('/text-to-speech', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ text: data.recipe })
                })
                .then(ttsResponse => ttsResponse.blob())
                .then(blob => {
                    // Create a temporary audio element to play the speech
                    const audioURL = URL.createObjectURL(blob);
                    const audio = new Audio(audioURL);
                    // Create and show the audio icon
                    const audioIconContainer = document.getElementById('audio-icon-container');
                    audioIconContainer.innerHTML = ''; // Clear any existing content
                    const audioIcon = document.createElement('button');
                    audioIcon.innerHTML = '<img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FFFFFF/speaker.png" alt="speaker"/>'; // Replace with your icon image
                    audioIcon.classList.add('play-audio');
                    // Manage audio play/pause state
                     // Toggle audio play/pause when the button is clicked
                    audioIcon.addEventListener('click', () => {
                        if (audio.paused) {
                            audio.play();
                        } else {
                            audio.pause();
                        }
                    });

                    // Update icon when the audio starts playing
                    audio.addEventListener('play', () => {
                        audioIcon.innerHTML = '<img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FFFFFF/pause.png" alt="pause"/>'; // Pause icon
                    });
                    
                    // Update icon when the audio is paused
                    audio.addEventListener('pause', () => {
                        audioIcon.innerHTML = '<img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FFFFFF/speaker.png" alt="speaker"/>'; // Play icon
                    });

                    // Reset icon when the audio ends
                    audio.addEventListener('ended', () => {
                        audioIcon.innerHTML = '<img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FFFFFF/speaker.png" alt="speaker"/>'; // Play icon
                    });
                    
                    audioIconContainer.appendChild(audioIcon);
                    
                    // Make the audio icon visible
                    audioIconContainer.classList.remove('hidden');
                })
                .catch(error => {
                    console.error('Error generating speech:', error);
                });

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
            addMessage('user', escapeHTML(message));
            // Get the original recipe
            const originalRecipe = document.querySelector('.recipe-content .recipe-instructions')?.innerText || 'No recipe available';
            
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
                    addMessage('bot', `<div class="error-message">Error: ${escapeHTML(data.error)}</div>`);
                } else {
                    const formattedRecipe = formatRecipe(data.modified_recipe || "Couldn't retrieve the modified recipe.");
                    addMessage('bot', formattedRecipe, true);
                }
            })
            .catch(error => {
                console.error('Error modifying recipe:', error);
                addMessage('bot', `<div class="error-message">An error occurred while modifying the recipe. Please try again.</div>`);
            });
        }
        chatInput.value = '';
    });
    
    // Helper function to format recipe content with proper HTML structure
    function formatRecipe(text) {
        if (!text) return 'No recipe provided.';
        return text
            .replace(/### (.*?)\n/g, '<h3>$1</h3>')
            .replace(/#### (.*?)\n/g, '<h4>$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/(<li>.*?<\/li>)\n/g, '<ul>$1</ul>')
            .split('\n')
            .map(line => `<p>${line.trim()}</p>`)
            .join('');
    }
    
    // Helper function to display messages in the chat
    function addMessage(sender, content, isHTML = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        if (isHTML) {
            messageElement.innerHTML = content; // Render HTML for bot messages
        } else {
            messageElement.textContent = content; // Plain text for user messages
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }
    
    // Escape HTML to prevent raw tags from appearing in user inputs
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    

    // function addMessage(sender, text) {
    //     const messageElement = document.createElement('div');
    //     messageElement.classList.add('message', sender);
    //     messageElement.textContent = text;
    //     chatMessages.appendChild(messageElement);
    //     chatMessages.scrollTop = chatMessages.scrollHeight;
    // }

    // menuToggleButton.addEventListener('click', function() {
    //     navLinks.classList.toggle('active');
    // });

    // document.addEventListener('click', function(event) {
    //     const isClickInsideNav = navLinks.contains(event.target);
    //     const isClickOnToggle = menuToggleButton.contains(event.target);

    //     if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
    //         navLinks.classList.remove('active');
    //     }
    // });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
});

