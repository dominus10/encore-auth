# Check if the Redis image exists
if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${IMAGE_NAME}$"; then
    echo "Pulling image ${IMAGE_NAME}..."
    docker pull ${IMAGE_NAME}
else
    echo "Image ${IMAGE_NAME} already exists, skipping pull."
fi

# Check if the Redis container exists
if ! docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "Running container ${CONTAINER_NAME}..."
    docker run --name ${CONTAINER_NAME} -p 6379:6379 -d ${IMAGE_NAME}
else
    echo "Container ${CONTAINER_NAME} already exists, skipping run."
fi