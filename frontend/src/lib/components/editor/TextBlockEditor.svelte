<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TextBlockContent } from '$lib/types';
	import { parseMarkdown } from '$lib/utils/textUtils';
	
	export let blockId: number | null = null;
	export let initialContent: TextBlockContent | null = null;
	
	const dispatch = createEventDispatcher();
	
	let text: string = initialContent?.text || '';
	let textAlign: 'left' | 'center' | 'right' = initialContent?.textAlign || 'center';
	
	let textarea: HTMLTextAreaElement;
	let showToolbar = false;
	let toolbarPosition = { top: 0, left: 0 };
	let showLinkModal = false;
	let linkUrl = '';
	let linkModalPosition = { top: 0, left: 0 };
	let selectedTextForLink = { start: 0, end: 0, text: '' };
	
	function buildContent(): TextBlockContent {
		return { text, textAlign };
	}
	
	function handleTextChange() {
		notifyContentChange();
	}
	
	function handleTextAlignChange(align: 'left' | 'center' | 'right') {
		textAlign = align;
		notifyContentChange();
	}
	
	function notifyContentChange() {
		dispatch('contentChange', { content: buildContent() });
	}
	
	function handleBack() {
		dispatch('save', { content: buildContent() });
		dispatch('back');
	}
	
	// Toolbar functions
	function handleTextSelect() {
		if (!textarea) {
			showToolbar = false;
			return;
		}
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		
		// No text selected
		if (start === end) {
			showToolbar = false;
			return;
		}
		
		// Calculate position based on cursor position
		const textareaRect = textarea.getBoundingClientRect();
		const textBeforeCursor = text.substring(0, start);
		const lines = textBeforeCursor.split('\n');
		const currentLine = lines.length;
		
		// Approximate position (centered above textarea)
		toolbarPosition = {
			top: Math.max(10, currentLine * 20 - 40),
			left: Math.max(0, (textareaRect.width / 2) - 150)
		};
		
		showToolbar = true;
	}
	
	function insertFormat(prefix: string, suffix: string = '') {
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = text.substring(start, end);
		
		if (!selectedText) return;
		
		const before = text.substring(0, start);
		const after = text.substring(end);
		
		text = before + prefix + selectedText + suffix + after;
		
		showToolbar = false;
		notifyContentChange();
		
		// Restore focus
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + prefix.length, end + prefix.length);
		}, 0);
	}
	
	function insertLink() {
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = text.substring(start, end);
		
		if (!selectedText) return;
		
		// Store selection info
		selectedTextForLink = { start, end, text: selectedText };
		
		// Calculate modal position (centered)
		const textareaRect = textarea.getBoundingClientRect();
		linkModalPosition = {
			top: Math.max(10, toolbarPosition.top + 50),
			left: Math.max(0, (textareaRect.width / 2) - 150)
		};
		
		// Show link modal
		linkUrl = 'https://';
		showToolbar = false;
		showLinkModal = true;
		
		// Focus input after render
		setTimeout(() => {
			const input = document.getElementById('link-url-input');
			if (input) {
				(input as HTMLInputElement).focus();
				(input as HTMLInputElement).select();
			}
		}, 50);
	}
	
	function confirmLink() {
		if (!linkUrl || !textarea) {
			showLinkModal = false;
			return;
		}
		
		const before = text.substring(0, selectedTextForLink.start);
		const after = text.substring(selectedTextForLink.end);
		
		text = before + `[${selectedTextForLink.text}](${linkUrl})` + after;
		
		showLinkModal = false;
		linkUrl = '';
		notifyContentChange();
		
		// Restore focus
		setTimeout(() => textarea.focus(), 0);
	}
	
	function cancelLink() {
		showLinkModal = false;
		linkUrl = '';
		setTimeout(() => textarea.focus(), 0);
	}
	
	function handleLinkKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			confirmLink();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			cancelLink();
		}
	}
	
	function insertHeading(level: number) {
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = text.indexOf('\n', start);
		const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;
		
		const before = text.substring(0, lineStart);
		const line = text.substring(lineStart, actualLineEnd);
		const after = text.substring(actualLineEnd);
		
		// Remove existing heading markers (1-6 hashes)
		const cleanLine = line.replace(/^#{1,6}\s*/, '');
		const prefix = '#'.repeat(level) + ' ';
		
		text = before + prefix + cleanLine + after;
		
		showToolbar = false;
		notifyContentChange();
		
		setTimeout(() => textarea.focus(), 0);
	}
	
	$: previewHtml = parseMarkdown(text, textAlign);
</script>

<div class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
	<!-- Header -->
	<div class="px-6 py-4 border-b border-gray-200">
		<div class="flex items-center gap-3">
			<button
				on:click={handleBack}
				class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			
			<!-- Icon -->
			<div class="icon-ios w-12 h-12 flex-shrink-0">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
				</svg>
			</div>
			
			<div>
				<h2 class="text-2xl font-bold text-gray-900">Text Block</h2>
				<p class="text-sm text-gray-500">Add formatted text content</p>
			</div>
		</div>
	</div>
	
	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-6">
		<!-- Text Editor -->
		<div class="mb-6 form-section-ios">
			<label class="form-label-ios">Content</label>
			<div class="relative">
				<textarea
					bind:this={textarea}
					bind:value={text}
					on:input={handleTextChange}
					on:mouseup={handleTextSelect}
					placeholder="Enter your text here...&#10;&#10;Use # or ## or ### for headings&#10;Use **bold** or *italic*&#10;Use ==highlight==&#10;Use [link](url)"
					class="input-ios min-h-[200px] resize-y font-mono text-sm"
					rows="10"
				></textarea>
				
				<!-- Floating Toolbar -->
				{#if showToolbar}
					<div 
						class="absolute z-10 bg-gray-900 text-white rounded-lg shadow-xl p-1 flex gap-1"
						style="top: {toolbarPosition.top}px; left: {toolbarPosition.left}px;"
					>
						<button type="button" on:click={() => insertHeading(1)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs font-bold" title="Heading 1 (28px)">H1</button>
						<button type="button" on:click={() => insertHeading(2)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs font-bold" title="Heading 2 (22px)">H2</button>
						<button type="button" on:click={() => insertHeading(3)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs font-bold" title="Heading 3 (18px)">H3</button>
						<button type="button" on:click={() => insertHeading(4)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs" title="Heading 4 (16px)">H4</button>
						<button type="button" on:click={() => insertHeading(5)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs" title="Heading 5 (15px)">H5</button>
						<button type="button" on:click={() => insertHeading(6)} class="px-2 py-1 hover:bg-gray-700 rounded text-xs" title="Heading 6 (14px)">H6</button>
						<div class="w-px bg-gray-700"></div>
						<button type="button" on:click={() => insertFormat('**', '**')} class="px-2 py-1 hover:bg-gray-700 rounded text-xs font-bold" title="Bold">B</button>
						<button type="button" on:click={() => insertFormat('*', '*')} class="px-2 py-1 hover:bg-gray-700 rounded text-xs italic" title="Italic">I</button>
						<button type="button" on:click={() => insertFormat('==', '==')} class="px-2.5 py-1 hover:bg-gray-700 rounded text-xs font-bold bg-yellow-300 text-gray-900" title="Highlight">H</button>
						<div class="w-px bg-gray-700"></div>
						<button type="button" on:click={insertLink} class="px-2 py-1 hover:bg-gray-700 rounded text-xs" title="Insert Link">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
						</button>
					</div>
				{/if}
				
				<!-- Link Modal -->
				{#if showLinkModal}
					<div 
						class="absolute z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80"
						style="top: {linkModalPosition.top}px; left: {linkModalPosition.left}px;"
					>
						<div class="flex items-center gap-2 mb-3">
							<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
							<h4 class="text-sm font-semibold text-gray-900">Insert Link</h4>
						</div>
						
						<div class="mb-3">
							<label class="text-xs font-medium text-gray-600 mb-1.5 block">URL</label>
							<input
								id="link-url-input"
								type="text"
								bind:value={linkUrl}
								on:keydown={handleLinkKeydown}
								placeholder="https://example.com"
								class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
							/>
						</div>
						
						<div class="flex gap-2">
							<button
								type="button"
								on:click={cancelLink}
								class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								on:click={confirmLink}
								class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
							>
								Insert
							</button>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Formatting Guide - iOS Style -->
			<div class="mt-3 card-ios p-4 bg-gradient-to-br from-gray-50 to-gray-100">
				<div class="flex items-center gap-2 mb-3">
					<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<h4 class="text-sm font-semibold text-gray-900">Markdown Syntax Guide</h4>
				</div>
				
				<div class="space-y-2.5">
					<!-- Headings -->
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 w-20 text-xs font-medium text-gray-700">Headings</div>
						<div class="flex-1 flex flex-wrap gap-1.5">
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">#</code>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">##</code>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">###</code>
							<span class="text-xs text-gray-600">to</span>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">######</code>
							<span class="text-xs text-gray-600 italic">(H1-H6)</span>
						</div>
					</div>
					
					<!-- Text Styling -->
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 w-20 text-xs font-medium text-gray-700">Styling</div>
						<div class="flex-1 flex flex-wrap gap-1.5">
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">**bold**</code>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">*italic*</code>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">==highlight==</code>
						</div>
					</div>
					
					<!-- Links & Divider -->
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 w-20 text-xs font-medium text-gray-700">Elements</div>
						<div class="flex-1 flex flex-wrap gap-1.5">
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">[text](url)</code>
							<span class="text-xs text-gray-600">link</span>
							<span class="text-gray-400">•</span>
							<code class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900">---</code>
							<span class="text-xs text-gray-600">divider</span>
						</div>
					</div>
				</div>
				
				<div class="mt-3 pt-3 border-t border-gray-300">
					<p class="text-xs text-gray-700 flex items-center gap-1.5">
						<svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
						<span><strong>Tip:</strong> Select text to use the formatting toolbar, or type markdown directly</span>
					</p>
				</div>
			</div>
		</div>
		
		<!-- Text Align -->
		<div class="mb-6">
			<label class="form-label-ios">Text Align</label>
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					on:click={() => handleTextAlignChange('left')}
					class="py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400 text-sm font-medium flex items-center justify-center gap-2"
					class:border-green-500={textAlign === 'left'}
					class:bg-green-50={textAlign === 'left'}
					class:text-green-600={textAlign === 'left'}
					class:border-gray-200={textAlign !== 'left'}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
					</svg>
					Left
				</button>
				<button
					type="button"
					on:click={() => handleTextAlignChange('center')}
					class="py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400 text-sm font-medium flex items-center justify-center gap-2"
					class:border-green-500={textAlign === 'center'}
					class:bg-green-50={textAlign === 'center'}
					class:text-green-600={textAlign === 'center'}
					class:border-gray-200={textAlign !== 'center'}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
					</svg>
					Center
				</button>
				<button
					type="button"
					on:click={() => handleTextAlignChange('right')}
					class="py-2.5 px-3 rounded-lg border-2 transition-all hover:border-green-400 text-sm font-medium flex items-center justify-center gap-2"
					class:border-green-500={textAlign === 'right'}
					class:bg-green-50={textAlign === 'right'}
					class:text-green-600={textAlign === 'right'}
					class:border-gray-200={textAlign !== 'right'}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
					</svg>
					Right
				</button>
			</div>
		</div>
		
		<!-- Preview -->
		<div class="border-t border-gray-200 pt-6">
			<label class="form-label-ios mb-3">👁️ Preview</label>
			<div class="card-ios p-6 min-h-[100px]">
				{#if text}
					<div class="max-w-none">
						{@html previewHtml}
					</div>
				{:else}
					<p class="text-gray-400 text-center">Your formatted text will appear here</p>
				{/if}
			</div>
		</div>
	</div>
</div>
