let currentImages = [];

function renderProducts() {
    const list = document.getElementById('products-list');
    list.innerHTML = '';

    if (!globalData.products || globalData.products.length <= 1) {
        list.innerHTML = '<p>Nenhum produto cadastrado.</p>';
        return;
    }

    for (let i = 1; i < globalData.products.length; i++) {
        const row = globalData.products[i];
        if (!row[3]) continue;

        const name = row[0]; // A
        const price = row[1]; // B
        const desc = row[2]; // C
        const code = row[3]; // D
        
        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <h4>${name} (Ref: ${code})</h4>
            <p><strong>Preço:</strong> R$ ${price}</p>
            <p><strong>Descrição:</strong> ${desc.substring(0, 50)}...</p>
            <button onclick='editProduct(${i})'>Editar</button>
            <button onclick="deleteProduct('${code}')">Excluir</button>
        `;
        list.appendChild(card);
    }
}

function openProductForm() {
    document.getElementById('product-form-container').classList.remove('hidden');
    document.getElementById('product-form-title').innerText = "Novo Produto";
    document.getElementById('prod-code').value = "";
    document.getElementById('prod-name').value = "";
    document.getElementById('prod-price').value = "";
    document.getElementById('prod-desc').value = "";
    currentImages = [];
    renderImgTags();
}

function closeProductForm() {
    document.getElementById('product-form-container').classList.add('hidden');
}

function editProduct(index) {
    const row = globalData.products[index];
    document.getElementById('product-form-container').classList.remove('hidden');
    document.getElementById('product-form-title').innerText = "Editar Produto";
    
    document.getElementById('prod-name').value = row[0];
    document.getElementById('prod-price').value = row[1];
    document.getElementById('prod-desc').value = row[2];
    document.getElementById('prod-code').value = row[3];
    
    currentImages = row[4] ? row[4].toString().split(',').filter(x => x.trim() !== '') : [];
    renderImgTags();
}

function formatDescription(startTag, endTag = null) {
    const textarea = document.getElementById('prod-desc');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end);
    const wrapEnd = endTag ? endTag : startTag;
    
    textarea.value = textarea.value.substring(0, start) + startTag + sel + wrapEnd + textarea.value.substring(end);
    textarea.focus();
}

async function pasteImageHtml() {
    try {
        const text = await navigator.clipboard.readText();
        const match = text.match(/src="([^"]+)"/);
        if (match && match[1]) {
            currentImages.push(match[1]);
            renderImgTags();
        } else {
            alert("Nenhum link de imagem encontrado na área de transferência.");
        }
    } catch(err) {
        alert("Erro ao colar: " + err);
    }
}

function renderImgTags() {
    const container = document.getElementById('img-tags-container');
    container.innerHTML = '';
    currentImages.forEach((imgUrl, idx) => {
        const tag = document.createElement('div');
        tag.className = 'img-tag';
        tag.innerHTML = `
            <span>${imgUrl}</span>
            <button onclick="removeImage(${idx})">X</button>
        `;
        container.appendChild(tag);
    });
}

function removeImage(idx) {
    currentImages.splice(idx, 1);
    renderImgTags();
}

async function saveProduct() {
    const codeObj = document.getElementById('prod-code').value;
    const isEdit = codeObj !== "";
    
    const payload = {
        productname: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        description: document.getElementById('prod-desc').value,
        code: isEdit ? codeObj : 'PRD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        img: currentImages.join(',')
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: isEdit ? 'updateProduct' : 'addProduct',
                data: payload
            })
        });
        await loadAllData();
        closeProductForm();
        renderProducts();
    } catch(err) {
        alert("Erro ao salvar o produto.");
    }
}

async function deleteProduct(code) {
    if (!confirm("Excluir este produto?")) return;
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'deleteProduct', code: code })
        });
        await loadAllData();
        renderProducts();
    } catch(err) {
        alert("Erro ao excluir o produto.");
    }
}
