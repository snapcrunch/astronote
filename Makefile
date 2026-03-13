.PHONY: docker-build docker-push

docker-build:
	docker build -t tkambler/astronote .

docker-push:
	docker buildx build --platform linux/amd64,linux/arm64 -t tkambler/astronote:latest --push .