// R2 Storage helpers

export async function uploadToR2(
	bucket: R2Bucket,
	file: File,
	publicUrl: string
): Promise<{ url: string; storageKey: string }> {
	const ext = file.name.split('.').pop() || 'jpg';
	const storageKey = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	const arrayBuffer = await file.arrayBuffer();
	await bucket.put(storageKey, arrayBuffer, {
		httpMetadata: {
			contentType: file.type
		}
	});

	return {
		url: `${publicUrl}/${storageKey}`,
		storageKey
	};
}

export async function deleteFromR2(bucket: R2Bucket, storageKey: string) {
	await bucket.delete(storageKey);
}
