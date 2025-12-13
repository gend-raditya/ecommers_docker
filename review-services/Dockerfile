FROM python:3.11-slim

WORKDIR /app

COPY  requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

#copy semua file kedalam container
COPY . .

#expose port
EXPOSE 5002

#jalankan aplikasi
CMD ["python", "app.py"]