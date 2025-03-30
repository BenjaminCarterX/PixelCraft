class PixelEditor {
    constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.showGrid = false;
        this.gridSize = 20;
        this.brushSize = 2;
        
        this.init();
    }
    
    init() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.setupEventListeners();
        this.setupTools();
        this.updateColorSwatches();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            this.updateColorSwatches();
        });
        
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                this.currentColor = e.target.dataset.color;
                document.getElementById('colorPicker').value = this.currentColor;
                this.updateColorSwatches();
            });
        });
        
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('sizeDisplay').textContent = this.brushSize;
        });
        
        document.getElementById('save').addEventListener('click', () => this.saveCanvas());
        document.getElementById('load').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.loadImage(e));
    }
    
    setupTools() {
        const tools = document.querySelectorAll('.tool');
        tools.forEach(tool => {
            tool.addEventListener('click', (e) => {
                if (e.target.id === 'grid') {
                    this.toggleGrid();
                    return;
                }
                
                if (e.target.id === 'clear') {
                    this.clearCanvas();
                    return;
                }
                
                tools.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.id;
            });
        });
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.redraw();
    }
    
    drawGrid() {
        if (!this.showGrid) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    redraw() {
        this.drawGrid();
    }
    
    updateColorSwatches() {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
            if (swatch.dataset.color === this.currentColor) {
                swatch.classList.add('active');
            }
        });
    }
    
    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.redraw();
        }
    }
    
    saveCanvas() {
        const link = document.createElement('a');
        link.download = 'pixelcraft_' + new Date().getTime() + '.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    loadImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
                this.redraw();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.draw(e);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        
        if (this.currentTool === 'pencil') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = 10;
        }
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelEditor();
});