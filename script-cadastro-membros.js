// Configuração do Supabase (A mesma do seu arquivo original)
const SUPABASE_URL = 'https://gpkttmdgaqqmulfafwby.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwa3R0bWRnYXFxbXVsZmFmd2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjQxMzcsImV4cCI6MjA3OTA0MDEzN30.tmR47AlfULF88eDjiQRCVBOk8TUskcv2Vk7CbDck--A';

// Inicializa o cliente
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais para controle
let cropper = null;
let croppedBlob = null

document.addEventListener('DOMContentLoaded', function () {
    console.log("Sistema de Cadastro Iniciado");

    setupStepperForm();
    setupMasks();
    setupCepSearch();
    setupPhotoUpload();
    setupRequiredFieldAsterisks();
    setupDependentesLogic();
    setupAutoScroll();
    setupFormSubmission();

    // Lógica condicional simples
    setupConditionals();
    setupRealTimeValidation();
    setupClearButtons();
    setupDateColors();
    setupMagicButton();
});

// --- FUNÇÕES DE UI E MÁSCARAS ---

function setupStepperForm() {
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const formSteps = document.querySelectorAll('.form-step');
    const stepsIndicators = document.querySelectorAll('.stepper .step');
    const progressBar = document.querySelector('.stepper .progress-bar');

    let currentStep = 0;

    const updateFormSteps = () => {
        // Atualiza a exibição das etapas (Show/Hide)
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });

        // Atualiza as bolinhas do topo
        stepsIndicators.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentStep) step.classList.add('completed');
            if (index === currentStep) step.classList.add('active');
        });

        // Atualiza a barra de progresso laranja
        if (progressBar) {
            progressBar.style.width = `${(currentStep / (stepsIndicators.length - 1)) * 100}%`;
        }

        // Rola suavemente para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Botão "Próximo" (Mantém a validação)
    nextBtns.forEach(button => {
        button.addEventListener('click', () => {
            const currentStepEl = formSteps[currentStep];
            const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredInputs.forEach(input => {
                // Verifica se está vazio e se o campo está visível
                if (!input.value.trim() && input.offsetParent !== null) {
                    isValid = false;
                    input.style.borderColor = 'red';
                    input.addEventListener('input', function () {
                        this.style.borderColor = '#e5e7eb';
                    }, { once: true });
                }
            });

            if (isValid) {
                if (currentStep < formSteps.length - 1) {
                    currentStep++;
                    updateFormSteps();
                }
            } else {
                alert("Por favor, preencha todos os campos obrigatórios desta etapa.");
            }
        });
    });

    // Botão "Anterior"
    prevBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateFormSteps();
            }
        });
    });

    // --- A MUDANÇA ESTÁ AQUI ---
    // Lógica de clique nas bolinhas do topo
    stepsIndicators.forEach((step, index) => {
        step.addEventListener('click', () => {
            // Removemos o 'if (index < currentStep)'
            // Agora permite clicar em qualquer bolinha para navegar

            // Opcional: Se você quiser validar antes de pular para frente, descomente o bloco abaixo:
            /*
            if (index > currentStep) {
                // Verifica a etapa atual antes de deixar avançar
                const currentStepEl = formSteps[currentStep];
                const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required]');
                let isValid = true;
                 requiredInputs.forEach(input => {
                    if (!input.value.trim() && input.offsetParent !== null) isValid = false;
                });
                if (!isValid) {
                    alert("Preencha os dados atuais antes de avançar.");
                    return; 
                }
            }
            */

            currentStep = index;
            updateFormSteps();
        });
    });
}

function setupMasks() {
    // Telefone
    const phoneInputs = ['telefone1', 'telefone2'];
    phoneInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                if (value.length > 10) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else if (value.length > 5) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                }
                e.target.value = value;
            });
        }
    });

    // CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            e.target.value = value;
        });
    }

    // CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
            e.target.value = value;
        });
    }
}

function setupCepSearch() {
    const cepInput = document.getElementById('cep');
    if (!cepInput) return;

    cepInput.addEventListener('blur', async function () {
        const cep = this.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                document.getElementById('rua').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
                document.getElementById('numero').focus();
            } else {
                alert("CEP não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        }
    });
}

function setupRequiredFieldAsterisks() {
    const requiredFields = document.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        const id = field.id;
        let label;

        // --- CORREÇÃO AQUI ---
        // Se for o campo de foto, forçamos o código a pegar o label de TEXTO ('photo-upload-label')
        // em vez do label do círculo ('photo-preview').
        if (id === 'photo-input') {
            label = document.getElementById('photo-upload-label');
        } else {
            // Para todos os outros campos, segue o comportamento padrão
            label = document.querySelector(`label[for="${id}"]`);
        }
        // ---------------------

        if (label && !label.querySelector('.required-asterisk')) {
            label.innerHTML += ' <span class="required-asterisk">*</span>';
        }
    });
}

function setupConditionals() {
    // --- Lógica para Estado Civil -> Cônjuge ---
    const estadoCivil = document.getElementById('estadoCivil');
    const dadosConjugeDiv = document.getElementById('dadosConjuge');

    // Inputs que se tornam obrigatórios se for casado
    const nomeConjuge = document.getElementById('nomeConjuge');
    const conjugeMembro = document.getElementById('conjugeMembro');
    const dataCasamento = document.getElementById('dataCasamento');

    // Função que verifica e troca a visibilidade
    const toggleConjuge = () => {
        if (estadoCivil.value === 'casado') {
            // Mostra os campos
            dadosConjugeDiv.style.display = 'grid';

            // Torna obrigatório (Opcional, se você quiser que seja)
            // Se não quiser obrigatório, remova as linhas abaixo
            nomeConjuge.required = true;
            conjugeMembro.required = true;
            dataCasamento.required = true;
        } else {
            // Esconde os campos
            dadosConjugeDiv.style.display = 'none';

            // Remove obrigatoriedade e limpa valores (opcional)
            nomeConjuge.required = false;
            conjugeMembro.required = false;
            dataCasamento.required = false;

            // Opcional: Limpar os campos ao esconder
            nomeConjuge.value = '';
            conjugeMembro.value = '';
            dataCasamento.value = '';
        }
    };

    // Adiciona o ouvinte de evento para quando mudar a opção
    estadoCivil.addEventListener('change', toggleConjuge);

    // --- Lógica para Empresário (Já existente) ---
    const empresario = document.getElementById('empresario');
    const nomeEmpresaGroup = document.getElementById('nomeEmpresaGroup');
    const nomeEmpresaInput = document.getElementById('nomeEmpresa');

    empresario.addEventListener('change', () => {
        if (empresario.value === 'Sim') {
            nomeEmpresaGroup.style.display = 'block';
            nomeEmpresaInput.required = false;
        } else {
            nomeEmpresaGroup.style.display = 'none';
            nomeEmpresaInput.required = false;
            nomeEmpresaInput.value = '';
        }
    });

    // --- Lógica para Departamentos (Já existente) ---
    const serve = document.getElementById('serveDepartamento');
    const deptosAtuais = document.getElementById('departamentosAtuais');
    serve.addEventListener('change', () => {
        deptosAtuais.style.display = (serve.value === 'sim') ? 'block' : 'none';
    });

    const interesse = document.getElementById('interesseServir');
    const deptosInteresse = document.getElementById('departamentosInteresse');
    interesse.addEventListener('change', () => {
        deptosInteresse.style.display = (interesse.value === 'sim') ? 'block' : 'none';
    });
}

// --- LÓGICA DE FOTO (SIMPLIFICADA) ---

function setupPhotoUpload() {
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const modal = document.getElementById('cropImageModal');
    const imageToCrop = document.getElementById('imageToCrop');
    const confirmCropBtn = document.getElementById('confirmCropBtn');
    const closeBtn = document.querySelector('.modal-close-btn');
    const statusMsg = document.getElementById('photo-status-msg');

    photoInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let file = files[0];

        // Conversão de HEIC (iPhone) se necessário
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            statusMsg.textContent = 'Processando imagem...';
            try {
                const conversionResult = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
                file = new File([Array.isArray(conversionResult) ? conversionResult[0] : conversionResult], "photo.jpg", { type: "image/jpeg" });
            } catch (err) {
                console.error("Erro HEIC", err);
                statusMsg.textContent = 'Erro ao processar imagem.';
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
            imageToCrop.src = evt.target.result;
            modal.classList.add('active');

            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move'
            });
        };
        reader.readAsDataURL(file);
    });

    confirmCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ width: 500, height: 500 });
        canvas.toBlob((blob) => {
            croppedBlob = blob;
            const url = URL.createObjectURL(blob);
            photoPreview.style.backgroundImage = `url(${url})`;
            photoPreview.innerHTML = ''; // Remove ícone
            statusMsg.textContent = 'Foto pronta!';
            statusMsg.style.color = 'green';
            modal.classList.remove('active');
        }, 'image/jpeg', 0.8);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        photoInput.value = ''; // Limpa input para permitir selecionar a mesma foto se cancelar
    });
}

// --- FUNÇÕES AUXILIARES DE UPLOAD ---

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function uploadProfilePhoto(blob, memberName, cpf) {
    const safeName = slugify(memberName);
    const safeCpf = cpf.replace(/\D/g, '');
    const fileName = `${safeName}-${safeCpf}.jpg`;

    // Upload para o bucket 'fotos-membros'
    const { data, error } = await supabaseClient
        .storage
        .from('fotos-membros')
        .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

    if (error) {
        console.error("Erro upload:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabaseClient
        .storage
        .from('fotos-membros')
        .getPublicUrl(data.path);

    return publicUrl;
}

function setupFormSubmission() {
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- VALIDAÇÃO INTELIGENTE DE PRECEDÊNCIA (CORRIGIDA) ---

        // 1. Pega o primeiro campo de texto/select inválido
        const invalidField = form.querySelector(':invalid');

        // 2. Verifica se a foto está faltando
        const isPhotoMissing = !croppedBlob;
        const photoSection = document.getElementById('photo-upload-section');

        let elementToFocus = null;
        let errorType = ''; // 'field' ou 'photo'

        // 3. Lógica de Decisão: Quem vem primeiro?
        if (invalidField && isPhotoMissing) {
            // Verifica a posição no documento
            if (invalidField.compareDocumentPosition(photoSection) & Node.DOCUMENT_POSITION_FOLLOWING) {
                // Se o invalidField for o próprio input de arquivo (que está hidden), trata como erro de foto
                if (invalidField.id === 'photo-input') {
                    elementToFocus = photoSection;
                    errorType = 'photo';
                } else {
                    elementToFocus = invalidField;
                    errorType = 'field';
                }
            } else {
                elementToFocus = photoSection;
                errorType = 'photo';
            }
        } else if (invalidField) {
            // --- CORREÇÃO AQUI ---
            // Se o campo inválido for o input da foto, muda o tipo de erro para 'photo'
            if (invalidField.id === 'photo-input') {
                elementToFocus = photoSection;
                errorType = 'photo';
            } else {
                elementToFocus = invalidField;
                errorType = 'field';
            }
        } else if (isPhotoMissing) {
            elementToFocus = photoSection;
            errorType = 'photo';
        }

        // 4. Se houver algum erro, executa o direcionamento
        if (elementToFocus) {
            // Descobre em qual etapa o elemento está
            const stepParent = elementToFocus.closest('.form-step');
            const allSteps = Array.from(document.querySelectorAll('.form-step'));
            const stepIndex = allSteps.indexOf(stepParent);

            // Navega para a etapa correta
            if (stepIndex !== -1) {
                const stepperBtn = document.querySelectorAll('.stepper .step')[stepIndex];
                if (stepperBtn) stepperBtn.click();
            }

            // Aguarda a transição da etapa e foca/rola
            setTimeout(() => {
                elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });

                if (errorType === 'photo') {
                    const preview = document.getElementById('photo-preview');
                    preview.style.borderColor = 'red';
                    preview.style.boxShadow = '0 0 10px rgba(255,0,0,0.3)';
                    alert("A foto é obrigatória! Por favor, adicione uma foto.");
                    setTimeout(() => {
                        preview.style.borderColor = '#e5e7eb';
                        preview.style.boxShadow = 'none';
                    }, 3000);
                } else {
                    elementToFocus.focus();
                    // Efeito visual no campo
                    elementToFocus.style.borderColor = 'red';
                    // Efeito de tremer
                    elementToFocus.parentElement.style.animation = 'shake 0.5s';
                    setTimeout(() => elementToFocus.parentElement.style.animation = '', 500);

                    // Pega o nome do campo para o alerta
                    const label = elementToFocus.previousElementSibling ? elementToFocus.previousElementSibling.textContent : "campo obrigatório";
                    alert(`Por favor, preencha o campo: ${label.replace('*', '').trim()}`);
                }
            }, 100);

            return; // Interrompe o salvamento
        }

        // --- 5. ENVIO DOS DADOS (Se não houver erros) ---

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            let fotoUrl = null;
            const nome = document.getElementById('fullName').value;
            const cpf = document.getElementById('cpf').value;

            // Upload da Foto
            if (croppedBlob) {
               
                fotoUrl = await uploadProfilePhoto(croppedBlob, nome, cpf);
            }

            // ... (O RESTO DO CÓDIGO DE MONTAGEM DO OBJETO CONTINUA EXATAMENTE IGUAL) ...
            // Mantenha a parte do const getCheckedValues, dependentesArray e const dados...

            // -- COLE AQUI O RESTANTE DO CÓDIGO DA RESPOSTA ANTERIOR --
            // (Vou repetir a parte final apenas para garantir que você saiba onde encaixar)

            const getCheckedValues = (name) => {
                return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                    .map(cb => cb.value).join(', ');
            };

            const dependentesArray = [];
            document.querySelectorAll('.dependente-row').forEach(row => {
                const nomeDep = row.querySelector('.dep-nome').value;
                const nascDep = row.querySelector('.dep-nasc').value;
                if (nomeDep) dependentesArray.push({ nome: nomeDep, data_nascimento: nascDep });
            });

            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };

            const dados = {
                nome_completo: nome,
                data_nascimento: getVal('nascimento'),
                sexo: getVal('sexo'),
                email: getVal('email'),
                cpf: cpf ? cpf.replace(/\D/g, '') : null,
                rg: getVal('rg'),
                orgao_expedidor: getVal('orgaoExpeditor'),
                nacionalidade: getVal('nacionalidade'),
                naturalidade: getVal('naturalidade'),
                cep: getVal('cep') ? getVal('cep').replace(/\D/g, '') : null,
                endereco: getVal('rua'),
                numero: getVal('numero'),
                bairro: getVal('bairro'),
                cidade: getVal('cidade'),
                estado: getVal('estado'),
                telefone_1: getVal('telefone1') ? getVal('telefone1').replace(/\D/g, '') : null,
                whatsapp_1: getVal('whatsapp1'),
                operadora_1: getVal('operadora1'),
                telefone_2: getVal('telefone2') ? getVal('telefone2').replace(/\D/g, '') : null,
                whatsapp_2: getVal('whatsapp2'),
                operadora_2: getVal('operadora2'),
                estado_civil: getVal('estadoCivil'),
                nome_conjuge: getVal('nomeConjuge'),
                data_casamento: getVal('dataCasamento') || null,
                conjuge_membro: getVal('conjugeMembro'),
                dependentes: dependentesArray,
                grau_de_instrucao: getVal('escolaridade'),
                profissao_atividade_comercial: getVal('profissao'),
                e_empresario: getVal('empresario'),
                se_empresario_empresa: getVal('nomeEmpresa'),
                formacao: getVal('cursos'),
                data_conversao: getVal('conversao') || null,
                ja_concluiu_o_discipulado: getVal('concluiuDiscipulado'),
                data_conclusao_discipulado: getVal('dataConclusaoDiscipulado') || null,
                batizado_nas_aguas: getVal('foiBatizadoAguas'),
                tipo_batismo_nas_aguas: getVal('tipoBatismoAguas'),
                data_batismo_aguas: getVal('batismoAguas') || null,
                batismo_espirito_santo: getVal('foiBatizadoEspirito'),
                data_batismo_espirito_santo: getVal('batismoEspirito') || null,
                igreja: getVal('igrejaAtual'),
                igreja_anterior: getVal('igrejaAnterior'),
                ja_cursou_o_rhema: getVal('rhema'),
                q_servir_departamento: getVal('serveDepartamento'),
                r_departamento: getCheckedValues('ministerio_atual'),
                q_departamento: getVal('interesseServir'),
                r_servir_departamento: getCheckedValues('ministerio_interesse'),
                instagram: getVal('instagram'),
                tiktok: getVal('tiktok'),
                facebook: getVal('facebook'),
                habilidades_dons: getVal('habilidades'),
                observacoes: getVal('observacoes'),
                status_membro: 'Ativo',
                foto: fotoUrl
            };

            const { error } = await supabaseClient.from('membros').insert([dados]);

            if (error) throw error;

            // --- AÇÃO DE SUCESSO ATUALIZADA ---

            // 1. Limpa o formulário (dados do input)
            form.reset();

            // 2. Limpa o estado da foto (variável global e visual)
            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview) {
                photoPreview.style.backgroundImage = 'none';
                photoPreview.innerHTML = '<i class="fa-solid fa-camera"></i>';
            }
            croppedBlob = null;

            // MUDANÇA 3: RESTAURA O BOTÃO IMEDIATAMENTE
            // Isso garante que, mesmo atrás do modal, o botão já esteja pronto de novo.
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Cadastro';

            // 3. Exibe o novo modal personalizado
            showSuccessModal();

            // --- FIM DA AÇÃO DE SUCESSO ---

        } catch (error) {
            console.error('Erro detalhado:', error);
            alert('Erro ao salvar: ' + error.message);
            
            // Restaura o botão em caso de erro também
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Cadastro';
        }
    });
}

function setupDependentesLogic() {
    const addBtn = document.getElementById('add-dependente-btn');
    const container = document.getElementById('dependentes-container');

    if (!addBtn || !container) return;

    // Adicionar nova linha
    addBtn.addEventListener('click', () => {
        // 1. RASTREAMENTO: Pega a posição do botão ANTES
        const rectBefore = addBtn.getBoundingClientRect();

        const div = document.createElement('div');
        div.className = 'dependente-row';
        div.style.marginTop = '15px';
        div.style.paddingTop = '15px';
        div.style.borderTop = '1px dashed var(--border-color)';

        // Adicionei uma pequena animação de entrada no CSS inline para ficar mais bonito
        div.style.animation = 'fadeIn 0.5s ease';

        div.innerHTML = `
            <div class="grid-3" style="align-items: flex-end;">
                <div class="input-group" style="margin-bottom: 0;">
                    <label>Nome do Dependente</label>
                    <input type="text" class="dep-nome" placeholder="Nome completo">
                </div>
                <div class="input-group" style="margin-bottom: 0;">
                    <label>Data de Nascimento</label>
                    <input type="date" class="dep-nasc">
                </div>
                <div style="margin-bottom: 0;">
                    <button type="button" class="btn btn-secondary remove-dep-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;

        container.appendChild(div);

        // 2. CÁLCULO: Pega a posição do botão DEPOIS (ele foi empurrado para baixo)
        const rectAfter = addBtn.getBoundingClientRect();

        // 3. DELTA: Calcula o quanto ele desceu
        const difference = rectAfter.top - rectBefore.top;

        // 4. CORREÇÃO SUAVE: Rola a tela para acompanhar o botão
        if (difference > 0) {
            window.scrollBy({
                top: difference,
                behavior: 'smooth' // <--- MUDANÇA AQUI: De 'instant' para 'smooth'
            });
        }
    });

    // Remover linha (Delegação de eventos)
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-dep-btn');
        if (btn) {
            const row = btn.closest('.dependente-row');
            if (row) row.remove();
        }
    });
}

function setupAutoScroll() {
    const form = document.getElementById('signupForm');

    // Usa 'focusin' porque o evento 'focus' não propaga (bubble), mas 'focusin' sim.
    form.addEventListener('focusin', (e) => {
        const target = e.target;

        // Verifica se o elemento focado é um campo de formulário
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {

            // O setTimeout é CRUCIAL em mobile.
            // Ele espera 300ms para o teclado virtual subir totalmente antes de calcular a rolagem.
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center', // Tenta colocar o elemento no MEIO da área visível (acima do teclado)
                    inline: 'nearest'
                });
            }, 400); // 400ms é um tempo seguro para a maioria dos Androids/iPhones
        }
    });
}

// --- FUNÇÕES DE CONTROLE DO MODAL DE SUCESSO ---

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
        // Toca uma vibração suave no celular se suportado (opcional)
        if (navigator.vibrate) navigator.vibrate(200);
    }
}

function hideAndReset() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('active');

    // Recarrega a página para limpar todos os campos e o stepper
    window.location.reload();
}

// Configura os botões do modal
document.addEventListener('DOMContentLoaded', function () {
    const modalNewBtn = document.getElementById('modalNewBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const successModal = document.getElementById('successModal');

    // Botão "Novo Cadastro": Recarrega a página para limpar tudo completamente
    if (modalNewBtn) {
        modalNewBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Botão "Fechar": Apenas esconde o modal
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (successModal) successModal.classList.remove('active');
        });
    }
});

function setupRealTimeValidation() {
    const form = document.getElementById('signupForm');

    // 1. Para campos de Texto, Selects e Textareas
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Função que limpa o estilo de erro
        const clearError = () => {
            // Restaura a cor da borda para o cinza padrão (#e5e7eb é a cor da sua variável CSS)
            input.style.borderColor = '#e5e7eb';

            // Remove animação de tremor se houver
            if (input.parentElement) {
                input.parentElement.style.animation = '';
            }
        };

        // Ocorre quando o usuário digita
        input.addEventListener('input', clearError);

        // Ocorre quando o usuário seleciona uma opção (Select) ou sai do campo
        input.addEventListener('change', clearError);
    });

    // 2. Para a Foto (Caso especial)
    // Quando o usuário escolhe uma nova foto no input ou confirma o corte
    const photoInput = document.getElementById('photo-input');
    const confirmCropBtn = document.getElementById('confirmCropBtn');

    const clearPhotoError = () => {
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.style.borderColor = '#e5e7eb'; // Volta a borda ao normal
            preview.style.boxShadow = 'none';      // Remove o brilho vermelho
        }
    };

    if (photoInput) {
        photoInput.addEventListener('change', clearPhotoError);
    }

    if (confirmCropBtn) {
        confirmCropBtn.addEventListener('click', clearPhotoError);
    }
}

function setupClearButtons() {
    // SELETOR ATUALIZADO: Agora inclui TEXTAREA e URL
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="url"], textarea');

    inputs.forEach(input => {
        // Verifica se já tem botão para não duplicar
        if (input.nextElementSibling && input.nextElementSibling.classList.contains('clear-input-btn')) {
            return;
        }

        // 1. Cria o botão X
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'clear-input-btn';
        clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        clearBtn.tabIndex = -1; // Pula na navegação via Tab

        // 2. Adiciona o botão logo após o input
        input.insertAdjacentElement('afterend', clearBtn);

        // 3. Adiciona classe ao input para dar espaço ao texto (padding-right)
        input.classList.add('input-with-clear');

        // 4. Função para mostrar/esconder o botão
        const toggleBtn = () => {
            // Só mostra se tiver valor digitado
            clearBtn.style.display = input.value.length > 0 ? 'block' : 'none';
        };

        // 5. Listeners
        input.addEventListener('input', toggleBtn);
        input.addEventListener('focus', toggleBtn); // Garante que verifica ao entrar no campo

        clearBtn.addEventListener('click', () => {
            input.value = '';
            toggleBtn();
            input.focus(); // Devolve o foco para o usuário

            // Dispara eventos para avisar o sistema (validações, máscaras, etc)
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Estado inicial
        toggleBtn();
    });
}

function setupDateColors() {
    const dateInputs = document.querySelectorAll('input[type="date"]');

    dateInputs.forEach(input => {
        // Função que verifica se tem data e troca a cor
        const checkValue = () => {
            if (input.value) {
                input.classList.add('has-value'); // Fica escuro
            } else {
                input.classList.remove('has-value'); // Fica claro (placeholder)
            }
        };

        // Ouve quando o usuário muda a data
        input.addEventListener('change', checkValue);
        input.addEventListener('input', checkValue);
        input.addEventListener('blur', checkValue);

        // Roda uma vez ao carregar (para o caso de edição ou preenchimento automático)
        checkValue();
    });
}

// --- FERRAMENTA DE DESENVOLVIMENTO: PREENCHIMENTO AUTOMÁTICO ---

function setupMagicButton() {
    // 1. Cria o botão flutuante visualmente
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-magic"></i> Preencher Teste';
    btn.className = 'magic-btn';
    btn.title = "Preenche campos obrigatórios automaticamente";
    document.body.appendChild(btn);

    // 2. Adiciona a lógica de clique
    btn.addEventListener('click', () => {
        console.log("🪄 Preenchendo formulário magicamente...");

        // Seleciona todos os campos obrigatórios visíveis e invisíveis
        const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');

        requiredInputs.forEach(input => {
            // Pula se for o input de arquivo (tratamos a foto separadamente)
            if (input.type === 'file') return;

            // Gera dados baseados no tipo ou ID do campo
            let value = '';

            if (input.tagName === 'SELECT') {
                // Pega a segunda opção (geralmente a primeira válida após o "-- Selecione --")
                if (input.options.length > 1) {
                    input.selectedIndex = 1; 
                }
            } else if (input.type === 'date') {
                value = '2000-01-01'; // Uma data válida
            } else if (input.type === 'email') {
                value = `teste.${Date.now()}@exemplo.com`; // Email único
            } else {
                // Lógica específica por ID para máscaras funcionarem melhor
                const id = input.id.toLowerCase();
                if (id.includes('cpf')) value = '111.222.333-44'; 
                else if (id.includes('telefone') || id.includes('whatsapp')) value = '(81) 99999-8888';
                else if (id.includes('cep')) value = '53610-000'; // CEP de Igarassu genérico
                else if (id.includes('nome')) value = 'João de Teste Silva';
                else value = 'Teste Automatizado';
            }

            // Aplica o valor (se não for select, pois select já foi tratado acima)
            if (input.tagName !== 'SELECT') {
                input.value = value;
            }

            // DISPARA OS EVENTOS
            // Isso é crucial para:
            // 1. As máscaras formatarem os números
            // 2. A validação visual (borda vermelha) sumir
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        });

        // --- TRUQUE DA FOTO (Bypass da validação de imagem) ---
        // Cria um quadrado cinza de 1x1 pixel para simular uma foto cortada
        const pixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        fetch(`data:image/png;base64,${pixelBase64}`)
            .then(res => res.blob())
            .then(blob => {
                // Define a variável global que o seu script usa para validar
                croppedBlob = blob; 
                
                // Atualiza o visual
                const preview = document.getElementById('photo-preview');
                if (preview) {
                    preview.style.backgroundImage = `url(data:image/png;base64,${pixelBase64})`;
                    preview.innerHTML = ''; // Remove o ícone da câmera
                    preview.style.borderColor = '#10b981'; // Borda verde
                }
                
                const statusMsg = document.getElementById('photo-status-msg');
                if(statusMsg) {
                    statusMsg.textContent = "Foto de teste gerada!";
                    statusMsg.style.color = "green";
                }
            });

        alert('🪄 Campos preenchidos! (Inclusive a foto interna)');
    });
}