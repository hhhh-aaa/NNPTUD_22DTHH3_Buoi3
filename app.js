const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = "";
let sortAsc = true;

async function fetchProducts() {
    const res = await fetch(API);
    products = await res.json();
    filtered = [...products];
    render();
}

function render() {
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    pageData.forEach(p => {
        const tr = document.createElement("tr");
        tr.title = p.description;
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.category?.name || ""}</td>
            <td><img src="${p.images[0]}" width="50"></td>
        `;
        tr.onclick = () => openDetail(p);
        tbody.appendChild(tr);
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filtered.length / pageSize);
    const ul = document.getElementById("pagination");
    ul.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === currentPage ? "active" : ""}`;
        li.innerHTML = `<button class="page-link">${i}</button>`;
        li.onclick = () => {
            currentPage = i;
            render();
        };
        ul.appendChild(li);
    }
}

document.getElementById("searchInput").oninput = e => {
    filtered = products.filter(p =>
        p.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    currentPage = 1;
    render();
};

document.getElementById("pageSize").onchange = e => {
    pageSize = Number(e.target.value);
    currentPage = 1;
    render();
};

function sortBy(field) {
    sortAsc = sortField === field ? !sortAsc : true;
    sortField = field;
    filtered.sort((a, b) =>
        sortAsc ? a[field] > b[field] ? 1 : -1 : a[field] < b[field] ? 1 : -1
    );
    render();
}

function exportCSV() {
    let csv = "id,title,price,category\n";
    filtered.forEach(p => {
        csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
    });
    const blob = new Blob([csv]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
}

function openDetail(p) {
    document.getElementById("detailId").value = p.id;
    document.getElementById("detailTitle").value = p.title;
    document.getElementById("detailPrice").value = p.price;
    document.getElementById("detailDescription").value = p.description;
    new bootstrap.Modal("#detailModal").show();
}

async function updateProduct() {
    const id = detailId.value;
    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: detailTitle.value,
            price: Number(detailPrice.value),
            description: detailDescription.value
        })
    });
    fetchProducts();
}

async function createProduct() {
    await fetch(API, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: createTitle.value,
            price: Number(createPrice.value),
            description: createDescription.value,
            categoryId: 1,
            images: [createImage.value]
        })
    });
    fetchProducts();
}

fetchProducts();
