FROM node:16-slim

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install JavaScript packages
RUN npm install --no-save \
    express \
    lodash \
    moment \
    chart.js \
    d3 \
    axios

# Create a non-root user to run the code
RUN useradd -m -u 1000 codeuser
USER codeuser

# Set up the execution environment
COPY --chown=codeuser:codeuser ./runner.js /app/runner.js

# Command to run when the container starts
CMD ["node", "/app/runner.js"]