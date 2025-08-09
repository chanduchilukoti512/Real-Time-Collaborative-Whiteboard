class Whiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#2563eb';
        this.currentSize = 3;
        this.brushSizes = [1, 2, 3, 5, 8, 12, 16];
        
        this.initializeCanvas();
        this.bindEvents();
        this.updateUI();
    }

    initializeCanvas() {
        this.resizeCanvas();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    bindEvents() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTool(e.currentTarget.dataset.tool);
            });
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.setColor(e.currentTarget.dataset.color);
            });
        });

        // Size controls
        document.getElementById('increaseSize').addEventListener('click', () => {
            this.changeBrushSize(1);
        });
        
        document.getElementById('decreaseSize').addEventListener('click', () => {
            this.changeBrushSize(-1);
        });

        // Canvas drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCanvas();
        });
    }

    getEventPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getEventPos(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        
        if (this.currentTool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        
        this.ctx.lineWidth = this.currentSize;
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getEventPos(e);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Update cursor
        this.canvas.className = `canvas ${tool}`;
        
        this.updateUI();
    }

    setColor(color) {
        this.currentColor = color;
        
        // Update color options
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        this.updateUI();
    }

    changeBrushSize(direction) {
        const currentIndex = this.brushSizes.indexOf(this.currentSize);
        let newIndex = currentIndex + direction;
        
        newIndex = Math.max(0, Math.min(this.brushSizes.length - 1, newIndex));
        this.currentSize = this.brushSizes[newIndex];
        
        // Update size control buttons
        document.getElementById('decreaseSize').disabled = newIndex === 0;
        document.getElementById('increaseSize').disabled = newIndex === this.brushSizes.length - 1;
        
        this.updateUI();
    }

    updateUI() {
        // Update size preview
        const sizePreview = document.getElementById('sizePreview');
        const size = Math.max(this.currentSize, 2);
        sizePreview.style.width = `${size}px`;
        sizePreview.style.height = `${size}px`;
        
        // Update size value
        document.getElementById('sizeValue').textContent = `${this.currentSize}px`;
        
        // Update status bar
        const toolStatus = document.getElementById('toolStatus');
        const colorIndicator = document.getElementById('colorIndicator');
        
        if (this.currentTool === 'pen') {
            toolStatus.innerHTML = `Tool: <strong>Pen</strong> | Color: <span id="colorIndicator" class="color-indicator"></span>`;
            colorIndicator.style.backgroundColor = this.currentColor;
        } else {
            toolStatus.innerHTML = `Tool: <strong>Eraser</strong>`;
        }
        
        // Update color palette visibility
        const colorPalette = document.getElementById('colorPalette');
        colorPalette.style.display = this.currentTool === 'pen' ? 'flex' : 'none';
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the whiteboard?')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    saveCanvas() {
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize the whiteboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Whiteboard();
});