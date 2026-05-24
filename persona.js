// Inventory Items - Dynamic positioning, dragging, and lightbox
class InventoryManager {
    constructor() {
        this.items = [];
        this.draggingItem = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.itemStartX = 0;
        this.itemStartY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.animationId = null;
        this.easing = 0.92; // Friction factor
        this.minVelocity = 0.1;
        this.dragThreshold = 5; // pixels moved to consider it a drag
        this.hasMoved = false;
        
        // Bind methods to preserve 'this' context
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    init() {
        const container = document.querySelector('.inventory-items');
        if (!container) return;

        // Create lightbox overlay
        this.createLightbox();

        // Get all inventory items
        this.items = Array.from(container.querySelectorAll('.inventory-item'));
        
        if (this.items.length === 0) return;

        // Set initial random positions and rotations
        this.items.forEach((item) => {
            this.setRandomPosition(item, container);
            this.attachItemListeners(item);
        });
    }

    setRandomPosition(item, container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const itemWidth = item.offsetWidth;
        const itemHeight = item.offsetHeight;

        // Random position with some constraints
        const maxX = Math.max(0, containerWidth - itemWidth - 20);
        const maxY = Math.max(0, containerHeight - itemHeight - 20);
        
        const x = Math.random() * maxX + 10;
        const y = Math.random() * maxY + 10;
        const rotation = (Math.random() - 0.5) * 15; // -7.5 to 7.5 degrees

        item.style.left = x + 'px';
        item.style.top = y + 'px';
        item.style.transform = `rotate(${rotation}deg)`;

        // Store initial position for reference
        item.dataset.posX = x;
        item.dataset.posY = y;
    }

    attachItemListeners(item) {
        item.addEventListener('mousedown', (e) => this.onDragStart(e, item));
        item.addEventListener('touchstart', (e) => this.onDragStart(e, item), { passive: false });
        
        // Click to lightbox (if not dragged)
        item.addEventListener('click', (e) => {
            if (!this.hasMoved) {
                this.openLightbox(item.src);
            }
        });
    }

    onDragStart(e, item) {
        // Don't prevent default for touch to allow native scrolling initially
        if (e.type !== 'touchstart') {
            e.preventDefault();
        }
        
        this.draggingItem = item;
        this.hasMoved = false;
        item.classList.add('dragging');

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.itemStartX = parseFloat(item.style.left);
        this.itemStartY = parseFloat(item.style.top);
        this.lastX = clientX;
        this.lastY = clientY;

        // Add event listeners with proper context
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('touchmove', this.onDragMove, { passive: false });
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchend', this.onDragEnd);
    }

    onDragMove(e) {
        if (!this.draggingItem) return;

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        // Check if movement exceeds threshold
        if (Math.abs(deltaX) > this.dragThreshold || Math.abs(deltaY) > this.dragThreshold) {
            this.hasMoved = true;
            e.preventDefault();
        }

        if (!this.hasMoved) return;

        this.velocityX = clientX - this.lastX;
        this.velocityY = clientY - this.lastY;

        const newX = this.itemStartX + deltaX;
        const newY = this.itemStartY + deltaY;

        this.draggingItem.style.left = newX + 'px';
        this.draggingItem.style.top = newY + 'px';

        this.lastX = clientX;
        this.lastY = clientY;
    }

    onDragEnd(e) {
        if (!this.draggingItem) return;

        const item = this.draggingItem;
        item.classList.remove('dragging');

        // Apply easing if item was moved
        if (this.hasMoved) {
            this.applyEasing(item);
        }

        this.draggingItem = null;
        this.hasMoved = false;

        // Remove event listeners
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchend', this.onDragEnd);
    }

    applyEasing(item) {
        const container = document.querySelector('.inventory-items');
        if (!container) return;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const itemWidth = item.offsetWidth;
        const itemHeight = item.offsetHeight;

        let currentX = parseFloat(item.style.left);
        let currentY = parseFloat(item.style.top);
        let velX = this.velocityX;
        let velY = this.velocityY;

        const animate = () => {
            velX *= this.easing;
            velY *= this.easing;

            currentX += velX;
            currentY += velY;

            // Boundary checks
            if (currentX < 0) {
                currentX = 0;
                velX = 0;
            }
            if (currentX + itemWidth > containerWidth) {
                currentX = containerWidth - itemWidth;
                velX = 0;
            }
            if (currentY < 0) {
                currentY = 0;
                velY = 0;
            }
            if (currentY + itemHeight > containerHeight) {
                currentY = containerHeight - itemHeight;
                velY = 0;
            }

            item.style.left = currentX + 'px';
            item.style.top = currentY + 'px';

            if (Math.abs(velX) > this.minVelocity || Math.abs(velY) > this.minVelocity) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        };

        animate();
    }

    createLightbox() {
        if (document.querySelector('.inventory-lightbox-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'inventory-lightbox-overlay';
        overlay.innerHTML = `
            <div class="inventory-lightbox-content">
                <img class="inventory-lightbox-image" src="" alt="">
                <button class="inventory-lightbox-close">✕</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeLightbox();
            }
        });

        // Close on close button click
        overlay.querySelector('.inventory-lightbox-close').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeLightbox();
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeLightbox();
            }
        });
    }

    openLightbox(src) {
        const overlay = document.querySelector('.inventory-lightbox-overlay');
        const image = overlay.querySelector('.inventory-lightbox-image');
        image.src = src;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const overlay = document.querySelector('.inventory-lightbox-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize Persona Stamp
function initPersonaStamp() {
    const stampEl = document.getElementById('personaStamp');
    if (!stampEl) return;

    const params = new URLSearchParams(window.location.search);
    const skinwalkerValue = params.get('skinwalker');
    if (skinwalkerValue === null) return;

    const isSkinwalker = skinwalkerValue === 'true';
    stampEl.classList.add(isSkinwalker ? 'skinwalker' : 'notskinwalker');

    const stampText = document.getElementById('personaStampText');
    if (stampText) {
        stampText.textContent = isSkinwalker ? 'SKINWALKER' : 'NIET DE SKINWALKER';
    }

    stampEl.style.display = 'block';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPersonaStamp();
    const inventoryManager = new InventoryManager();
    inventoryManager.init();
});
