import cv2

# Cargar el clasificador de detección de rostros
face_cascade = cv2.CascadeClassifier('facee.xml')

# Inicializar la captura de la cámara (índice 0 para la cámara predeterminada)
cap = cv2.VideoCapture(0)

# Verificar si la cámara se abrió correctamente
if not cap.isOpened():
    print("Error al abrir la cámara.")
    exit()

while True:
    # Capturar un fotograma de la cámara
    ret, img = cap.read()

    if not ret:
        print("Error al capturar el fotograma de la cámara")
        break

    # Reflejar horizontalmente la imagen
    img = cv2.flip(img, 1)

    # Convertir el fotograma a escala de grises
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Detectar rostros en el fotograma
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    # Dibujar rectángulos alrededor de los rostros detectados
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)

    # Mostrar el fotograma con las caras detectadas
    cv2.imshow('img', img)

    # Salir del bucle si se presiona la tecla 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Liberar la captura de la cámara y cerrar la ventana
cap.release()
cv2.destroyAllWindows()

