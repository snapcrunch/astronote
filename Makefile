.PHONY: docker-build docker-push run

docker-build:
	docker build -t tkambler/astronote .

docker-push:
	docker buildx build --platform linux/amd64,linux/arm64 -t tkambler/astronote:latest --push .

run:
	docker run --rm -p 8085:3009 --name astronote tkambler/astronote:latest