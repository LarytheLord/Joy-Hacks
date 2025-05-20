FROM node:18-alpine

WORKDIR /app

# Install necessary packages for code execution
RUN apk add --no-cache python3 py3-pip openjdk11 gcc g++ make

# Install language-specific dependencies
RUN npm install -g nodemon typescript ts-node
RUN pip3 install pytest numpy pandas matplotlib

# Create a non-root user to run code
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Create directories for code execution
RUN mkdir -p /app/code /app/output
RUN chown -R coderunner:coderunner /app

# Copy execution scripts
COPY ./scripts/run.sh /app/run.sh
RUN chmod +x /app/run.sh

# Switch to non-root user
USER coderunner

CMD ["/bin/sh", "-c", "tail -f /dev/null"]