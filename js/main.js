$(document).ready(function () {

    // --- Initial State & Storage Setup ---
    let currentUser = JSON.parse(localStorage.getItem("activeUser")) || {
        firstName: "",
        lastName: "",
        email: "",
        isLoggedIn: false
    };

    let ordersList = JSON.parse(localStorage.getItem("adminOrders")) || [
        { id: "#ORD-1001", customer: "John Doe", status: "Completed", amount: "250.00" },
        { id: "#ORD-1002", customer: "Sarah Smith", status: "Pending", amount: "120.50" },
        { id: "#ORD-1003", customer: "Alex Turner", status: "Cancelled", amount: "85.00" },
        { id: "#ORD-1004", customer: "Emma Watson", status: "Completed", amount: "430.00" }
    ];

    // --- Toast Notification Handler ---
    function showToast(message) {
        $("#toastMessage").text(message);
        const toastEl = document.getElementById('liveToast');
        if (toastEl) {
            const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
            toast.show();
        }
    }

    // --- Orders Table LocalStorage Renderer ---
    function renderOrdersTable() {
        const tbody = $("#ordersTableBody");
        tbody.empty();

        ordersList.forEach((order, index) => {
            let badgeClass = "bg-success";
            if (order.status === "Pending") badgeClass = "bg-warning text-dark";
            if (order.status === "Cancelled") badgeClass = "bg-danger";

            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td><span class="badge ${badgeClass}">${order.status}</span></td>
                    <td>$${order.amount}</td>
                    <td>
                        <button class="btn btn-xs btn-outline-info view-order-btn" data-index="${index}">View</button>
                        <button class="btn btn-xs btn-outline-danger delete-order-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Update Total Orders KPI
        $("#kpiTotalOrders").text(ordersList.length);
    }

    // --- UI State Synchronization ---
    function updateUIState() {
        if (currentUser.isLoggedIn) {
            const fullName = (currentUser.firstName + " " + currentUser.lastName).trim();
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff`;

            $("#navUserName").text(fullName);
            $("#navUserAvatar").attr("src", avatarUrl);
            $("#profileCardName").text(fullName);
            $("#profileCardEmail").text(currentUser.email);
            $("#profileCardAvatar").attr("src", avatarUrl);
            $("#profileCardRole").text("System Administrator");
            $("#profileStatusBadge").removeClass("bg-secondary-subtle text-secondary").addClass("bg-success-subtle text-success").text("Active Session");

            $("#inputFirstName").val(currentUser.firstName);
            $("#inputLastName").val(currentUser.lastName);
            $("#inputEmail").val(currentUser.email);

            $(".auth-form-container").addClass("d-none");
            $(".auth-logged-in-container").removeClass("d-none");
            $(".active-user-name").text(fullName);
            $(".active-user-email").text(currentUser.email);
            $(".active-user-avatar").attr("src", avatarUrl);

        } else {
            $("#navUserName").text("Guest User");
            $("#navUserAvatar").attr("src", "https://ui-avatars.com/api/?name=Guest+User&background=6c757d&color=fff");
            $("#profileCardName").text("Guest User");
            $("#profileCardEmail").text("Not Logged In");
            $("#profileCardAvatar").attr("src", "https://ui-avatars.com/api/?name=Guest+User&background=6c757d&color=fff&size=128");
            $("#profileCardRole").text("Visitor");
            $("#profileStatusBadge").removeClass("bg-success-subtle text-success").addClass("bg-secondary-subtle text-secondary").text("Logged Out");

            $("#inputFirstName").val("");
            $("#inputLastName").val("");
            $("#inputEmail").val("");

            $(".auth-form-container").removeClass("d-none");
            $(".auth-logged-in-container").addClass("d-none");
        }
    }

    // Initial Execution
    updateUIState();
    renderOrdersTable();

    // --- Profile Form Save Handler (No Page Switch / No Refresh) ---
    $("#profileForm").on("submit", function (e) {
        e.preventDefault();
        
        currentUser.firstName = $("#inputFirstName").val().trim();
        currentUser.lastName = $("#inputLastName").val().trim();
        currentUser.email = $("#inputEmail").val().trim();
        currentUser.isLoggedIn = true;

        localStorage.setItem("activeUser", JSON.stringify(currentUser));
        updateUIState();
        
        showToast("Saved profile changes successfully!");
    });

    // --- Settings Form Save Handler (No Page Switch / No Refresh) ---
    $("#settingsForm").on("submit", function (e) {
        e.preventDefault();
        showToast("Saved preferences successfully!");
    });

    // --- 1. Theme Switcher (Dark/Light Mode) ---
    $("#themeToggleBtn").on("click", function () {
        const currentTheme = $("html").attr("data-bs-theme");
        if (currentTheme === "dark") {
            $("html").attr("data-bs-theme", "light");
            $("#themeIcon").removeClass("fa-sun").addClass("fa-moon");
            showToast("Switched to Light Mode");
        } else {
            $("html").attr("data-bs-theme", "dark");
            $("#themeIcon").removeClass("fa-moon").addClass("fa-sun");
            showToast("Switched to Dark Mode");
        }
    });

    // --- 2. Sidebar Toggle ---
    $("#sidebarToggle").on("click", function () {
        $("#sidebar").toggleClass("collapsed");
    });

    // --- 3. Navigation Tabs ---
    $(document).on("click", ".nav-tab-link", function (e) {
        e.preventDefault();
        $(".sidebar-item").removeClass("active");
        $(this).closest(".sidebar-item").addClass("active");

        const title = $(this).data("title");
        if (title) $("#pageTitle").text(title);

        const targetSection = $(this).attr("href");
        if (targetSection && $(targetSection).length) {
            $(".tab-content-section").addClass("d-none");
            $(targetSection).removeClass("d-none");
        }
    });

    // --- 4. Auth Modals ---
    $(document).on("click", ".auth-modal-trigger", function (e) {
        e.preventDefault();
        const targetModal = $(this).data("target");
        const modalEl = document.querySelector(targetModal);
        if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });

    $("#loginForm").on("submit", function (e) {
        e.preventDefault();
        const email = $("#loginEmail").val();
        const namePart = email.split('@')[0];

        currentUser = {
            firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            lastName: "User",
            email: email,
            isLoggedIn: true
        };

        localStorage.setItem("activeUser", JSON.stringify(currentUser));
        updateUIState();
        bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
        showToast(`Logged in as ${currentUser.email}`);
    });

    $("#registerForm").on("submit", function (e) {
        e.preventDefault();
        const fullName = $("#regName").val().trim().split(' ');
        const email = $("#regEmail").val();

        currentUser = {
            firstName: fullName[0] || "User",
            lastName: fullName.slice(1).join(" ") || "",
            email: email,
            isLoggedIn: true
        };

        localStorage.setItem("activeUser", JSON.stringify(currentUser));
        updateUIState();
        bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
        showToast(`Account registered successfully!`);
    });

    $(document).on("click", ".btnLogoutAction", function (e) {
        e.preventDefault();
        currentUser = { firstName: "", lastName: "", email: "", isLoggedIn: false };
        localStorage.removeItem("activeUser");
        updateUIState();
        $('.modal').modal('hide');
        showToast("Logged out successfully!");
    });

    // --- 5. Add New Order ---
    $("#addOrderForm").on("submit", function (e) {
        e.preventDefault();

        const customerName = $("#newCustomerName").val().trim();
        const amount = parseFloat($("#newOrderAmount").val()).toFixed(2);
        const status = $("#newOrderStatus").val();
        const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = { id: orderId, customer: customerName, status: status, amount: amount };
        ordersList.unshift(newOrder);

        localStorage.setItem("adminOrders", JSON.stringify(ordersList));
        renderOrdersTable();

        $("#addOrderForm")[0].reset();
        bootstrap.Modal.getInstance(document.getElementById('addOrderModal'))?.hide();
        showToast(`New Order ${orderId} added successfully!`);
    });

    // --- 6. Delete Order ---
    $(document).on("click", ".delete-order-btn", function () {
        const index = $(this).data("index");
        const orderId = ordersList[index].id;
        
        ordersList.splice(index, 1);
        localStorage.setItem("adminOrders", JSON.stringify(ordersList));
        renderOrdersTable();
        showToast(`Order ${orderId} deleted!`);
    });

    // --- 7. View Order Details ---
    $(document).on("click", ".view-order-btn", function () {
        const index = $(this).data("index");
        const order = ordersList[index];

        $("#modalOrderTitle").text("Details for " + order.id);
        $("#modalCustomer").text(order.customer);
        $("#modalStatus").text(order.status);
        $("#modalAmount").text("$" + order.amount);

        bootstrap.Modal.getOrCreateInstance(document.getElementById('orderDetailsModal')).show();
    });

    // --- 8. FIXED Export CSV (Excel Compatible with UTF-8 BOM) ---
    $("#btnExportCSV").on("click", function () {
        if (ordersList.length === 0) {
            showToast("No orders available to export!");
            return;
        }

        let csvRows = [];
        // Header Row
        csvRows.push(["Order ID", "Customer", "Status", "Amount"].join(","));

        // Data Rows
        ordersList.forEach(order => {
            const row = [
                `"${order.id}"`,
                `"${order.customer.replace(/"/g, '""')}"`,
                `"${order.status}"`,
                `"$${order.amount}"`
            ];
            csvRows.push(row.join(","));
        });

        // Add UTF-8 BOM byte so Excel correctly formats columns and characters
        const csvString = "\uFEFF" + csvRows.join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Orders_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Exported Orders to CSV successfully!");
    });

    // --- 9. Chart Rendering ---
    const salesCtx = document.getElementById('salesOverviewChart');
    if (salesCtx) {
        const chartData = {
            day: [12, 19, 13, 25, 22, 30, 28],
            month: [120, 190, 300, 250, 420, 380, 500],
            year: [1200, 2400, 3200, 4100, 5200, 6100, 7300]
        };

        const salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales ($)',
                    data: chartData.day,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#cbd5e1' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
                }
            }
        });

        $(".filter-btn").on("click", function () {
            $(".filter-btn").removeClass("active");
            $(this).addClass("active");
            const range = $(this).data("range");
            salesChart.data.datasets[0].data = chartData[range];
            salesChart.update();
        });
    }

    const trafficCtx = document.getElementById('trafficSourceChart');
    if (trafficCtx) {
        new Chart(trafficCtx, {
            type: 'doughnut',
            data: {
                labels: ['Search Engine', 'Direct', 'Social Media'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } } }
            }
        });
    }

    // --- 10. Table Search Filter ---
    $("#tableSearch").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        $("#ordersTable tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $("#btnRefresh").on("click", function () {
        const icon = $(this).find("i");
        icon.addClass("fa-spin");
        $("#tableSearch").val("");
        renderOrdersTable();
        setTimeout(() => icon.removeClass("fa-spin"), 500);
        showToast("Table refreshed!");
    });

});