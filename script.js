document.addEventListener('DOMContentLoaded', () => {

    // Fetch data from JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar data.json. Asegúrate de estar corriendo un servidor local (ej: Live Server).");
            }
            return response.json();
        })
        .then(data => {
            renderContent(data);
            initInteractions();
        })
        .catch(error => {
            console.error('Error cargando el JSON:', error);
            document.getElementById('timeline-container').innerHTML =
                `<div style="color: red; padding: 2rem; text-align: center; background: white; border: 4px solid black; border-radius: 12px;">
                    <h3>Error al cargar los datos</h3>
                    <p>Para cargar el archivo <b>data.json</b> correctamente, debes abrir este proyecto usando un servidor local.</p>
                </div>`;
        });

    function renderContent(data) {
        const timelineContainer = document.getElementById('timeline-container');
        let html = '';

        // Generate Sections
        data.sections.forEach((section) => {
            let itemsHtml = '';
            section.items.forEach((item, index) => {
                const activeClass = '';

                const cleanText = item.text.replace(/<br><br><span class="interactive-hint">.*?<\/span>/gi, '');
                const stepLabel = item.stepLabel || `Paso ${index + 1}`;

                itemsHtml += `
                    <div class="bio-item ${activeClass}" data-index="${index}">
                        <div class="card-header">
                            <span class="step-label">${stepLabel}</span>
                        </div>
                        <div class="card-body">
                            <img src="${item.image}" alt="${item.alt}" class="card-icon">
                            <div class="bio-content">
                                <h3>${item.title}</h3>
                                <p>${cleanText}</p>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                <section class="timeline-item reveal">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div style="text-align: center;"><h2 class="section-title">${section.title}</h2></div>
                        <div class="bio-carousel-container">
                            <div class="bio-accordion">
                                ${itemsHtml}
                            </div>
                        </div>
                    </div>
                </section>
            `;
        });

        // Generate Sources Section
        if (data.sourcesSection) {
            let sourcesHtml = '';
            data.sourcesSection.sources.forEach(source => {
                sourcesHtml += `<li>${source}</li>`;
            });

            html += `
                <section class="timeline-item reveal">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div style="text-align: center;"><h2 class="section-title">${data.sourcesSection.title}</h2></div>
                        <ul class="sources-list">
                            ${sourcesHtml}
                        </ul>
                    </div>
                </section>
            `;
        }

        timelineContainer.innerHTML = html;
    }

    function initInteractions() {
        // Scroll Reveal Animation
        const reveals = document.querySelectorAll('.reveal');
        const revealOnScroll = () => {
            const windowHeight = window.innerHeight;
            const elementVisible = 150;
            reveals.forEach(reveal => {
                const elementTop = reveal.getBoundingClientRect().top;
                if (elementTop < windowHeight - elementVisible) {
                    reveal.classList.add('active');
                }
            });
        };
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Trigger once on load

        // Accordion Carousel Logic (Click to expand)
        const carousels = document.querySelectorAll('.bio-carousel-container');
        carousels.forEach(carousel => {
            const items = carousel.querySelectorAll('.bio-item');
            let isAnimating = false;

            items.forEach((item) => {
                item.addEventListener('click', () => {
                    if (isAnimating) return; // Previene clics múltiples durante la animación

                    // Si ya está activo, lo cerramos
                    if (item.classList.contains('active')) {
                        item.classList.remove('active');
                        return;
                    }

                    // Buscamos si hay otro activo en esta sección
                    const currentlyActive = Array.from(items).find(i => i.classList.contains('active'));

                    if (currentlyActive) {
                        isAnimating = true;
                        currentlyActive.classList.remove('active');

                        // Esperamos a que la animación de cierre termine (aprox 550ms) antes de abrir la nueva
                        setTimeout(() => {
                            item.classList.add('active');
                            isAnimating = false;

                            // Opcional: aseguramos que la nueva tarjeta quede a la vista
                            setTimeout(() => {
                                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }, 100);
                        }, 550);
                    } else {
                        // Si no hay ninguno abierto, se abre al instante
                        item.classList.add('active');
                    }
                });
            });
        });
    }
});
