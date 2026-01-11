import { createClient } from '@libsql/client';

export function createTursoClient(env: any) {
	return createClient({
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN
	});
}

// Wrapper to make Turso client compatible with D1 interface
export function wrapTursoClient(client: any) {
	return {
		prepare: (query: string) => {
			const boundParams: any[] = [];
			
			const methods = {
				bind: (...params: any[]) => {
					boundParams.push(...params);
					return methods; // Return self for chaining
				},
				first: async () => {
					try {
						const result = await client.execute({ sql: query, args: boundParams });
						return result.rows[0] || null;
					} catch (error) {
						console.error('[Turso] Query error (first):', error);
						throw error;
					}
				},
				all: async () => {
					try {
						const result = await client.execute({ sql: query, args: boundParams });
						return { results: result.rows };
					} catch (error) {
						console.error('[Turso] Query error (all):', error);
						throw error;
					}
				},
				run: async () => {
					try {
						const result = await client.execute({ sql: query, args: boundParams });
						return { 
							meta: { 
								last_row_id: Number(result.lastInsertRowid),
								changes: result.rowsAffected 
							} 
						};
					} catch (error) {
						console.error('[Turso] Query error (run):', error);
						throw error;
					}
				}
			};
			
			return methods;
		}
	};
}
