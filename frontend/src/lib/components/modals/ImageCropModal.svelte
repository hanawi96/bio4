<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let imageUrl: string;
	export let aspectRatio: number = 3; // Default 3:1 for cover
	export let title: string = 'Adjust Image';
	export let outputWidth: number = 1200;
	export let outputHeight: number = 400;

	const dispatch = createEventDispatcher();

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let image: HTMLImageElement;
	let ctx: CanvasRenderingContext2D;

	// Crop box state (in canvas coordinates)
	let cropBox = { x: 0, y: 0, width: 0, height: 0 };
	
	// Image state
	let imageScale = 1;
	let imagePosition = { x: 0, y: 0 };
	
	// Drag state
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };

	// Canvas dimensions
	let canvasWidth = 0;
	let canvasHeight = 0;

	onMount(async () => {
		await loadImage();
		setupCanvas();
		initializeCropBox();
		render();
		
		// Add event listeners
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', handleResize);
	});

	async function loadImage() {
		return new Promise<void>((resolve, reject) => {
			image = new Image();
			image.onload = () => resolve();
			image.onerror = reject;
			image.src = imageUrl;
		});
	}

	function setupCanvas() {
		if (!container || !canvas) return;

		const rect = container.getBoundingClientRect();
		canvasWidth = rect.width;
		canvasHeight = rect.height;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		ctx = canvas.getContext('2d')!;
	}

	function initializeCropBox() {
		// Determine if this is a horizontal (landscape) or vertical (portrait) crop
		const isHorizontalCrop = aspectRatio > 1;

		if (isHorizontalCrop) {
			// Horizontal crop (e.g., cover 3:1): full width, move vertically
			const cropWidth = canvasWidth;
			const cropHeight = cropWidth / aspectRatio;

			cropBox = {
				x: 0,
				y: (canvasHeight - cropHeight) / 2,
				width: cropWidth,
				height: cropHeight
			};

			// Scale image to fit crop box width
			const scaleToFitWidth = cropWidth / image.width;
			imageScale = scaleToFitWidth;

			// Center image vertically
			const scaledHeight = image.height * imageScale;
			imagePosition = {
				x: 0,
				y: (canvasHeight - scaledHeight) / 2
			};
		} else {
			// Vertical crop (e.g., background 9:16): full height, move horizontally
			const cropHeight = canvasHeight;
			const cropWidth = cropHeight * aspectRatio;

			cropBox = {
				x: (canvasWidth - cropWidth) / 2,
				y: 0,
				width: cropWidth,
				height: cropHeight
			};

			// Scale image to fit crop box height
			const scaleToFitHeight = cropHeight / image.height;
			imageScale = scaleToFitHeight;

			// Center image horizontally
			const scaledWidth = image.width * imageScale;
			imagePosition = {
				x: (canvasWidth - scaledWidth) / 2,
				y: 0
			};
		}
	}

	function render() {
		if (!ctx || !image) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		// Draw image (scaled & positioned)
		ctx.save();
		ctx.translate(imagePosition.x, imagePosition.y);
		ctx.scale(imageScale, imageScale);
		ctx.drawImage(image, 0, 0);
		ctx.restore();

		// Draw dark overlay
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Clear crop box area (make it transparent)
		ctx.clearRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

		// Redraw image in crop box area
		ctx.save();
		ctx.translate(imagePosition.x, imagePosition.y);
		ctx.scale(imageScale, imageScale);
		ctx.drawImage(image, 0, 0);
		ctx.restore();

		// Draw crop box border
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 3;
		ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

		// Draw grid lines (rule of thirds)
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]);

		// Vertical lines
		const thirdWidth = cropBox.width / 3;
		ctx.beginPath();
		ctx.moveTo(cropBox.x + thirdWidth, cropBox.y);
		ctx.lineTo(cropBox.x + thirdWidth, cropBox.y + cropBox.height);
		ctx.moveTo(cropBox.x + thirdWidth * 2, cropBox.y);
		ctx.lineTo(cropBox.x + thirdWidth * 2, cropBox.y + cropBox.height);
		ctx.stroke();

		// Horizontal lines
		const thirdHeight = cropBox.height / 3;
		ctx.beginPath();
		ctx.moveTo(cropBox.x, cropBox.y + thirdHeight);
		ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + thirdHeight);
		ctx.moveTo(cropBox.x, cropBox.y + thirdHeight * 2);
		ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + thirdHeight * 2);
		ctx.stroke();

		ctx.setLineDash([]);

		// Draw edge handles based on crop orientation
		const isHorizontalCrop = aspectRatio > 1;
		if (isHorizontalCrop) {
			// Horizontal crop: draw top/bottom handles
			drawEdgeHandle(ctx, cropBox.x + cropBox.width / 2, cropBox.y, true); // Top
			drawEdgeHandle(ctx, cropBox.x + cropBox.width / 2, cropBox.y + cropBox.height, true); // Bottom
		} else {
			// Vertical crop: draw left/right handles
			drawEdgeHandle(ctx, cropBox.x, cropBox.y + cropBox.height / 2, false); // Left
			drawEdgeHandle(ctx, cropBox.x + cropBox.width, cropBox.y + cropBox.height / 2, false); // Right
		}
	}

	function drawEdgeHandle(ctx: CanvasRenderingContext2D, x: number, y: number, isHorizontal: boolean) {
		const width = isHorizontal ? 60 : 6;
		const height = isHorizontal ? 6 : 60;
		ctx.fillStyle = '#ffffff';
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 2;
		ctx.fillRect(x - width / 2, y - height / 2, width, height);
		ctx.strokeRect(x - width / 2, y - height / 2, width, height);
	}

	function handleMouseDown(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Always allow dragging anywhere on canvas
		isDragging = true;
		dragStart = { x, y };
		canvas.style.cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) {
			canvas.style.cursor = 'grab';
			return;
		}

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const dx = x - dragStart.x;
		const dy = y - dragStart.y;

		// Determine if this is horizontal or vertical crop
		const isHorizontalCrop = aspectRatio > 1;

		if (isHorizontalCrop) {
			// Horizontal crop: move image vertically
			imagePosition.y += dy;

			// Constrain image position (ensure crop box is always filled)
			const scaledHeight = image.height * imageScale;
			const minY = cropBox.y + cropBox.height - scaledHeight;
			const maxY = cropBox.y;

			imagePosition.y = Math.max(minY, Math.min(maxY, imagePosition.y));
		} else {
			// Vertical crop: move image horizontally
			imagePosition.x += dx;

			// Constrain image position (ensure crop box is always filled)
			const scaledWidth = image.width * imageScale;
			const minX = cropBox.x + cropBox.width - scaledWidth;
			const maxX = cropBox.x;

			imagePosition.x = Math.max(minX, Math.min(maxX, imagePosition.x));
		}

		dragStart = { x, y };
		render();
	}

	function handleMouseUp() {
		isDragging = false;
		canvas.style.cursor = 'grab';
	}

	function handleResize() {
		setupCanvas();
		initializeCropBox();
		render();
	}

	async function handleAccept() {
		const croppedBlob = await getCroppedImage();
		dispatch('accept', croppedBlob);
	}

	function handleCancel() {
		dispatch('cancel');
	}

	async function getCroppedImage(): Promise<Blob> {
		// Create output canvas
		const outputCanvas = document.createElement('canvas');
		outputCanvas.width = outputWidth;
		outputCanvas.height = outputHeight;
		const outputCtx = outputCanvas.getContext('2d')!;

		// Calculate source rectangle in original image coordinates
		const sourceX = (cropBox.x - imagePosition.x) / imageScale;
		const sourceY = (cropBox.y - imagePosition.y) / imageScale;
		const sourceWidth = cropBox.width / imageScale;
		const sourceHeight = cropBox.height / imageScale;

		// Draw cropped portion to output canvas
		outputCtx.drawImage(
			image,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			outputWidth,
			outputHeight
		);

		// Convert to Blob
		return new Promise((resolve) => {
			outputCanvas.toBlob(
				(blob) => {
					resolve(blob!);
				},
				'image/jpeg',
				0.92
			);
		});
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
	<div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
			<div class="flex items-center gap-3">
				<button
					on:click={handleCancel}
					class="p-2 hover:bg-gray-100 rounded-lg transition"
					title="Back"
				>
					<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
			</div>
			<button
				on:click={handleCancel}
				class="p-2 hover:bg-gray-100 rounded-lg transition"
				title="Close"
			>
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Canvas Container -->
		<div class="flex-1 p-6 overflow-hidden">
			<div bind:this={container} class="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
				<canvas
					bind:this={canvas}
					on:mousedown={handleMouseDown}
					on:mousemove={handleMouseMove}
					on:mouseup={handleMouseUp}
					on:mouseleave={handleMouseUp}
					class="w-full h-full"
				/>
			</div>
		</div>

		<!-- Info -->
		<div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
			<p class="text-sm text-gray-600 text-center">
				{#if aspectRatio > 1}
					Drag the image up or down to choose which part to display
				{:else}
					Drag the image left or right to choose which part to display
				{/if}
			</p>
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
			<button
				on:click={handleCancel}
				class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
			>
				Cancel
			</button>
			<button
				on:click={handleAccept}
				class="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition"
			>
				Accept
			</button>
		</div>
	</div>
</div>
