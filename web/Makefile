.PHONY: fix-and-check fix check dev start build gen-types

fix-and-check:
	make fix
	make check

fix:
	pnpm format:fix
	pnpm lint:fix

check:
	pnpm format
	pnpm lint

dev:
	pnpm dev

start:
	pnpm start

build:
	pnpm build

gen-types:
	supabase gen types typescript > src/lib/types.ts
