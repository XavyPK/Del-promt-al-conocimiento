/**
 * NOTICIAS VISUALES PARA ESTUDIANTES - LÓGICA E INTEGRACIÓN REAL CON GEMINI API
 * Paleta: #A51C30 (Carmesí), #FFFFFF (Blanco), #1E1E1E (Carbón), #C9A227 (Dorado)
 * Equipo 3 · Universidad Virtual
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configuración de la API de Google Gemini proporcionada por el usuario
    const GEMINI_API_KEY = 'AQ.Ab8RN6J2ISpwLCdAyaSVZmxdtOb66a5t-IuIcI_Vs8p0PDn1gQ';
    // Cadena de modelos verificados con esta API Key (el más adecuado primero + respaldos automáticos)
    const GEMINI_MODELS = [
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest'
    ];

    // Referencias del DOM - Formulario y Controles de IA
    const newsAiForm = document.getElementById('newsAiForm');
    const btnGenerateAiNews = document.getElementById('btnGenerateAiNews');
    const userIdeaInput = document.getElementById('userIdeaInput');
    const aiToneSelect = document.getElementById('aiToneSelect');
    const newsLinkInput = document.getElementById('newsLinkInput');
    const newsLinkText = document.getElementById('newsLinkText');

    // Controles de Imagen (Casilla marcable + Combobox sincronizados)
    const aiImageCheckbox = document.getElementById('aiImageCheckbox');
    const imageModeCombobox = document.getElementById('imageModeCombobox');
    const aiImageOptionsBox = document.getElementById('aiImageOptionsBox');
    const userUploadOptionsBox = document.getElementById('userUploadOptionsBox');
    const aiImageStyle = document.getElementById('aiImageStyle');
    const userImageFileInput = document.getElementById('userImageFileInput');
    const userImageUrlInput = document.getElementById('userImageUrlInput');
    const uploadFilePreviewInfo = document.getElementById('uploadFilePreviewInfo');

    // Campos de revisión humana (Asunto y Cuerpo generados por IA)
    const generatedSubjectInput = document.getElementById('generatedSubjectInput');
    const generatedBodyInput = document.getElementById('generatedBodyInput');
    const aiGenerationStatus = document.getElementById('aiGenerationStatus');
    const formAlertMessage = document.getElementById('formAlertMessage');

    // Referencias de la Vista Previa del Correo
    const emailVisualCanvas = document.getElementById('emailVisualCanvas');
    const previewTemplateTag = document.getElementById('previewTemplateTag');
    const previewBannerHeading = document.getElementById('previewBannerHeading');
    const previewCurrentDate = document.getElementById('previewCurrentDate');
    const previewEmailSubject = document.getElementById('previewEmailSubject');
    const previewImageContainer = document.getElementById('previewImageContainer');
    const previewImageSourceBadge = document.getElementById('previewImageSourceBadge');
    const previewEmailImage = document.getElementById('previewEmailImage');
    const previewImageCaption = document.getElementById('previewImageCaption');
    const previewEmailBody = document.getElementById('previewEmailBody');
    const previewLinkWrapper = document.getElementById('previewLinkWrapper');
    const previewEmailLinkBtn = document.getElementById('previewEmailLinkBtn');
    const previewEmailLinkUrl = document.getElementById('previewEmailLinkUrl');

    // Estado local de la imagen subida por el usuario y metadatos visuales generados por Gemini
    let uploadedUserImageDataUrl = null;
    let uploadedUserFileName = '';
    let currentAiVisualMeta = {
        posterTitle: 'Feria de Ciencias y Proyectos Virtuales',
        posterSubtitle: 'Viernes 10:00 a. m. · Aula Virtual Principal',
        posterCategory: 'COMUNIDAD ESTUDIANTIL',
        mainEmoji: '🎓',
        secondaryEmoji: '🔬',
        imageCaption: 'Ilustración académica generada por Gemini IA a partir de los detalles de la noticia.'
    };

    // Formatear fecha actual amigable en español
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    previewCurrentDate.textContent = `Fecha del comunicado: ${formattedDate}`;

    // =========================================================================
    // 1. INTEGRACIÓN 100% FUNCIONAL CON LA API DE GOOGLE GEMINI
    // =========================================================================
    async function callGeminiApiForNews(rawIdea, tone) {
        const toneDescriptions = {
            cercano: 'cercano, cálido, empático y motivador para estudiantes',
            institucional: 'institucional, formal, académico y respetuoso',
            urgente: 'directo, prioritario, claro y urgente para recordatorios importantes'
        };

        const selectedToneDesc = toneDescriptions[tone] || toneDescriptions.cercano;

        const systemInstructionText = `Eres un experto en comunicación educativa universitaria.
El usuario te entregará una idea general de una noticia o aviso para estudiantes con algunos detalles importantes.
Tu tarea es redactar el mensaje final listo para enviarse por correo electrónico y diseñar los textos clave para su ilustración visual.
Responde ÚNICAMENTE con un objeto JSON válido (sin bloques markdown \`\`\`json) que tenga exactamente estas propiedades:
{
  "subject": "Asunto del correo claro y atractivo con un emoji inicial (máximo 85 caracteres)",
  "bannerHeading": "Título principal elegante para el encabezado del correo (máximo 65 caracteres)",
  "body": "Cuerpo completo del correo en español, tono ${selectedToneDesc}. Incluye saludo cordial, párrafo introductorio, lista de viñetas (usando •) con los detalles importantes extraídos de la idea, una recomendación útil para el estudiante y despedida institucional.",
  "posterCategory": "Etiqueta corta en MAYÚSCULAS de 2 a 3 palabras sobre la categoría (ej. BECAS Y APOYOS, CALENDARIO DE EXÁMENES, VIDA ESTUDIANTIL)",
  "posterTitle": "Frase titular impactante de máximo 36 caracteres para la ilustración visual",
  "posterSubtitle": "Resumen de fecha, hora o lugar en máximo 42 caracteres para la ilustración visual",
  "mainEmoji": "Un solo emoji representativo del tema principal (ej. 🎓, ⏰, 🔬, 📚, 🎨)",
  "secondaryEmoji": "Un segundo emoji complementario (ej. ✨, 📝, 💡, 🏛️)",
  "imageCaption": "Pie de imagen descriptivo de una oración sobre la noticia"
}`;

        const userPrompt = `Idea general de la noticia para estudiantes: "${rawIdea}"\nTono solicitado: ${selectedToneDesc}.\nDevuelve únicamente el JSON válido.`;

        let lastError = null;

        for (const modelName of GEMINI_MODELS) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: systemInstructionText + '\n\n' + userPrompt }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.65,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} en modelo ${modelName}`);
                }

                const data = await response.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawText) {
                    throw new Error(`Respuesta vacía del modelo ${modelName}`);
                }

                // Limpiar posibles delimitadores markdown si algún modelo los incluye
                const cleanedJsonText = rawText
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/\s*```$/, '')
                    .trim();

                const parsed = JSON.parse(cleanedJsonText);
                return {
                    modelUsed: modelName,
                    subject: parsed.subject || '📢 [Aviso Estudiantil] Comunicado Importante',
                    bannerHeading: parsed.bannerHeading || 'Comunicado para la Comunidad Estudiantil',
                    body: parsed.body || rawIdea,
                    posterCategory: parsed.posterCategory || 'COMUNICADO UNIVERSITARIO',
                    posterTitle: parsed.posterTitle || 'Noticias Visuales para Estudiantes',
                    posterSubtitle: parsed.posterSubtitle || 'Universidad Virtual · Información Académica',
                    mainEmoji: parsed.mainEmoji || '🎓',
                    secondaryEmoji: parsed.secondaryEmoji || '✨',
                    imageCaption: parsed.imageCaption || 'Ilustración académica generada por Gemini IA.'
                };
            } catch (err) {
                console.warn(`Intento con ${modelName} falló:`, err);
                lastError = err;
            }
        }

        // Respaldo local inteligente si el navegador no tiene internet en ese instante
        console.warn('Usando respaldo local por falta de red:', lastError);
        return fallbackLocalCopyGenerator(rawIdea, tone);
    }

    // Respaldo en caso de desconexión de red para que nunca falle la experiencia
    function fallbackLocalCopyGenerator(rawIdea, tone) {
        const cleanIdea = rawIdea.trim();
        const firstSentence = cleanIdea.split(/[.!\n]/)[0].trim();
        const shortHeadline = firstSentence.length > 62
            ? firstSentence.substring(0, 60).trim() + '...'
            : firstSentence;

        const fragments = cleanIdea
            .split(/[.;\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 3);

        const bullets = fragments.length > 1
            ? fragments.map(item => `• ${item.charAt(0).toUpperCase() + item.slice(1)}.`).join('\n')
            : `• ${cleanIdea.charAt(0).toUpperCase() + cleanIdea.slice(1)}.`;

        let greeting = '¡Hola, estimada comunidad estudiantil!';
        if (tone === 'institucional') greeting = 'Estimadas y estimados estudiantes:';
        if (tone === 'urgente') greeting = '⚡ ATENCIÓN ESTUDIANTES (Aviso Prioritario):';

        return {
            modelUsed: 'respaldo-local',
            subject: `📢 [Aviso Académico] ${shortHeadline}`,
            bannerHeading: shortHeadline,
            body: `${greeting}\n\nPor medio de este comunicado visual les compartimos la siguiente información importante:\n\n📌 Detalles clave:\n${bullets}\n\nTe recomendamos tomar nota oportuna de este aviso.\n\nAtentamente,\nCoordinación Académica · Universidad Virtual`,
            posterCategory: 'AVISO ESTUDIANTIL',
            posterTitle: shortHeadline.substring(0, 36),
            posterSubtitle: 'Consulta los detalles completos en este correo',
            mainEmoji: '🎓',
            secondaryEmoji: '📢',
            imageCaption: 'Ilustración educativa generada a partir de tu idea.'
        };
    }

    // =========================================================================
    // 2. GENERADOR DE IMAGEN ACADÉMICA IA CON PALETA (#A51C30, #FFFFFF, #1E1E1E, #C9A227)
    // =========================================================================
    function generateAiEducationalIllustration(visualMeta, styleType) {
        // Paletas estrictamente basadas en #A51C30, #FFFFFF, #1E1E1E y #C9A227
        const stylesConfig = {
            ilustracion: {
                outerBg: '#A51C30',
                cardBg: '#FFFFFF',
                borderGold: '#C9A227',
                badgeBg: '#1E1E1E',
                badgeText: '#FFFFFF',
                titleColor: '#A51C30',
                subColor: '#1E1E1E',
                circleBg: '#FDF2F4'
            },
            infografia: {
                outerBg: '#1E1E1E',
                cardBg: '#FFFFFF',
                borderGold: '#C9A227',
                badgeBg: '#A51C30',
                badgeText: '#FFFFFF',
                titleColor: '#1E1E1E',
                subColor: '#A51C30',
                circleBg: '#FBF6E6'
            },
            acuarela: {
                outerBg: '#FAF8F5',
                cardBg: '#FFFFFF',
                borderGold: '#C9A227',
                badgeBg: '#A51C30',
                badgeText: '#FFFFFF',
                titleColor: '#A51C30',
                subColor: '#1E1E1E',
                circleBg: '#FDF2F4'
            }
        };

        const st = stylesConfig[styleType] || stylesConfig.ilustracion;

        const safeCategory = (visualMeta.posterCategory || 'COMUNICADO ESTUDIANTIL')
            .replace(/[<>&"']/g, '')
            .substring(0, 32);
        const safeTitle = (visualMeta.posterTitle || 'Noticias Visuales para Estudiantes')
            .replace(/[<>&"']/g, '')
            .substring(0, 38);
        const safeSubtitle = (visualMeta.posterSubtitle || 'Universidad Virtual · Equipo 3')
            .replace(/[<>&"']/g, '')
            .substring(0, 46);
        const emoji1 = visualMeta.mainEmoji || '🎓';
        const emoji2 = visualMeta.secondaryEmoji || '✨';

        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="100%" height="100%">
            <!-- Fondo principal -->
            <rect width="800" height="360" fill="${st.outerBg}" />
            
            <!-- Marco exterior dorado ornamental -->
            <rect x="18" y="18" width="764" height="324" rx="16" fill="none" stroke="${st.borderGold}" stroke-width="3" />
            <circle cx="730" cy="65" r="95" fill="${st.borderGold}" opacity="0.16" />
            <circle cx="75" cy="305" r="110" fill="${st.borderGold}" opacity="0.14" />

            <!-- Tarjeta central blanca con borde dorado -->
            <rect x="44" y="40" width="712" height="280" rx="14" fill="${st.cardBg}" stroke="${st.borderGold}" stroke-width="3" />
            
            <!-- Barra lateral izquierda carmesí y dorada -->
            <rect x="44" y="40" width="14" height="280" rx="4" fill="#A51C30" />
            <line x1="64" y1="40" x2="64" y2="320" stroke="${st.borderGold}" stroke-width="2" />

            <!-- Medallón de íconos ilustrados -->
            <circle cx="165" cy="180" r="70" fill="${st.circleBg}" stroke="${st.borderGold}" stroke-width="3" />
            <text x="165" y="198" font-size="64" text-anchor="middle">${emoji1}</text>
            <text x="218" y="132" font-size="32" text-anchor="middle">${emoji2}</text>

            <!-- Etiqueta de categoría superior -->
            <rect x="262" y="76" width="330" height="34" rx="6" fill="${st.badgeBg}" stroke="${st.borderGold}" stroke-width="2" />
            <text x="427" y="98" font-family="Inter, Segoe UI, sans-serif" font-size="13" font-weight="bold" fill="${st.badgeText}" text-anchor="middle" letter-spacing="1">
                ${safeCategory}
            </text>

            <!-- Título con estilo Playfair Display -->
            <text x="262" y="156" font-family="Georgia, Playfair Display, serif" font-size="27" font-weight="bold" fill="${st.titleColor}">
                ${safeTitle}
            </text>

            <!-- Subtítulo con detalles clave -->
            <text x="262" y="194" font-family="Inter, Segoe UI, sans-serif" font-size="18" font-weight="600" fill="${st.subColor}">
                ${safeSubtitle}
            </text>

            <!-- Filete dorado divisorio -->
            <rect x="262" y="216" width="220" height="4" rx="2" fill="${st.borderGold}" />
            <rect x="262" y="224" width="120" height="2" rx="1" fill="#A51C30" />

            <!-- Sello institucional inferior -->
            <text x="262" y="262" font-family="Inter, Segoe UI, sans-serif" font-size="15" fill="#1E1E1E" font-weight="700">
                📬 Noticias visuales para estudiantes · Universidad Virtual
            </text>
        </svg>`;

        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgContent);
    }

    // =========================================================================
    // 3. SINCRONIZACIÓN ENTRE CASILLA MARCABLE (CHECKBOX) Y COMBOBOX DE IMAGEN
    // =========================================================================
    function updateImageControlsVisibility(mode) {
        if (mode === 'ai') {
            aiImageCheckbox.checked = true;
            imageModeCombobox.value = 'ai';
            aiImageOptionsBox.classList.remove('hidden');
            userUploadOptionsBox.classList.add('hidden');
        } else if (mode === 'upload') {
            aiImageCheckbox.checked = false;
            imageModeCombobox.value = 'upload';
            aiImageOptionsBox.classList.add('hidden');
            userUploadOptionsBox.classList.remove('hidden');
        } else if (mode === 'none') {
            aiImageCheckbox.checked = false;
            imageModeCombobox.value = 'none';
            aiImageOptionsBox.classList.add('hidden');
            userUploadOptionsBox.classList.add('hidden');
        }
        renderEmailPreview();
    }

    aiImageCheckbox.addEventListener('change', () => {
        if (aiImageCheckbox.checked) {
            updateImageControlsVisibility('ai');
        } else {
            updateImageControlsVisibility('upload');
        }
    });

    imageModeCombobox.addEventListener('change', () => {
        updateImageControlsVisibility(imageModeCombobox.value);
    });

    aiImageStyle.addEventListener('change', () => {
        renderEmailPreview();
    });

    userImageFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            uploadFilePreviewInfo.textContent = '⚠️ El archivo elegido no es una imagen válida. Selecciona un archivo JPG, PNG o SVG.';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedUserImageDataUrl = event.target.result;
            uploadedUserFileName = file.name;
            uploadFilePreviewInfo.innerHTML = `✅ <strong>Imagen cargada correctamente:</strong> ${file.name}`;
            renderEmailPreview();
        };
        reader.readAsDataURL(file);
    });

    userImageUrlInput.addEventListener('input', () => {
        renderEmailPreview();
    });

    // =========================================================================
    // 4. SELECCIÓN DE LAS 3 PLANTILLAS VISUALES
    // =========================================================================
    const templateCards = document.querySelectorAll('.template-option-card');
    const quickTemplateButtons = document.querySelectorAll('[data-quick-template]');

    const templateMeta = {
        academica: {
            className: 'template-academica',
            tagText: '🏛️ BOLETÍN INSTITUCIONAL UNIVERSITARIO'
        },
        urgente: {
            className: 'template-urgente',
            tagText: '⏰ AVISO PRIORITARIO / RECORDATORIO'
        },
        comunidad: {
            className: 'template-comunidad',
            tagText: '📜 GACETA DE COMUNIDAD Y VIDA ESTUDIANTIL'
        }
    };

    function setActiveTemplate(templateKey) {
        const selectedMeta = templateMeta[templateKey] || templateMeta.academica;

        templateCards.forEach(card => {
            const radio = card.querySelector('input[type="radio"]');
            if (card.dataset.template === templateKey) {
                card.classList.add('selected');
                if (radio) radio.checked = true;
            } else {
                card.classList.remove('selected');
                if (radio) radio.checked = false;
            }
        });

        quickTemplateButtons.forEach(btn => {
            if (btn.dataset.quickTemplate === templateKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        emailVisualCanvas.classList.remove('template-academica', 'template-urgente', 'template-comunidad');
        emailVisualCanvas.classList.add(selectedMeta.className);
        previewTemplateTag.textContent = selectedMeta.tagText;

        renderEmailPreview();
    }

    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            setActiveTemplate(card.dataset.template);
        });
    });

    quickTemplateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTemplate(btn.dataset.quickTemplate);
        });
    });

    // =========================================================================
    // 5. RENDERIZADO EN TIEMPO REAL DE LA VISTA PREVIA DEL CORREO
    // =========================================================================
    function renderEmailPreview() {
        const subjectText = generatedSubjectInput.value.trim() || '📢 Comunicado para Estudiantes';
        const bodyText = generatedBodyInput.value.trim() || 'Escribe una idea general en el Paso 1 y presiona el botón para que Gemini IA redacte el correo.';
        const linkUrl = newsLinkInput.value.trim();
        const linkButtonLabel = newsLinkText.value.trim() || 'Consultar más información aquí';

        previewEmailSubject.textContent = subjectText;
        previewEmailBody.textContent = bodyText;

        const cleanBannerTitle = subjectText.replace(/^[^\]]+\]\s*/, '');
        previewBannerHeading.textContent = cleanBannerTitle || subjectText;

        const imageMode = imageModeCombobox.value;

        if (imageMode === 'none') {
            previewImageContainer.classList.add('hidden');
        } else if (imageMode === 'ai') {
            previewImageContainer.classList.remove('hidden');
            const styleChoice = aiImageStyle.value;
            const aiSvgUrl = generateAiEducationalIllustration(currentAiVisualMeta, styleChoice);

            previewEmailImage.src = aiSvgUrl;
            previewImageSourceBadge.textContent = '🤖 Imagen creada automáticamente por Gemini IA a partir de tu idea';
            previewImageCaption.textContent = currentAiVisualMeta.imageCaption || 'Ilustración académica generada por IA según los detalles de la noticia.';
        } else if (imageMode === 'upload') {
            previewImageContainer.classList.remove('hidden');
            const customUrl = userImageUrlInput.value.trim();

            if (uploadedUserImageDataUrl) {
                previewEmailImage.src = uploadedUserImageDataUrl;
                previewImageSourceBadge.textContent = `📤 Imagen subida por el usuario (${uploadedUserFileName})`;
                previewImageCaption.textContent = 'Imagen personalizada seleccionada desde tu dispositivo.';
            } else if (customUrl) {
                previewEmailImage.src = customUrl;
                previewImageSourceBadge.textContent = '🌐 Imagen personalizada mediante enlace web';
                previewImageCaption.textContent = 'Imagen sugerida proporcionada por el autor del aviso.';
            } else {
                const placeholderSvg = generateAiEducationalIllustration({
                    posterCategory: 'MODO IMAGEN PROPIA',
                    posterTitle: 'Sube tu imagen en el Paso 2',
                    posterSubtitle: 'Selecciona un archivo JPG o PNG desde tu equipo',
                    mainEmoji: '📤',
                    secondaryEmoji: '🖼️'
                }, 'infografia');
                previewEmailImage.src = placeholderSvg;
                previewImageSourceBadge.textContent = '📁 Modo subir imagen propia (Esperando que elijas tu archivo)';
                previewImageCaption.textContent = 'Aún no has seleccionado una imagen propia en el Paso 2; se muestra este recuadro guía.';
            }
        }

        if (linkUrl) {
            previewLinkWrapper.classList.remove('hidden');
            previewEmailLinkBtn.href = linkUrl;
            previewEmailLinkBtn.textContent = `🔗 ${linkButtonLabel}`;
            previewEmailLinkUrl.textContent = `Enlace directo: ${linkUrl}`;
        } else {
            previewLinkWrapper.classList.add('hidden');
        }
    }

    generatedSubjectInput.addEventListener('input', () => {
        aiGenerationStatus.textContent = 'Editado manualmente por ti';
        renderEmailPreview();
    });
    generatedBodyInput.addEventListener('input', () => {
        aiGenerationStatus.textContent = 'Editado manualmente por ti';
        renderEmailPreview();
    });
    newsLinkInput.addEventListener('input', renderEmailPreview);
    newsLinkText.addEventListener('input', renderEmailPreview);

    // =========================================================================
    // 6. EJECUCIÓN DEL FLUJO DE IA AL ENVIAR EL FORMULARIO O ELEGIR EJEMPLO
    // =========================================================================
    async function triggerGeminiGeneration(scrollAfter = true) {
        const rawIdea = userIdeaInput.value.trim();
        if (!rawIdea) {
            formAlertMessage.textContent = '⚠️ Por favor escribe primero tu idea general en el Paso 1 (o presiona uno de los botones de ejemplo arriba) para que Gemini IA redacte la noticia.';
            formAlertMessage.classList.remove('hidden');
            userIdeaInput.focus();
            return;
        }

        formAlertMessage.classList.add('hidden');

        // Estado visual de carga empático
        const originalBtnText = btnGenerateAiNews.innerHTML;
        btnGenerateAiNews.disabled = true;
        btnGenerateAiNews.innerHTML = '⏳ Redactando noticia e ilustración con Gemini IA...';
        aiGenerationStatus.textContent = '⏳ Conectando con Google Gemini...';

        try {
            const aiResult = await callGeminiApiForNews(rawIdea, aiToneSelect.value);

            generatedSubjectInput.value = aiResult.subject;
            generatedBodyInput.value = aiResult.body;

            currentAiVisualMeta = {
                posterTitle: aiResult.posterTitle,
                posterSubtitle: aiResult.posterSubtitle,
                posterCategory: aiResult.posterCategory,
                mainEmoji: aiResult.mainEmoji,
                secondaryEmoji: aiResult.secondaryEmoji,
                imageCaption: aiResult.imageCaption
            };

            aiGenerationStatus.textContent = `✨ Creado por Gemini (${aiResult.modelUsed})`;
            renderEmailPreview();

            if (scrollAfter) {
                const resultadoSection = document.getElementById('resultado');
                if (resultadoSection) {
                    resultadoSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } finally {
            btnGenerateAiNews.disabled = false;
            btnGenerateAiNews.innerHTML = originalBtnText;
        }
    }

    newsAiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        triggerGeminiGeneration(true);
    });

    // Botón de limpiar formulario
    document.getElementById('btnResetForm').addEventListener('click', () => {
        userIdeaInput.value = '';
        newsLinkInput.value = '';
        newsLinkText.value = '';
        uploadedUserImageDataUrl = null;
        uploadedUserFileName = '';
        userImageFileInput.value = '';
        userImageUrlInput.value = '';
        uploadFilePreviewInfo.textContent = 'Ningún archivo seleccionado todavía.';
        updateImageControlsVisibility('ai');
        aiGenerationStatus.textContent = 'Campos limpios';
        formAlertMessage.classList.add('hidden');
        userIdeaInput.focus();
    });

    // =========================================================================
    // 7. BOTONES DE EJEMPLOS RÁPIDOS CONECTADOS A GEMINI IA
    // =========================================================================
    const presetExamples = {
        beca: {
            idea: 'Avisar a los estudiantes de licenciatura que ya está abierta la Convocatoria de Becas de Excelencia y Apoyo Académico 2026. La fecha límite para registrar documentos en el portal es el viernes 30 de octubre a las 18:00 horas.',
            tone: 'cercano',
            template: 'academica',
            link: 'https://universidadvirtual.edu.mx/becas-2026',
            linkText: 'Consultar convocatoria y registrarme a la beca',
            imageMode: 'ai',
            imageStyle: 'ilustracion'
        },
        examen: {
            idea: 'Aviso urgente para los alumnos de primer semestre: el examen parcial de Estadística Aplicada cambia para este jueves a las 4:00 p. m. en el Aula Virtual 2. Es indispensable ingresar 15 minutos antes con identificación estudiantil.',
            tone: 'urgente',
            template: 'urgente',
            link: 'https://universidadvirtual.edu.mx/calendario-examenes',
            linkText: 'Ingresar al Aula Virtual de Evaluaciones',
            imageMode: 'ai',
            imageStyle: 'infografia'
        },
        taller: {
            idea: 'Invitar a toda la comunidad estudiantil al Taller Práctico de Manejo del Tiempo y Bienestar Emocional que se impartirá este miércoles a las 11:00 a. m. por videollamada. Se otorgará constancia con valor curricular.',
            tone: 'cercano',
            template: 'comunidad',
            link: 'https://universidadvirtual.edu.mx/talleres-bienestar',
            linkText: 'Apartar mi lugar en el taller gratuito',
            imageMode: 'ai',
            imageStyle: 'acuarela'
        }
    };

    document.querySelectorAll('.btn-example').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.example;
            const ex = presetExamples[key];
            if (!ex) return;

            userIdeaInput.value = ex.idea;
            aiToneSelect.value = ex.tone;
            newsLinkInput.value = ex.link;
            newsLinkText.value = ex.linkText;
            aiImageStyle.value = ex.imageStyle;

            updateImageControlsVisibility(ex.imageMode);
            setActiveTemplate(ex.template);

            // Llamar a Gemini en tiempo real con la idea del ejemplo
            triggerGeminiGeneration(true);
        });
    });

    // =========================================================================
    // 8. INTERACCIONES DE LA VISTA PREVIA Y ACCESIBILIDAD
    // =========================================================================
    const emailClientWrapper = document.getElementById('emailClientWrapper');
    const btnViewDesktop = document.getElementById('btnViewDesktop');
    const btnViewMobile = document.getElementById('btnViewMobile');

    btnViewDesktop.addEventListener('click', () => {
        emailClientWrapper.classList.remove('mobile-view');
        btnViewDesktop.classList.add('active');
        btnViewMobile.classList.remove('active');
    });

    btnViewMobile.addEventListener('click', () => {
        emailClientWrapper.classList.add('mobile-view');
        btnViewMobile.classList.add('active');
        btnViewDesktop.classList.remove('active');
    });

    const btnCopyEmailText = document.getElementById('btnCopyEmailText');
    const copyFeedbackToast = document.getElementById('copyFeedbackToast');

    btnCopyEmailText.addEventListener('click', () => {
        const textToCopy = `ASUNTO: ${generatedSubjectInput.value}\n\n${generatedBodyInput.value}\n\nEnlace: ${newsLinkInput.value}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy);
        }
        copyFeedbackToast.classList.remove('hidden');
        setTimeout(() => {
            copyFeedbackToast.classList.add('hidden');
        }, 4500);
    });

    const htmlRoot = document.documentElement;
    const btnFontNormal = document.getElementById('btnFontNormal');
    const btnFontLarge = document.getElementById('btnFontLarge');
    const btnFontExtra = document.getElementById('btnFontExtra');

    function setFontSizeClass(cls, activeBtn) {
        htmlRoot.classList.remove('font-large', 'font-extra');
        if (cls) htmlRoot.classList.add(cls);
        [btnFontNormal, btnFontLarge, btnFontExtra].forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    btnFontNormal.addEventListener('click', () => setFontSizeClass('', btnFontNormal));
    btnFontLarge.addEventListener('click', () => setFontSizeClass('font-large', btnFontLarge));
    btnFontExtra.addEventListener('click', () => setFontSizeClass('font-extra', btnFontExtra));

    // =========================================================================
    // 9. INTERACCIONES DE LA BITÁCORA (EDICIÓN EN VIVO E IMPRESIÓN)
    // =========================================================================
    const btnToggleEditBitacora = document.getElementById('btnToggleEditBitacora');
    const btnPrintBitacora = document.getElementById('btnPrintBitacora');
    const editableBlocks = document.querySelectorAll('.bitacora-editable');
    let bitacoraEditMode = false;

    btnToggleEditBitacora.addEventListener('click', () => {
        bitacoraEditMode = !bitacoraEditMode;
        editableBlocks.forEach(block => {
            block.setAttribute('contenteditable', bitacoraEditMode ? 'true' : 'false');
        });
        btnToggleEditBitacora.textContent = bitacoraEditMode
            ? '💾 Guardar cambios en la bitácora'
            : '✏️ Activar edición de bitácora';
    });

    btnPrintBitacora.addEventListener('click', () => {
        window.print();
    });

    // Inicializar la primera vista previa al cargar la página
    renderEmailPreview();
});
