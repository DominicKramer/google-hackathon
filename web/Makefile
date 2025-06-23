.PHONY: fix-and-check fix check dev start build gen-types docker

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

docker:
	docker build $(cat .env.local | sed 's@^@--build-arg @g' | paste -s -d " " -) -t web . && docker run -p 3000:3000 web

deploy:
	gcloud run deploy web --source . --set-build-env-vars $(cat .env.local | sed 's@^@@g' | paste -s -d "," -) --allow-unauthenticated --region $(cat ../server/.env | grep GOOGLE_CLOUD_LOCATION | sed 's|GOOGLE_CLOUD_LOCATION=||g')
