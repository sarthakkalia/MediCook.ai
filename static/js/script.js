document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recipe-form');
    const submitBtn = document.getElementById('submit-btn');
    const recipeOutput = document.getElementById('recipe-output');
    const recipeDisplay = document.getElementById('recipe-display');

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

    // Helper function to format recipe text
    function formatRecipe(text) {
        // Replace markdown headers with HTML
        text = text.replace(/### (.*?)\n/g, '<h3>$1</h3>');
        text = text.replace(/#### (.*?)\n/g, '<h4>$1</h4>');
        
        // Format bold text
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format lists
        text = text.replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>');
        
        // Wrap lists in ul tags
        text = text.replace(/(<li>.*?<\/li>)\n/g, '<ul>$1</ul>');
        
        // Format paragraphs
        text = text.split('\n').map(line => {
            line = line.trim();
            if (line && !line.startsWith('<')) {
                return `<p>${line}</p>`;
            }
            return line;
        }).join('');
        
        return text;
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // FAQ accordion functionality
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
});