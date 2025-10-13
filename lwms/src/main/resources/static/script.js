const appState = {
	loadState: () => {
		const storedState = localStorage.getItem('lwmsState');
		if (storedState) {
			Object.assign(appState, JSON.parse(storedState));
		} else {
			appState.resetState();
		}
	},
	saveState: () => {
		localStorage.setItem('lwmsState', JSON.stringify(appState));
	},
	resetState: () => {
		appState.inventory = [];
		appState.space = {
			zones: []
		};
		appState.shipments = [];
		appState.maintenance = [];
		appState.reports = [
			{ timestamp: new Date().toLocaleString(), message: 'System initialized.' }
		];
	},
	findZoneByLocation: (spaceId) => {
		return appState.space.zones.find(zone => zone.spaceId === spaceId);
	}
};

appState.loadState();

// --- Core Functions ---

const showConfirmationModal = (message, onConfirm) => {
	const modal = document.getElementById('confirmation-modal');
	const modalMessage = document.getElementById('modal-message');
	const modalConfirmBtn = document.getElementById('modal-confirm');
	const modalCancelBtn = document.getElementById('modal-cancel');

	modalMessage.textContent = message;
	modal.classList.remove('hidden');

	const handleConfirm = () => {
		onConfirm();
		modal.classList.add('hidden');
		modalConfirmBtn.removeEventListener('click', handleConfirm);
		modalCancelBtn.removeEventListener('click', handleCancel);
	};

	const handleCancel = () => {
		modal.classList.add('hidden');
		modalConfirmBtn.removeEventListener('click', handleConfirm);
		modalCancelBtn.removeEventListener('click', handleCancel);
	};

	modalConfirmBtn.addEventListener('click', handleConfirm);
	modalCancelBtn.addEventListener('click', handleCancel);
};

const closeModal = (modalId) => {
	document.getElementById(modalId).classList.add('hidden');
};

// --- Toast Helper with type ---
const showToast = (message, type = 'success', duration = 2000) => {
	let container = document.getElementById('toast-container');
	if (!container) {
		container = document.createElement('div');
		container.id = 'toast-container';
		container.className =
			'fixed inset-0 pointer-events-none flex items-start justify-center sm:justify-end p-4 z-[9999]';
		document.body.appendChild(container);
	}

	const toast = document.createElement('div');

	// Base styles
	let bgColor = 'bg-gray-900';
	if (type === 'success') bgColor = 'bg-green-600';
	if (type === 'error') bgColor = 'bg-red-600';

	toast.className = `pointer-events-auto mt-12 sm:mt-0 sm:mr-4 ${bgColor} text-white text-sm rounded-lg shadow-lg px-4 py-2 opacity-0 transition-opacity`;
	toast.textContent = message;
	container.appendChild(toast);

	requestAnimationFrame(() => toast.classList.add('opacity-100'));
	setTimeout(() => {
		toast.classList.remove('opacity-100');
		toast.addEventListener('transitionend', () => toast.remove(), { once: true });
	}, duration);
};

const logEvent = (message) => {
	// Placeholder for logging functionality
	console.log(`[LOG] ${new Date().toLocaleString()}: ${message}`);
};

const fetchInventoryItems = async () => {
	try {
		const response = await fetch('/api/inventory/viewItems');
		if (!response.ok) throw new Error('Failed to fetch inventory items.');
		return await response.json();
	} catch (error) {
		console.error("Error fetching inventory items:", error);
		return [];
	}
};
// --- Render Functions ---
const renderDashboard = () => {
	const contentArea = document.getElementById('content-area');
	contentArea.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-3xl font-bold text-gray-800">Dashboard</h2>
                    <p class="text-lg text-gray-600">Welcome to the <b>Logistics Warehouse Management System</b>.<br> Use the navigation to manage your warehouse operations.</p>
					<div class="mt-4">
				        <img src="images/Designer.png" alt="Project Image" class="w-[800px] h-[300px] rounded-lg shadow-md object-fill mx-auto transition-transform duration-300 transform hover:scale-105">
					</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-xl shadow-custom flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
                            <div>
                                <h4 class="text-xl font-semibold text-gray-700">Total Shipments</h4>
                                <p class="text-3xl font-bold text-blue-600 mt-2" id="total-shipments-count">...</p>
                            </div>
                            <i class="fas fa-truck-loading text-4xl text-gray-400"></i>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-custom flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
                            <div>
                                <h4 class="text-xl font-semibold text-gray-700">Total Inventory Items</h4>
                                <p class="text-3xl font-bold text-green-600 mt-2" id="total-inventory-count">...</p>
                            </div>
                            <i class="fas fa-boxes text-4xl text-gray-400"></i>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-custom flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
                            <div>
                                <h4 class="text-xl font-semibold text-gray-700">Total Space Zones</h4>
                                <p class="text-3xl font-bold text-purple-600 mt-2" id="total-space-zones-count">...</p>
                            </div>
                            <i class="fas fa-warehouse text-4xl text-gray-400"></i>
                        </div>
                    </div>
                </div>
            `;
	// Fetch and display dashboard stats
	fetchDashboardStats();
};

const fetchDashboardStats = async () => {
	try {
		const [shipmentsRes, inventoryRes, spaceRes] = await Promise.all([
			fetch('/api/shipments/view'),
			fetch('/api/inventory/viewItems'),
			fetch('/api/space/view')
		]);

		const shipments = await shipmentsRes.json();
		const inventory = await inventoryRes.json();
		const space = await spaceRes.json();

		document.getElementById('total-shipments-count').textContent = shipments.length;
		document.getElementById('total-inventory-count').textContent = inventory.length;
		document.getElementById('total-space-zones-count').textContent = space.length;

	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		logEvent("Failed to fetch dashboard data.");
	}
};

// --- Inventory Module ---
const renderInventory = async () => {
    // Hide all other modules
    document.getElementById('content-area')?.classList.add('hidden');
    document.getElementById('maintenance-module')?.classList.add('hidden');

    // Show the inventory module
    document.getElementById('inventory-module')?.classList.remove('hidden');

    // Load inventory data
    await fetchAndRenderInventory();

    // Bind events (form submission, buttons, etc.)
    setupInventoryEventListeners();
};

const fetchAndRenderInventory = async () => {
	try {
		const [inventoryResponse, spaceResponse] = await Promise.all([
			fetch('/api/inventory/viewItems'),
			fetch('/api/space/view')
		]);

		if (!inventoryResponse.ok || !spaceResponse.ok) {
			throw new Error('Failed to fetch data from the backend.');
		}

		appState.inventory = await inventoryResponse.json();
		appState.space.zones = await spaceResponse.json();
		appState.saveState();

		renderInventoryTable(appState.inventory);
		renderSpaceDropdowns(appState.space.zones);

	} catch (error) {
		console.error("Error fetching inventory or space data:", error);
		logEvent("Failed to fetch inventory data.");
	}
};

const renderInventoryTable = (items) => {
	const tableBody = document.getElementById('inventory-table-body');
	const noInventoryMessage = document.getElementById('no-inventory-message');
	tableBody.innerHTML = '';

	if (items.length === 0) {
		noInventoryMessage.classList.remove('hidden');
		return;
	}
	noInventoryMessage.classList.add('hidden');

	items.forEach(item => {
		const spaceZone = appState.space.zones.find(zone => zone.spaceId === (item.space ? item.space.spaceId : null)) || { zone: 'N/A' };
		const row = document.createElement('tr');
		row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.itemId}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.itemName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${spaceZone.zone}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(item.lastUpdated).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editItem(${item.itemId})" class="text-blue-600 hover:text-blue-900 mr-4"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteItem(${item.itemId})" class="text-red-600 hover:text-red-900"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
		tableBody.appendChild(row);
	});
};

const renderSpaceDropdowns = (zones) => {
	const addLocationSelect = document.getElementById('addLocation');
	const updateLocationSelect = document.getElementById('updateLocation');
	if (addLocationSelect) {
		addLocationSelect.innerHTML = '<option value="" disabled selected>Select Location/Zone</option>';
		zones.forEach(zone => {
			const option = document.createElement('option');
			option.value = zone.spaceId;
			option.textContent = zone.zone;
			addLocationSelect.appendChild(option);
		});
	}
	if (updateLocationSelect) {
		updateLocationSelect.innerHTML = '<option value="" disabled selected>Select Location/Zone</option>';
		zones.forEach(zone => {
			const option = document.createElement('option');
			option.value = zone.spaceId;
			option.textContent = zone.zone;
			updateLocationSelect.appendChild(option);
		});
	}
};

const addItem = async (e) => {
	e.preventDefault();
	const itemName = document.getElementById('addItemName').value.trim();
	const category = document.getElementById('addCategory').value.trim();
	const quantity = parseInt(document.getElementById('addQuantity').value);
	const spaceId = parseInt(document.getElementById('addLocation').value);

	// Validation for Item Name and Category
	if (!itemName) {
		alert('Item Name cannot be empty.');
		return;
	}
	if (!category) {
		alert('Category cannot be empty.');
		return;
	}

	const newInventory = {
		itemName,
		category,
		quantity,
		space: { spaceId },
	};

	try {
		const response = await fetch('/api/inventory/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newInventory)
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.body || 'Failed to add item.');
		}

		logEvent(`Added new item '${itemName}' with quantity ${quantity}.`);
		document.getElementById('add-item-form').reset();
		await fetchAndRenderInventory();
		// after: await fetchAndRenderInventory();
		showToast('Item added Successfully', 'success'); // NEW

	} catch (error) {
		console.error("Error adding item:", error);
		alert(`Error: ${error.message}`);
		logEvent(`Failed to add new item: ${itemName}.`);
	}
};

// New function to handle editing an item
const editItem = async (itemId) => {
	try {
		const response = await fetch(`/api/inventory/viewItems/${itemId}`);
		if (!response.ok) {
			throw new Error('Failed to fetch item details.');
		}
		const item = await response.json();

		document.getElementById('updateItemId').value = item.itemId;
		document.getElementById('updateItemName').value = item.itemName;
		document.getElementById('updateCategory').value = item.category;
		document.getElementById('updateQuantity').value = item.quantity;
		document.getElementById('updateLocation').value = item.space.spaceId;

		document.getElementById('inventory-update-modal').classList.remove('hidden');
	} catch (error) {
		console.error("Error fetching item for update:", error);
		alert(`Error: ${error.message}`);
	}
};

const updateItem = async (e) => {
	e.preventDefault();
	const itemId = document.getElementById('updateItemId').value;
	const itemName = document.getElementById('updateItemName').value;
	const category = document.getElementById('updateCategory').value;
	const quantity = parseInt(document.getElementById('updateQuantity').value);
	const spaceId = parseInt(document.getElementById('updateLocation').value);

	const updatedInventory = {
		itemName,
		category,
		quantity,
		space: { spaceId }
	};

	try {
		const response = await fetch(`/api/inventory/update/${itemId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedInventory)
		});

		if (!response.ok) {
			throw new Error('Failed to update item.');
		}

		logEvent(`Updated item with ID: ${itemId}.`);
		closeModal('inventory-update-modal');
		await fetchAndRenderInventory();
		showToast('Item updated Successfully', 'success'); // NEW
	} catch (error) {
		console.error("Error updating item:", error);
		alert(`Error: ${error.message}`);
		logEvent(`Failed to update item with ID: ${itemId}.`);
	}
};

const deleteItem = (itemId) => {
	showConfirmationModal(`Are you sure you want to delete this inventory item?`, async () => {
		try {
			const response = await fetch(`/api/inventory/delete/${itemId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete item.');
			}

			logEvent(`Deleted inventory item with ID: ${itemId}.`);
			await fetchAndRenderInventory();
			// after: await fetchAndRenderInventory();
			showToast('Item deleted Successfully', 'error'); // NEW

		} catch (error) {
			console.error("Error deleting item:", error);
			logEvent(`Failed to delete item with ID: ${itemId}.`);
		}
	});
};

// Event listeners
const setupInventoryEventListeners = () => {
	const addItemForm = document.getElementById('add-item-form');
	if (addItemForm) {
		addItemForm.addEventListener('submit', addItem);
	}
	const updateItemForm = document.getElementById('update-item-form');
	if (updateItemForm) {
		updateItemForm.addEventListener('submit', updateItem);
	}
};

// --- Space Module ---
const renderSpace = async () => {
	const contentArea = document.getElementById('content-area');
	contentArea.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-3xl font-bold text-gray-800">Space Optimization</h2>
                    <div class="bg-white p-6 rounded-xl shadow-custom">
                        <h3 class="text-xl font-semibold text-gray-700 mb-4">Create New Zone</h3>
                        <form id="create-zone-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <input type="text" id="newZoneName" placeholder="Zone Name (e.g., Zone A/1 )" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500 w-full" required>
                                <p id="newZoneName-validation" class="validation-message hidden">Please enter only alphabets without spaces.</p>
                            </div>
                            <input type="number" id="newZoneCapacity" placeholder="Total Capacity" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500" min="0" required>
                            <div class="md:col-span-2 flex justify-end">
                                <button type="submit" class="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105">Create Zone</button>
                            </div>
                        </form>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-custom">
                        <h3 class="text-xl font-semibold text-gray-700 mb-4">Update Zone Capacity</h3>
                        <form id="space-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select id="spaceId-update" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500" required>
                                <option value="" disabled selected>Select Zone</option>
                            </select>
                            <input type="number" id="updateTotalCapacity" placeholder="Total Capacity" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500" min="0" required>
                            <input type="number" id="updateUsedCapacity" placeholder="Used Space" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500" min="0" required>
                            <div class="relative">
                                <input type="number" id="updateAvailableCapacity" placeholder="Available Space" class="p-2 border rounded-md focus:ring-2 focus:ring-purple-500 w-full" readonly>
                                <p id="usedCapacity-validation" class="validation-message hidden">Used space cannot be more than total capacity.</p>
                            </div>
                            <div class="md:col-span-2 flex justify-end">
                                <button type="submit" class="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105">Update Capacity</button>
                            </div>
                        </form>
                    </div>
                    <div id="space-zone-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        </div>
                </div>
            `;

	// --- API Calls for Space Module ---

	// 1. Fetch and render all space zones
	try {
		const response = await fetch('/api/space/view');
		if (!response.ok) {
			throw new Error('Failed to fetch space zones.');
		}
		const zones = await response.json();
		appState.space.zones = zones;
		appState.saveState();

		const spaceCardsContainer = document.getElementById('space-zone-cards');
		const updateZoneSelect = document.getElementById('spaceId-update');

		// Clear previous content
		spaceCardsContainer.innerHTML = '';
		updateZoneSelect.innerHTML = '<option value="" disabled selected>Select Zone</option>';

		// Render cards and update select dropdown
		zones.forEach(zone => {
			const utilization = (zone.usedCapacity / zone.totalCapacity) * 100;
			const color = utilization > 80 ? 'bg-red-500' : (utilization > 50 ? 'bg-yellow-500' : 'bg-green-500');
			spaceCardsContainer.innerHTML += `
                        <div class="relative bg-white p-6 rounded-xl shadow-custom">
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">${zone.zone}</h3>
                            <p class="text-sm text-gray-500">Capacity: ${zone.totalCapacity}</p>
                            <div class="mt-4 w-full bg-gray-200 rounded-full h-4">
                                <div class="${color} h-4 rounded-full" style="width: ${utilization.toFixed(2)}%;"></div>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">${zone.usedCapacity} used / ${zone.availableCapacity} available</p>
                            <p class="text-sm font-bold text-gray-800 mt-1">${utilization.toFixed(2)}% Utilization</p>
                           
                        </div>
                    `;
			updateZoneSelect.innerHTML += `<option value="${zone.spaceId}">${zone.zone}</option>`;
		});
	} catch (error) {
		console.error("Error fetching space zones:", error);
		logEvent("Failed to fetch space zones from the backend.");
	}

	// --- Frontend Validations and Logic ---
	const newZoneNameInput = document.getElementById('newZoneName');
	const newZoneNameValidationMsg = document.getElementById('newZoneName-validation');

	// Zone name validation: only alphabets
	newZoneNameInput.addEventListener('input', () => {
		const zoneName = newZoneNameInput.value;
		const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
		if (!regex.test(zoneName) && zoneName !== '') {
			newZoneNameValidationMsg.textContent = "Please Start with Alphabets, No Empty Spaces Allowed!";
			newZoneNameValidationMsg.classList.remove('hidden');
		} else {
			newZoneNameValidationMsg.classList.add('hidden');
		}
	});

	// Update form validation and auto-calculation
	const updateTotalCapacityInput = document.getElementById('updateTotalCapacity');
	const updateUsedCapacityInput = document.getElementById('updateUsedCapacity');
	const updateAvailableCapacityInput = document.getElementById('updateAvailableCapacity');
	const usedCapacityValidationMsg = document.getElementById('usedCapacity-validation');

	const updateCapacityFields = () => {
		const total = parseInt(updateTotalCapacityInput.value) || 0;
		const used = parseInt(updateUsedCapacityInput.value) || 0;

		if (used > total) {
			usedCapacityValidationMsg.textContent = "Used space cannot be more than total capacity.";
			usedCapacityValidationMsg.classList.remove('hidden');
			updateAvailableCapacityInput.value = '';
		} else if (total < 0 || used < 0) {
			usedCapacityValidationMsg.textContent = "Capacity values cannot be negative.";
			usedCapacityValidationMsg.classList.remove('hidden');
			updateAvailableCapacityInput.value = '';
		}
		else {
			usedCapacityValidationMsg.classList.add('hidden');
			const available = total - used;
			updateAvailableCapacityInput.value = available >= 0 ? available : '';
		}
	};

	updateTotalCapacityInput.addEventListener('input', updateCapacityFields);
	updateUsedCapacityInput.addEventListener('input', updateCapacityFields);

	// Populate update form fields when a zone is selected
	const updateZoneSelect = document.getElementById('spaceId-update');
	updateZoneSelect.addEventListener('change', () => {
		const selectedSpaceId = parseInt(updateZoneSelect.value);
		const selectedZone = appState.space.zones.find(z => z.spaceId === selectedSpaceId);

		if (selectedZone) {
			updateTotalCapacityInput.value = selectedZone.totalCapacity;
			updateUsedCapacityInput.value = selectedZone.usedCapacity;
			updateAvailableCapacityInput.value = selectedZone.availableCapacity;
			usedCapacityValidationMsg.classList.add('hidden');
		} else {
			updateTotalCapacityInput.value = '';
			updateUsedCapacityInput.value = '';
			updateAvailableCapacityInput.value = '';
		}
	});

	// 2. Create new zone logic (POST)
	const createForm = document.getElementById('create-zone-form');
	createForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const newZoneName = newZoneNameInput.value;
		const totalCapacity = parseInt(document.getElementById('newZoneCapacity').value);
		const usedCapacity = 0;
		const availableCapacity = totalCapacity;
		const zone = newZoneName.trim();

		// Final validation before sending
		const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
		if (!regex.test(newZoneName)) {
			newZoneNameValidationMsg.textContent = "Please enter only alphabets in the starting!";
			newZoneNameValidationMsg.classList.remove('hidden');
			return;
		}

		if (totalCapacity < 0) {
			usedCapacityValidationMsg.textContent = "Capacity cannot be negative.";
			usedCapacityValidationMsg.classList.remove('hidden');
			return;
		}

		const newZone = { zone, totalCapacity, usedCapacity, availableCapacity };

		try {
			const response = await fetch('/api/space/allocate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newZone)
			});

			if (!response.ok) {
				throw new Error('Failed to create new zone.');
			}

			logEvent(`Created new space zone '${zone}' with capacity ${totalCapacity}.`);
			createForm.reset();
			await renderSpace(); // Re-render the page to show the new zone
			showToast('Space zone created', 'success'); 

		} catch (error) {
			console.error("Error creating new zone:", error);
			logEvent(`Failed to create new zone: ${zone}.`);
		}
	});

	// 3. Update capacity logic (PUT)
	const updateForm = document.getElementById('space-form');
	updateForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const spaceId = document.getElementById('spaceId-update').value;
		const newTotalCapacity = parseInt(document.getElementById('updateTotalCapacity').value);
		const newUsedCapacity = parseInt(document.getElementById('updateUsedCapacity').value);
		const newAvailableCapacity = newTotalCapacity - newUsedCapacity;

		const existingZone = appState.space.zones.find(z => z.spaceId === parseInt(spaceId));
		if (!existingZone) {
			console.error("Zone not found for update.");
			logEvent("Update failed: Zone not found.");
			return;
		}

		// Final validation for capacity
		if (newUsedCapacity > newTotalCapacity) {
			usedCapacityValidationMsg.classList.remove('hidden');
			return;
		}
		if (newTotalCapacity < 0 || newUsedCapacity < 0) {
			usedCapacityValidationMsg.textContent = "Capacity values cannot be negative.";
			usedCapacityValidationMsg.classList.remove('hidden');
			return;
		}

		const updatedSpace = {
			...existingZone,
			totalCapacity: newTotalCapacity,
			usedCapacity: newUsedCapacity,
			availableCapacity: newAvailableCapacity
		};

		try {
			const response = await fetch(`/api/space/free/${spaceId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedSpace)
			});

			if (!response.ok) {
				throw new Error('Failed to update zone capacity.');
			}

			logEvent(`Updated total capacity for zone '${existingZone.zone}' from ${existingZone.totalCapacity} to ${newTotalCapacity}.`);
			updateForm.reset();
			await renderSpace(); // Re-render the page to show the updated zone
			showToast('Space zone updated', 'success');
		} catch (error) {
			console.error("Error updating zone capacity:", error);
			logEvent(`Failed to update capacity for zone: ${existingZone.zone}.`);
		}
	});
};

// --- Shipment Module ---
const renderShipment = async () => {
	const contentArea = document.getElementById('content-area');
	contentArea.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-3xl font-bold text-gray-800">Shipment Handling</h2>

                    <div class="bg-white p-6 rounded-xl shadow-custom">
                        <h3 class="text-xl font-semibold text-gray-700 mb-4">Receive New Shipment</h3>
                        <form id="receive-shipment-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select id="receiveItemId" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500" required>
                                <option value="" disabled selected>Select Item to Receive</option>
                            </select>
                            <input type="number" id="receiveQuantity" placeholder="Quantity" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500" min="1" required>
                            
                            <div id="new-item-fields" class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                                <input type="text" id="newItemName" placeholder="New Item Name" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500 w-full">
                                <input type="text" id="newItemCategory" placeholder="Category" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500 w-full">
                                <select id="newItemLocation" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500">
                                    <option value="" disabled selected>Select Storage Zone</option>
                                </select>
                            </div>
                            
                            <input type="text" id="receiveOrigin" placeholder="Origin" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500" required>
                            <input type="text" id="receiveDestination" placeholder="Destination" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500" required>
                            <input type="date" id="receiveExpectedDate" class="p-2 border rounded-md focus:ring-2 focus:ring-green-500" required>
                            <div class="md:col-span-2 flex justify-end">
                                <button type="submit" class="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105">Receive Shipment</button>
                            </div>
                        </form>
                    </div>

                    <div class="bg-white p-6 rounded-xl shadow-custom">
                        <h3 class="text-xl font-semibold text-gray-700 mb-4">Dispatch Existing Shipment</h3>
                        <form id="dispatch-shipment-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="number" id="dispatchShipmentId" placeholder="Shipment ID" class="p-2 border rounded-md focus:ring-2 focus:ring-blue-500" min="1" required>
                            <input type="number" id="dispatchQuantity" placeholder="Quantity to Dispatch" class="p-2 border rounded-md focus:ring-2 focus:ring-blue-500" min="1" required>
                            <button type="submit" class="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-105">Dispatch Shipment</button>
                        </form>
                    </div>

                    <div class="bg-white p-6 rounded-xl shadow-custom">
                        <h3 class="text-xl font-semibold text-gray-700 mb-4">All Shipments</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="shipment-table-body" class="bg-white divide-y divide-gray-200">
                                </tbody>
                            </table>
                        </div>
                        <div id="no-shipments-message" class="text-center py-4 text-gray-500 hidden">
                            No shipments found.
                        </div>
                    </div>
                </div>
            `;
	await fetchAndRenderShipments();
	setupShipmentEventListeners();
};

const fetchAndRenderShipments = async () => {
	try {
		const [shipmentResponse, inventoryResponse, spaceResponse] = await Promise.all([
			fetch('/api/shipments/view'),
			fetch('/api/inventory/viewItems'),
			fetch('/api/space/view')
		]);

		if (!shipmentResponse.ok || !inventoryResponse.ok || !spaceResponse.ok) {
			throw new Error('Failed to fetch data from the backend.');
		}

		appState.shipments = await shipmentResponse.json();
		appState.inventory = await inventoryResponse.json();
		appState.space.zones = await spaceResponse.json();
		appState.saveState();

		renderShipmentTable(appState.shipments);
		renderInventoryDropdown(appState.inventory);
		renderSpaceDropdownsForShipment(appState.space.zones);

	} catch (error) {
		console.error("Error fetching shipment data:", error);
		logEvent("Failed to fetch shipment data.");
	}
};

const renderShipmentTable = (shipments) => {
	const tableBody = document.getElementById('shipment-table-body');
	const noShipmentsMessage = document.getElementById('no-shipments-message');
	tableBody.innerHTML = '';

	if (shipments.length === 0) {
		noShipmentsMessage.classList.remove('hidden');
		return;
	}
	noShipmentsMessage.classList.add('hidden');

	shipments.forEach(shipment => {
		const statusClass = shipment.status === 'RECEIVED' ? 'text-green-600' : (shipment.status === 'DISPATCHED' ? 'text-red-600' : 'text-yellow-600');
		const row = document.createElement('tr');
		row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.shipmentId}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.origin}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.destination}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${statusClass}">${shipment.status}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.inventory.itemId}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${shipment.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="trackShipment(${shipment.shipmentId})" class="text-blue-600 hover:text-blue-900 mr-4"><i class="fas fa-search"></i></button>
                    </td>
                `;
		tableBody.appendChild(row);
	});
};

const renderInventoryDropdown = (items) => {
	const receiveItemIdSelect = document.getElementById('receiveItemId');
	receiveItemIdSelect.innerHTML = '<option value="" disabled selected>Select Item to Receive</option>';
	items.forEach(item => {
		const option = document.createElement('option');
		option.value = item.itemId;
		option.textContent = `ID: ${item.itemId} - ${item.itemName} (${item.quantity} in stock)`;
		receiveItemIdSelect.appendChild(option);
	});
	const newItemOption = document.createElement('option');
	newItemOption.value = 'new';
	newItemOption.textContent = 'Other / New Item';
	receiveItemIdSelect.appendChild(newItemOption);
};

const renderSpaceDropdownsForShipment = (zones) => {
	const newItemLocationSelect = document.getElementById('newItemLocation');
	newItemLocationSelect.innerHTML = '<option value="" disabled selected>Select Storage Zone</option>';
	zones.forEach(zone => {
		const option = document.createElement('option');
		option.value = zone.spaceId;
		option.textContent = zone.zone;
		newItemLocationSelect.appendChild(option);
	});
};

const handleReceiveItemChange = () => {
    const receiveItemIdSelect = document.getElementById('receiveItemId');
    const newItemFields = document.getElementById('new-item-fields');
    if (receiveItemIdSelect.value === 'new') {
        newItemFields.classList.remove('hidden');
    } else {
        newItemFields.classList.add('hidden');
    }
};

const receiveShipment = async (e) => {
	e.preventDefault();
	const receiveItemIdSelect = document.getElementById('receiveItemId');
    const isNewItem = receiveItemIdSelect.value === 'new';

    let inventoryId;
    let newInventory = null;
	
    const origin = document.getElementById('receiveOrigin').value.trim();
	const destination = document.getElementById('receiveDestination').value.trim();

	// Validation for Origin and Destination
    if (!origin) {
        alert('Origin cannot be empty.');
        return;
    }
    if (!destination) {
        alert('Destination cannot be empty.');
        return;
    }

    if (isNewItem) {
        const newItemName = document.getElementById('newItemName').value.trim();
        const newItemCategory = document.getElementById('newItemCategory').value.trim();
        const newItemLocation = document.getElementById('newItemLocation').value;
		
        if (!newItemName || !newItemCategory || !newItemLocation) {
            alert('Please fill out all fields for the new item.');
            return;
        }

        newInventory = {
            itemName: newItemName,
            category: newItemCategory,
            quantity: 0, 
            space: { spaceId: parseInt(newItemLocation) }
        };

        try {
            const addResponse = await fetch('/api/inventory/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventory)
            });

            if (!addResponse.ok) {
                const errorResult = await addResponse.json();
                throw new Error(errorResult.body || 'Failed to add new item.');
            }

            const addedItem = await addResponse.json();
            inventoryId = addedItem.itemId;
        } catch (error) {
            console.error("Error adding new item for shipment:", error);
            alert(`Error: ${error.message}`);
            return;
        }
    } else {
        inventoryId = parseInt(receiveItemIdSelect.value);
    }
	
	const quantity = parseInt(document.getElementById('receiveQuantity').value);
	const expectedDeliveryDate = document.getElementById('receiveExpectedDate').value;

	const newShipment = {
		origin,
		destination,
		quantity,
		status: "RECEIVED", 
		expectedDeliveryDate,
		inventory: { itemId: inventoryId }
	};

	try {
		const response = await fetch('/api/shipments/receive', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(newShipment)
		});

		const result = await response.json();

		if (response.status === 400) {
			throw new Error(result); 
		}

		if (!response.ok) {
			throw new Error('Failed to receive shipment. Please check input data.');
		}

		logEvent(`Received new shipment for item ID ${inventoryId}.`);
		document.getElementById('receive-shipment-form').reset();
		await fetchAndRenderShipments();
		showToast('Shipment received', 'success'); 
	} catch (error) {
		console.error("Error receiving shipment:", error);
		alert(`Error: ${error.message}`);
		logEvent(`Failed to receive shipment for item ID ${inventoryId}.`);
	}
};

// --- New Helper Function to Update Local State ---
const updateShipmentStatus = (shipmentId, newStatus) => {
	const shipmentToUpdate = appState.shipments.find(s => s.shipmentId === shipmentId);
	if (shipmentToUpdate) {
		shipmentToUpdate.status = newStatus;
		appState.saveState();
	}
};

// --- Modified dispatchShipment Function ---
const dispatchShipment = async (shipmentId, quantityToDispatch) => {
	// Find the shipment and its current quantity
	const shipment = appState.shipments.find(s => s.shipmentId === shipmentId);
	if (!shipment) {
		alert('Shipment not found.');
		return;
	}


	// Check if there is any quantity remaining in the shipment
	if (shipment.quantity <= 0) {
		alert('This shipment has no more items to dispatch.');
		return;
	}
	if (quantityToDispatch > shipment.quantity) {
		alert(`Cannot dispatch ${quantityToDispatch}. The shipment only contains ${shipment.quantity} items.`);
		return;
	}
	if (quantityToDispatch <= 0) {
		alert('Quantity to dispatch must be greater than 0.');
		return;
	}

	showConfirmationModal(`Are you sure you want to dispatch ${quantityToDispatch} items for shipment ID ${shipmentId}? This will reduce the inventory count.`, async () => {
		try {
			const response = await fetch(`/api/shipments/dispatch/${shipmentId}?quantityToDispatch=${quantityToDispatch}`, {
				method: 'PUT'
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to dispatch shipment.');
			}

			// Immediately update the status in the local state and re-render the table for instant feedback
			updateShipmentStatus(shipmentId, 'DISPATCHED');
			renderShipmentTable(appState.shipments);

			logEvent(`Dispatched ${quantityToDispatch} items for shipment with ID: ${shipmentId}.`);

			// Re-fetch all data to ensure the local state is fully synchronized with the backend
			await fetchAndRenderShipments();
			showToast('Shipment dispatched', 'error'); // NEW
		} catch (error) {
			console.error("Error dispatching shipment:", error);
			alert(`Error: ${error.message}`);
			logEvent(`Failed to dispatch shipment with ID: ${shipmentId}.`);
		}
	});
};

const dispatchShipmentFromForm = (e) => {
	e.preventDefault();
	const shipmentId = parseInt(document.getElementById('dispatchShipmentId').value);
	const quantity = parseInt(document.getElementById('dispatchQuantity').value);
	if (shipmentId && quantity) {
		dispatchShipment(shipmentId, quantity);
		document.getElementById('dispatch-shipment-form').reset();
	} else {
		alert('Please enter both a valid shipment ID and a quantity.');
	}
};

const trackShipment = async (shipmentId) => {
	try {
		const response = await fetch(`/api/shipments/track/${shipmentId}`);
		if (!response.ok) {
			throw new Error('Shipment not found.');
		}
		const shipment = await response.json();

		const shipmentDetailsModal = document.getElementById('shipment-details-modal');
		const shipmentDetailsContent = document.getElementById('shipment-details-content');

		const inventoryItem = appState.inventory.find(inv => inv.itemId === (shipment.inventory ? shipment.inventory.itemId : null));
		const itemName = inventoryItem ? inventoryItem.itemName : 'N/A';

		shipmentDetailsContent.innerHTML = `
                    <p><strong>Shipment ID:</strong> ${shipment.shipmentId}</p>
                    <p><strong>Item Name:</strong> ${itemName}</p>
                    <p><strong>Quantity:</strong> ${shipment.quantity}</p>
                    <p><strong>Origin:</strong> ${shipment.origin}</p>
                    <p><strong>Destination:</strong> ${shipment.destination}</p>
                    <p><strong>Status:</strong> <span class="font-semibold text-lg ${shipment.status === 'RECEIVED' ? 'text-green-600' : (shipment.status === 'DISPATCHED' ? 'text-red-600' : 'text-yellow-600')}">${shipment.status}</span></p>
                    <p><strong>Expected Delivery:</strong> ${shipment.expectedDeliveryDate}</p>
                `;

		shipmentDetailsModal.classList.remove('hidden');

	} catch (error) {
		console.error("Error tracking shipment:", error);
		alert(`Error: ${error.message}`);
	}
};

const setupShipmentEventListeners = () => {
	const receiveShipmentForm = document.getElementById('receive-shipment-form');
	if (receiveShipmentForm) {
		receiveShipmentForm.addEventListener('submit', receiveShipment);
	}
	const dispatchShipmentForm = document.getElementById('dispatch-shipment-form');
	if (dispatchShipmentForm) {
		dispatchShipmentForm.addEventListener('submit', dispatchShipmentFromForm);
	}
	const receiveItemIdSelect = document.getElementById('receiveItemId');
    if (receiveItemIdSelect) {
        receiveItemIdSelect.addEventListener('change', handleReceiveItemChange);
    }
};

// --- Maintenance Module ---
const renderMaintenance = () => {
    // Make sure the maintenance section is visible
    document.getElementById('maintenance-module')?.classList.remove('hidden');

    // Populate table and set up form handlers
    fetchAndRenderMaintenance();
    setupMaintenanceEventListeners();
};

const fetchAndRenderMaintenance = async () => {

	try {
		const response = await fetch('/api/maintenance/view');
		if (!response.ok) throw new Error('Failed to fetch maintenance schedules.');
		appState.maintenance = await response.json();
		appState.saveState();
		renderMaintenanceTable(appState.maintenance);
	} 
	catch (error) {
		console.error("Error fetching maintenance data:", error);
		logEvent("Failed to fetch maintenance data.");
	}

};

const renderMaintenanceTable = (schedules) => {
	const tableBody = document.getElementById('maintenance-table-body');
	const noMaintenanceMessage = document.getElementById('no-maintenance-message');
	tableBody.innerHTML = '';
	if (schedules.length === 0) {
		noMaintenanceMessage.classList.remove('hidden');
		return;
	}

	noMaintenanceMessage.classList.add('hidden');
	schedules.forEach(schedule => {
		const row = document.createElement('tr');
		row.innerHTML = `
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${schedule.scheduleId}</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${schedule.taskDescription}</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${schedule.equipmentId || 'N/A'}</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${new Date(schedule.scheduledDate).toLocaleString()}</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${schedule.completionStatus}</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<button onclick="editMaintenanceItem(${schedule.scheduleId})" class="text-blue-600 hover:text-blue-900 mr-4"><i class="fas fa-edit"></i></button>
</td>
`;
		tableBody.appendChild(row);
	});
};

const addMaintenanceItem = async (e) => {

	e.preventDefault();

	const taskDescription = document.getElementById('taskDescription').value.trim();
	const equipmentId = document.getElementById('equipmentId').value.trim();
	const scheduledDate = document.getElementById('scheduledDate').value;
	const validationMessage = document.getElementById('task-description-validation');
	// Validation: Task description cannot be empty or whitespace only

	if (!taskDescription) {

		validationMessage.classList.remove('hidden');

		return;

	}
	/*if (typeof equipmentId === 'string' && equipmentId.trim() !== '') {
	    alert('Only numbers are valid in Equipment ID!');
	    return;
	}
	*/
	
	if (isNaN(equipmentId)) {
		    alert("Only numbers are valid in Equipment ID!");
		    return;
		}

	 else {

		validationMessage.classList.add('hidden');

	}



	const newSchedule = {

		taskDescription,
		equipmentId,
		scheduledDate: scheduledDate,

		completionStatus: "SCHEDULED"

	};



	try {

		const response = await fetch('/api/maintenance/add', {

			method: 'POST',

			headers: { 'Content-Type': 'application/json' },

			body: JSON.stringify(newSchedule)

		});

		const result = await response.json();

		if (!response.ok) {

			throw new Error(result.body || 'Failed to add schedule.');

		}

		logEvent(`Added new maintenance schedule for '${taskDescription}'.`);

		document.getElementById('add-maintenance-form').reset();

		await fetchAndRenderMaintenance();
		showToast('Maintenance schedule created', 'success'); // NEW

	} catch (error) {

		console.error("Error adding maintenance schedule:", error);

		showMessageModal(`Error: ${error.message}`);

		logEvent(`Failed to add new maintenance schedule for '${taskDescription}'.`);

	}

};

// Function to open the update modal and populate it with data

const editMaintenanceItem = (scheduleId) => {

	const schedule = appState.maintenance.find(s => s.scheduleId === scheduleId);

	if (schedule) {

		document.getElementById('updateScheduleId').value = schedule.scheduleId;

		document.getElementById('updateTaskDescription').value = schedule.taskDescription;

		document.getElementById('updateEquipmentId').value = schedule.equipmentId;

		// Format date for datetime-local input

		const formattedDate = new Date(schedule.scheduledDate).toISOString().substring(0, 16);

		document.getElementById('updateScheduledDate').value = formattedDate;

		document.getElementById('updateCompletionStatus').value = schedule.completionStatus;

		document.getElementById('maintenance-update-modal').classList.remove('hidden');

	}

};

const updateMaintenanceItem = async (e) => {

	e.preventDefault();

	const scheduleId = parseInt(document.getElementById('updateScheduleId').value);

	const taskDescription = document.getElementById('updateTaskDescription').value.trim();
	const equipmentId = document.getElementById('updateEquipmentId').value.trim();

	const scheduledDate = document.getElementById('updateScheduledDate').value;

	const completionStatus = document.getElementById('updateCompletionStatus').value;

	// Simple validation for update form

	if (!taskDescription) {

		showMessageModal('Task description cannot be empty.');

		return;

	}
	
	if (!equipmentId) {
		showMessageModal('Equipment ID cannot be empty.');
		return;
	}
	
	const updatedSchedule = {

		taskDescription,
		equipmentId,
		scheduledDate,

		completionStatus,

		lastUpdated: new Date().toISOString()

	};

	try {

		// Corrected API endpoint to use PUT method and include scheduleId in the URL

		const response = await fetch(`/api/maintenance/update/${scheduleId}`, {

			method: 'PUT',

			headers: { 'Content-Type': 'application/json' },

			body: JSON.stringify(updatedSchedule)

		});

		if (!response.ok) {

			const errorText = await response.text();

			throw new Error(errorText || 'Failed to update schedule.');

		}

		logEvent(`Updated maintenance schedule with ID: ${scheduleId}.`);

		closeModal('maintenance-update-modal');

		await fetchAndRenderMaintenance();
		
		showToast('Maintenance schedule updated', 'success'); // NEW

	} catch (error) {

		console.error("Error updating schedule:", error);

		showMessageModal(`Error: ${error.message}`);

		logEvent(`Failed to update maintenance schedule with ID: ${scheduleId}.`);

	}

};

const setupMaintenanceEventListeners = () => {

	const addMaintenanceForm = document.getElementById('add-maintenance-form');

	if (addMaintenanceForm) addMaintenanceForm.addEventListener('submit', addMaintenanceItem);


	const updateMaintenanceForm = document.getElementById('update-maintenance-form');

	if (updateMaintenanceForm) updateMaintenanceForm.addEventListener('submit', updateMaintenanceItem);

};

// --- Reports Module ---
const renderReports = async () => {
	const contentArea = document.getElementById('content-area');
	contentArea.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-3xl font-bold text-gray-800">Reports and Activity Log</h2>
                    <div class="bg-white p-6 rounded-xl shadow-custom flex items-center justify-between">
                        <h3 class="text-xl font-semibold text-gray-700">Recent Activity</h3>
                        <button onclick="exportReport('activity-log')" class="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105">
                            <i class="fas fa-file-pdf mr-2"></i>Export as PDF
                        </button>
                    </div>
                    <div id="activity-log-container" class="bg-white p-6 rounded-xl shadow-custom max-h-96 overflow-y-auto">
                        <ul id="activity-log" class="space-y-4 text-gray-700">
                        </ul>
                    </div>
                </div>
            `;
	await fetchAndRenderReports();
};

const fetchAndRenderReports = async () => {
	try {
		const response = await fetch('/api/reports/view');
		if (!response.ok) {
			throw new Error('Failed to fetch reports.');
		}
		const reports = await response.json();
		const logList = document.getElementById('activity-log');
		logList.innerHTML = '';

		if (reports.length === 0) {
			logList.innerHTML = '<li class="text-center text-gray-500">No recent activity.</li>';
		} else {
			reports.reverse().forEach(report => {
				const listItem = document.createElement('li');
				listItem.className = 'border-b pb-2';
				listItem.innerHTML = `
                            <p class="text-sm text-gray-500">${new Date(report.generatedOn).toLocaleString()}</p>
                            <p>${report.details}</p>
                        `;
				logList.appendChild(listItem);
			});
		}
	} catch (error) {
		console.error("Error fetching reports:", error);
		logEvent("Failed to fetch reports from the backend.");
	}
};

const exportReport = async (reportType) => {
	if (reportType === 'activity-log') {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF('p', 'mm', 'a4');
		const element = document.getElementById('activity-log-container');
		const originalOverflowStyle = element.style.overflowY;
		const originalHeightStyle = element.style.maxHeight;

		// Temporarily remove overflow and set height to auto to capture full content
		element.style.overflowY = 'visible';
		element.style.maxHeight = 'none';

		// Use a higher scale to generate a clearer image for the PDF
		const scale = 2; // Increase scale for better resolution

		html2canvas(element, {
			scale: scale
		}).then(canvas => {
			const imgData = canvas.toDataURL('image/png');
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 295; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;
			let position = 0;

			// Add the first page
			doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			// Add new pages for remaining content
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				doc.addPage();
				doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Restore original styles
			element.style.overflowY = originalOverflowStyle;
			element.style.maxHeight = originalHeightStyle;

			// Save the PDF
			doc.save('activity_log.pdf');
		});
	}
};
// --- Main Application Logic ---

const handleNavigation = async (module) => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-module="${module}"]`).classList.add('active');

    const contentArea = document.getElementById('content-area');
    const maintenanceSection = document.getElementById('maintenance-module');
    const inventorySection = document.getElementById('inventory-module');

    // Handle module visibility
    if (module === 'maintenance') {
        contentArea.classList.add('hidden');
        inventorySection?.classList.add('hidden');
        maintenanceSection?.classList.remove('hidden');
    } else if (module === 'inventory') {
        contentArea.classList.add('hidden');
        maintenanceSection?.classList.add('hidden');
        inventorySection?.classList.remove('hidden');
    } else {
        maintenanceSection?.classList.add('hidden');
        inventorySection?.classList.add('hidden');
        contentArea.classList.remove('hidden');
    }

    // Render the requested module
    switch (module) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'inventory':
            await renderInventory();
            break;
        case 'space':
            await renderSpace();
            setupSpaceEventListeners();
            break;
        case 'shipment':
            await renderShipment();
            setupShipmentEventListeners();
            break;
        case 'maintenance':
            renderMaintenance();
            break;
        case 'reports':
            await renderReports();
            break;
        default:
            renderDashboard();
            break;
    }
};

document.querySelectorAll('.nav-link').forEach(link => {
	link.addEventListener('click', (e) => {
		e.preventDefault();
		const module = e.currentTarget.getAttribute('data-module');
		handleNavigation(module);
	});
});

handleNavigation('dashboard');