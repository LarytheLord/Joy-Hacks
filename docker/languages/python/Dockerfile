FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for data science and visualization
RUN pip install --no-cache-dir \
    numpy \
    pandas \
    matplotlib \
    seaborn \
    scikit-learn \
    flask

# Create a non-root user to run the code
RUN useradd -m -u 1000 codeuser
USER codeuser

# Set up the execution environment
COPY --chown=codeuser:codeuser ./runner.py /app/runner.py

# Command to run when the container starts
CMD ["python", "/app/runner.py"]