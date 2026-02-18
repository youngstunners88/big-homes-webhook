FROM python:3.12

RUN apt-get update && \
    apt-get install -y \
    libgtk-3-0 \
    libasound2 \
    libx11-xcb1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir camoufox[geoip]

# Pre-fetch browser (optional - can also do at runtime)
RUN camoufox fetch

COPY script.py .

CMD ["python3", "script.py"]