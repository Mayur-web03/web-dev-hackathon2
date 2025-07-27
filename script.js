document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const invoiceModal = document.getElementById('invoiceModal');
    const closeButtonLogin = loginModal.querySelector('.close-button');
    const closeButtonCart = cartModal.querySelector('#cartCloseButton');
    const closeButtonInvoice = invoiceModal.querySelector('#invoiceCloseButton');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const modalLoginBtn = document.getElementById('modalLoginBtn');
    const modeToggleBtn = document.getElementById('modeToggle');
    const cartIconBtn = document.getElementById('cartIcon');
    const cartItemCount = document.getElementById('cartItemCount');
    const purchaseHistoryLink = document.getElementById('purchaseHistoryLink');
    const purchaseHistorySection = document.getElementById('purchaseHistory');
    const purchaseTableBody = purchaseHistorySection.querySelector('tbody');
    const noHistoryMessage = purchaseHistorySection.querySelector('.no-history');
    const purchaseTable = purchaseHistorySection.querySelector('table');
    const clearPurchaseHistoryBtn = document.getElementById('clearPurchaseHistoryBtn');
    const totalRewardPointsDisplay = document.getElementById('totalRewardPoints');
    const totalRewardsContainer = purchaseHistorySection.querySelector('.total-rewards-display');
    const cartList = document.getElementById('cartList');
    const cartTotalSpan = document.getElementById('cartTotal');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    const invoiceRewardPointsSpan = document.getElementById('invoiceRewardPoints');

    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    function getRewardPoints() {
        return parseFloat(localStorage.getItem('totalRewardPoints')) || 0;
    }

    function addRewardPoints(points) {
        let currentPoints = getRewardPoints();
        currentPoints += points;
        localStorage.setItem('totalRewardPoints', currentPoints.toFixed(2));
        updateRewardPointsUI();
    }

    function updateRewardPointsUI() {
        const totalPoints = getRewardPoints();
        totalRewardPointsDisplay.textContent = totalPoints.toFixed(2);
        if (totalPoints > 0) {
            totalRewardsContainer.style.display = 'block';
        } else {
            totalRewardsContainer.style.display = 'none';
        }
    }

    function getPurchaseHistory() {
        const history = localStorage.getItem('purchaseHistory');
        return history ? JSON.parse(history) : [];
    }

    function addPurchaseToHistory(productName, price, quantity, rewardPointsEarned) {
        const history = getPurchaseHistory();
        const now = new Date();
        const dateString = now.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const newPurchase = { date: dateString, product: productName, price: price, quantity: quantity, rewardPoints: rewardPointsEarned };

        history.unshift(newPurchase);
        localStorage.setItem('purchaseHistory', JSON.stringify(history));
        renderPurchaseHistory();
    }

    function renderPurchaseHistory() {
        const history = getPurchaseHistory();
        purchaseTableBody.innerHTML = '';

        if (history.length === 0) {
            noHistoryMessage.style.display = 'block';
            purchaseTable.style.display = 'none';
            clearPurchaseHistoryBtn.style.display = 'none';
            totalRewardsContainer.style.display = 'none';
        } else {
            noHistoryMessage.style.display = 'none';
            purchaseTable.style.display = 'table';
            clearPurchaseHistoryBtn.style.display = 'block';
            history.forEach(entry => {
                const row = purchaseTableBody.insertRow();
                const dateCell = row.insertCell();
                const productCell = row.insertCell();
                const priceCell = row.insertCell();
                const rewardPointsCell = row.insertCell();

                dateCell.textContent = entry.date;
                productCell.textContent = `${entry.product} (x${entry.quantity})`;
                priceCell.textContent = `₹${entry.price}`;
                rewardPointsCell.textContent = `${entry.rewardPoints.toFixed(2)} pts`;
                rewardPointsCell.style.color = '#00796b';
                rewardPointsCell.style.fontWeight = 'bold';
            });
            updateRewardPointsUI();
        }
    }

    function clearAllPurchaseHistory() {
        if (confirm('Are you sure you want to clear your entire purchase history? This cannot be undone.')) {
            localStorage.removeItem('purchaseHistory');
            localStorage.removeItem('totalRewardPoints');
            renderPurchaseHistory();
            alert('Purchase history cleared!');
        }
    }

    function getCartItems() {
        const cart = localStorage.getItem('cartItems');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCartItems(cart) {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(productName, price) {
        const cart = getCartItems();
        const existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name: productName, price: price, quantity: 1 });
        }
        saveCartItems(cart);
    }

    function clearCart() {
        saveCartItems([]);
    }

    function updateCartUI() {
        const cart = getCartItems();
        cartItemCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemCount.style.display = cart.length > 0 ? 'block' : 'none';

        cartList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartList.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            cartList.style.display = 'block';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`;
                cartList.appendChild(li);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total;
    }

    function generateInvoice() {
        const cart = getCartItems();
        if (cart.length === 0) {
            alert('Your cart is empty. Nothing to generate an invoice for!');
            return;
        }

        const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const invoiceDate = new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        document.getElementById('invoiceId').textContent = invoiceId;
        document.getElementById('invoiceDate').textContent = invoiceDate;

        const invoiceItemList = document.getElementById('invoiceItemList');
        invoiceItemList.innerHTML = '';
        let grandTotal = 0;
        let pointsEarned = 0;

        cart.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = item.price * item.quantity;
            li.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>₹${itemTotal}</span>`;
            invoiceItemList.appendChild(li);
            grandTotal += itemTotal;
            pointsEarned += (itemTotal / 10);
        });

        document.getElementById('invoiceGrandTotal').textContent = grandTotal;
        invoiceRewardPointsSpan.textContent = pointsEarned.toFixed(2);

        cart.forEach(item => {
            addPurchaseToHistory(item.name, item.price * item.quantity, item.quantity, (item.price * item.quantity / 10));
        });
        addRewardPoints(pointsEarned);

        openModal(invoiceModal);
    }

    function printInvoice() {
        const printContent = invoiceModal.querySelector('.modal-content').innerHTML;
        const originalBody = document.body.innerHTML;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Invoice</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: 'Segoe UI', sans-serif; margin: 20px; }
            h3 { text-align: center; color: #4CAF50; border-bottom: 2px solid #FF9800; padding-bottom: 10px; }
            p { margin-bottom: 5px; }
            ul { list-style: none; padding: 0; margin: 15px 0; }
            li { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
            hr { border: 0; border-top: 1px dashed #ccc; margin: 15px 0; }
            strong { font-weight: bold; }
            .invoice-rewards { font-weight: bold; color: #4CAF50; margin-top: 15px; font-size: 1.1em; text-align: center; }
            .print-invoice-btn, .close-button { display: none !important; }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    function openModal(modalElement) {
        modalElement.style.display = 'flex';
    }

    function closeModal(modalElement) {
        modalElement.style.display = 'none';
    }

    function filterProducts(category) {
        productCards.forEach(card => {
            const productCategory = card.dataset.category;
            if (category === 'all' || productCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            closeModal(loginModal);
            closeModal(cartModal);
            closeModal(invoiceModal);

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetId === '#vendor') {
                targetSection.style.display = 'block';
                document.querySelector('.filter-btn[data-filter="all"]').click();
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else if (targetId === '#purchaseHistory') {
                targetSection.style.display = 'block';
                renderPurchaseHistory();
                updateRewardPointsUI();
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    getStartedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        openModal(loginModal);
        closeModal(cartModal);
        closeModal(invoiceModal);
    });

    closeButtonLogin.addEventListener('click', () => closeModal(loginModal));
    closeButtonCart.addEventListener('click', () => closeModal(cartModal));
    closeButtonInvoice.addEventListener('click', () => {
        closeModal(invoiceModal);
        document.getElementById('purchaseHistory').style.display = 'block';
        renderPurchaseHistory();
        document.getElementById('purchaseHistory').scrollIntoView({ behavior: 'smooth' });
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            closeModal(loginModal);
        }
        if (event.target === cartModal) {
            closeModal(cartModal);
        }
        if (event.target === invoiceModal) {
            closeModal(invoiceModal);
            document.getElementById('purchaseHistory').style.display = 'block';
            renderPurchaseHistory();
        }
    });

    modalLoginBtn.addEventListener('click', () => {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === "vendor" && password === "password") {
            alert(`Welcome, ${username}!`);
            closeModal(loginModal);
            usernameInput.value = '';
            passwordInput.value = '';
            document.getElementById('vendor').style.display = 'block';
            document.querySelector('.filter-btn[data-filter="all"]').click();
            document.getElementById('vendor').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Invalid username or password. Try "vendor" / "password".');
        }
    });

    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.dataset.productName;
            const productPrice = parseFloat(e.target.dataset.productPrice);
            addToCart(productName, productPrice);

            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const confirmation = document.createElement('div');
                confirmation.textContent = 'Added to Cart!';
                confirmation.style.cssText = `
                    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
                    background: rgba(0, 128, 0, 0.9); color: white; padding: 5px 10px;
                    border-radius: 5px; font-size: 0.9em; opacity: 0; transition: opacity 0.3s ease;
                    z-index: 2;
                    pointer-events: none;
                `;
                productCard.appendChild(confirmation);
                setTimeout(() => { confirmation.style.opacity = 1; }, 10);
                setTimeout(() => { confirmation.style.opacity = 0; }, 1500);
                setTimeout(() => { productCard.removeChild(confirmation); }, 1800);
            }
        });
    });

    modeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = modeToggleBtn.querySelector('.material-icons');
        if (document.body.classList.contains('dark-mode')) {
            icon.textContent = 'dark_mode';
        } else {
            icon.textContent = 'light_mode';
        }
    });

    cartIconBtn.addEventListener('click', () => {
        openModal(cartModal);
        updateCartUI();
    });

    checkoutBtn.addEventListener('click', () => {
        const cart = getCartItems();
        if (cart.length > 0) {
            if (confirm('Proceed to checkout?')) {
                generateInvoice();
                clearCart();
                closeModal(cartModal);
            }
        } else {
            alert('Your cart is empty!');
        }
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
            alert('Cart cleared!');
        }
    });

    clearPurchaseHistoryBtn.addEventListener('click', clearAllPurchaseHistory);

    printInvoiceBtn.addEventListener('click', printInvoice);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.filter;
            filterProducts(category);
        });
    });

    renderPurchaseHistory();
    updateCartUI();
    updateRewardPointsUI();

    document.querySelectorAll('section').forEach(section => {
        if (section.id !== 'hero-section' && section.id !== 'vendor') {
            section.style.display = 'none';
        }
    });

    document.querySelector('.filter-btn[data-filter="all"]').click();
});