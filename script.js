document.addEventListener("DOMContentLoaded", () => {
    const userEmailInput = document.getElementById("userEmail");
    const creditInfo = document.getElementById("creditInfo");
    const generateButton = document.getElementById("generateButton");
    const buyButtons = document.querySelectorAll(".buy-button");

    let credits = 0;
    let selectedStyle = "Fotorealista";

    // Seleção de estilo
    const styleButtons = document.querySelectorAll(".style-button");
    styleButtons.forEach(button => {
        button.addEventListener("click", e => {
            styleButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            selectedStyle = e.target.dataset.style;
        });
    });

    // Buscar créditos do usuário
    async function loadCredits() {
        const email = userEmailInput.value.trim();
        if (!email) return;

        try {
            const res = await fetch("/api/credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            credits = data.credits || 0;

            creditInfo.textContent = `Créditos: ${credits}`;

            if (credits <= 0) {
                generateButton.disabled = true;
                generateButton.textContent = "Sem créditos - Comprar plano";
                generateButton.classList.add("no-credits");
            } else {
                generateButton.disabled = false;
                generateButton.textContent = "Gerar Imagem";
                generateButton.classList.remove("no-credits");
            }
        } catch (e) {
            console.error('Erro ao carregar créditos', e);
            creditInfo.textContent = 'Erro ao carregar créditos';
        }
    }

    userEmailInput.addEventListener("input", debounce(loadCredits, 500));

    // CLICK NO BOTÃO DE GERAR
    generateButton.addEventListener("click", async () => {
        if (credits <= 0) {
            document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
            return;
        }

        const prompt = document.getElementById("userInput").value.trim();
        if (!prompt) return alert("Digite uma ideia.");

        const professional = `masterpiece, ultra detailed, ${selectedStyle}, ${prompt}`;

        document.getElementById("outputPrompt").value = professional;

        document.getElementById("resultArea").classList.remove("hidden");
        document.getElementById("loader").classList.remove("hidden");
        document.getElementById("imageContainer").classList.add("hidden");

        const email = userEmailInput.value.trim();

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: professional, email })
            });

            const data = await response.json();

            document.getElementById("loader").classList.add("hidden");

            if (data.error) {
                alert(data.error);
                return;
            }

            document.getElementById("generatedImage").src = data.imageUrl;
            document.getElementById("imageContainer").classList.remove("hidden");

            credits = data.credits;
            creditInfo.textContent = `Créditos: ${credits}`;

            if (credits <= 0) {
                generateButton.disabled = true;
                generateButton.textContent = "Sem créditos - Comprar plano";
                setTimeout(() => {
                    document.getElementById("plans").scrollIntoView({ behavior: "smooth" });
                }, 800);
            }
        } catch (e) {
            document.getElementById("loader").classList.add("hidden");
            alert('Erro ao gerar imagem: ' + (e.message || e));
        }
    });

    // Copiar prompt
    document.getElementById("copyButton").addEventListener("click", () => {
        const text = document.getElementById("outputPrompt");
        text.select();
        document.execCommand("copy");
    });

    // BOTÕES DE COMPRA
    buyButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const plan = btn.dataset.plan;
            const email = userEmailInput.value.trim();

            if (!email) return alert("Digite seu email para comprar.");

            try {
                const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan, email })
                });

                const data = await res.json();

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    alert("Erro: " + (data.error || 'checkout'));
                }
            } catch (e) {
                console.error('Erro iniciando checkout', e);
                alert('Erro ao iniciar checkout');
            }
        });
    });

    // debounce helper
    function debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }
});
